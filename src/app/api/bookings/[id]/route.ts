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

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, tenantId },
      include: {
        customer: true,
        car: true,
        payments: {
          orderBy: { paidAt: 'desc' }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        damages: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve booking.' }, { status: 500 });
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
    const existing = await prisma.booking.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        pickupLocation: body.pickupLocation ?? existing.pickupLocation,
        dropLocation: body.dropLocation ?? existing.dropLocation,
        notes: body.notes ?? existing.notes
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update booking.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN', 'BUSINESS_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const existing = await prisma.booking.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Instead of destructive delete, set to CANCELLED unless super admin
    await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    });

    // If car was marked ON_RENT, make it available again
    await prisma.car.update({
      where: { id: existing.carId },
      data: { status: 'AVAILABLE' }
    });

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to cancel booking.' }, { status: 500 });
  }
}
