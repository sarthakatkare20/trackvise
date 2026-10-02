import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const method = searchParams.get('method');

    const where: any = { tenantId };
    if (bookingId) where.bookingId = bookingId;
    if (method && method !== 'ALL') where.method = method;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      include: {
        booking: {
          include: {
            customer: true,
            car: true
          }
        }
      }
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Payments GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve payments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      bookingId,
      amount,
      method = 'UPI',
      reference = '',
      notes = '',
      paidAt = new Date()
    } = body;

    const numAmount = parseFloat(amount);
    if (!bookingId || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid booking ID and payment amount are required.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tenantId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Process payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create payment record
      const payment = await tx.payment.create({
        data: {
          tenantId,
          bookingId,
          amount: numAmount,
          method,
          reference: reference.trim() || null,
          notes: notes.trim() || null,
          paidAt: new Date(paidAt)
        }
      });

      // 2. Update booking paid amount and status
      const newPaid = booking.paidAmount + numAmount;
      const newRemaining = Math.max(0, booking.totalAmount - newPaid);
      let newPaymentStatus = 'PARTIAL';
      if (newRemaining <= 0) {
        newPaymentStatus = 'PAID';
      } else if (newPaid <= 0) {
        newPaymentStatus = 'UNPAID';
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          paymentStatus: newPaymentStatus
        }
      });

      // 3. Update associated invoice if present
      const invoice = await tx.invoice.findFirst({
        where: { bookingId, tenantId }
      });

      if (invoice) {
        const invNewPaid = invoice.paid + numAmount;
        const invNewRemaining = Math.max(0, invoice.total - invNewPaid);
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paid: invNewPaid,
            remaining: invNewRemaining,
            status: invNewRemaining <= 0 ? 'PAID' : 'ISSUED'
          }
        });
      }

      return { payment, booking: updatedBooking };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Payment record error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record payment.' }, { status: 500 });
  }
}
