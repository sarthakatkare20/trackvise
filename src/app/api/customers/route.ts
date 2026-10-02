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

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { licenseNumber: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            remainingAmount: true,
            status: true,
            pickupDate: true
          },
          orderBy: { pickupDate: 'desc' }
        }
      }
    });

    // Compute aggregated metrics for each customer
    const customersWithMetrics = customers.map((c) => {
      const validBookings = c.bookings.filter((b) => b.status !== 'CANCELLED');
      const totalSpent = validBookings.reduce((sum, b) => sum + b.paidAmount, 0);
      const pendingAmount = validBookings.reduce((sum, b) => sum + b.remainingAmount, 0);
      const lastBooking = c.bookings.length > 0 ? c.bookings[0].pickupDate : null;

      return {
        ...c,
        totalBookings: validBookings.length,
        totalSpent,
        pendingAmount,
        lastBooking
      };
    });

    return NextResponse.json(customersWithMetrics);
  } catch (error: any) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve customers.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      city,
      licenseNumber,
      licenseExpiry,
      idProofType = 'Aadhaar',
      idProofNumber
    } = body;

    if (!name || !phone || !licenseNumber) {
      return NextResponse.json(
        { error: 'Customer name, phone number, and driving license are required.' },
        { status: 400 }
      );
    }

    // Check if phone or license already registered for this tenant
    const existing = await prisma.customer.findFirst({
      where: {
        tenantId,
        OR: [
          { phone: phone.trim() },
          { licenseNumber: licenseNumber.trim() }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A customer with this phone number or driving license is already registered.' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.toLowerCase().trim() : null,
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        idProofType,
        idProofNumber: idProofNumber ? idProofNumber.trim() : null
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Customer POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add customer.' }, { status: 500 });
  }
}
