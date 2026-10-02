import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const customer = await prisma.customer.findFirst({
      where: { id: params.id, tenantId },
      include: {
        bookings: {
          include: {
            car: true,
            payments: true
          },
          orderBy: { pickupDate: 'desc' }
        },
        damages: {
          include: { car: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    const validBookings = customer.bookings.filter((b) => b.status !== 'CANCELLED');
    const totalSpent = validBookings.reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingAmount = validBookings.reduce((sum, b) => sum + b.remainingAmount, 0);

    // Extract all payments across bookings
    const allPayments = customer.bookings.flatMap((b) =>
      b.payments.map((p) => ({
        ...p,
        bookingNumber: b.bookingNumber,
        carName: `${b.car.make} ${b.car.model}`
      }))
    ).sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

    return NextResponse.json({
      ...customer,
      totalBookings: validBookings.length,
      totalSpent,
      pendingAmount,
      payments: allPayments
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve customer.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const existing = await prisma.customer.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existing.name,
        phone: body.phone ?? existing.phone,
        email: body.email ?? existing.email,
        address: body.address ?? existing.address,
        city: body.city ?? existing.city,
        licenseNumber: body.licenseNumber ?? existing.licenseNumber,
        idProofType: body.idProofType ?? existing.idProofType,
        idProofNumber: body.idProofNumber ?? existing.idProofNumber
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update customer.' }, { status: 500 });
  }
}
