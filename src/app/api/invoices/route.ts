import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = { tenantId };
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { booking: { customer: { name: { contains: search } } } },
        { booking: { bookingNumber: { contains: search } } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            customer: true,
            car: true
          }
        },
        tenant: true
      }
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve invoices.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const { bookingId, taxRate = 18 } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
      include: { customer: true, car: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const count = await prisma.invoice.count({ where: { tenantId } });
    const prefix = tenant?.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    const invoiceNumber = `${prefix}-${year}-${String(count + 101).padStart(6, '0')}`;

    const subtotal = booking.baseRentalPrice;
    const discount = booking.discount;
    const numTaxRate = tenant?.gstNumber ? parseFloat(taxRate) : 0;
    const taxAmount = Math.round((subtotal - discount) * (numTaxRate / 100));
    const total = subtotal - discount + taxAmount + booking.additionalCharges;
    const paid = booking.paidAmount;
    const remaining = Math.max(0, total - paid);

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        bookingId,
        invoiceNumber,
        subtotal,
        discount,
        taxRate: numTaxRate,
        taxAmount,
        total,
        paid,
        remaining,
        status: remaining <= 0 ? 'PAID' : 'ISSUED'
      },
      include: {
        booking: {
          include: {
            customer: true,
            car: true,
            payments: true
          }
        },
        tenant: true
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Invoice POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate invoice.' }, { status: 500 });
  }
}
