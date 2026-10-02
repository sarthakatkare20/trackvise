import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED'], // Active bookings must be completed via return inspection
  COMPLETED: [],
  CANCELLED: []
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { targetStatus } = await req.json();

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const currentStatus = booking.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition: Cannot change status from ${currentStatus} to ${targetStatus}. Allowed transitions: ${allowed.join(', ') || 'None'}.`
        },
        { status: 400 }
      );
    }

    // Perform updates
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: params.id },
        data: { status: targetStatus }
      });

      // Update vehicle status accordingly
      if (targetStatus === 'ACTIVE') {
        await tx.car.update({
          where: { id: booking.carId },
          data: { status: 'ON_RENT' }
        });
      } else if (targetStatus === 'CANCELLED') {
        // If it was cancelled, free car if it was on rent
        await tx.car.update({
          where: { id: booking.carId },
          data: { status: 'AVAILABLE' }
        });
      }

      return b;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Booking status transition error:', error);
    return NextResponse.json({ error: 'Failed to update booking status.' }, { status: 500 });
  }
}
