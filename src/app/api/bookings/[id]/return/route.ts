import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      returnDateTime = new Date(),
      fuelLevel = 'Full',
      returnOdometer,
      hasDamage = false,
      damageDescription = '',
      customerCharge = 0,
      repairCost = 0,
      damagePhotos = [],
      sendToMaintenance = false,
      notes = ''
    } = body;

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, tenantId },
      include: { car: true, customer: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status !== 'ACTIVE' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Cannot return a booking that is currently ${booking.status}. It must be ACTIVE.` },
        { status: 400 }
      );
    }

    const odoValue = returnOdometer ? parseInt(returnOdometer, 10) : (booking.car.odometer + 150);

    const result = await prisma.$transaction(async (tx) => {
      // 1. If damage detected, create damage record
      let damageRecord = null;
      if (hasDamage && damageDescription.trim()) {
        const cCharge = parseFloat(customerCharge) || 0;
        const rCost = parseFloat(repairCost) || 0;

        damageRecord = await tx.damage.create({
          data: {
            tenantId,
            bookingId: booking.id,
            carId: booking.carId,
            customerId: booking.customerId,
            description: damageDescription.trim(),
            photos: JSON.stringify(damagePhotos),
            customerCharge: cCharge,
            repairCost: rCost,
            status: cCharge > 0 ? 'CHARGED' : 'REPORTED',
            notes: notes ? `Return Inspection: ${notes}` : 'Detected during vehicle return'
          }
        });

        // If extra damage charge applies, update booking additional charges and remaining amount
        if (cCharge > 0) {
          const newTotal = booking.totalAmount + cCharge;
          const newRemaining = Math.max(0, newTotal - booking.paidAmount);
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              additionalCharges: booking.additionalCharges + cCharge,
              totalAmount: newTotal,
              remainingAmount: newRemaining,
              paymentStatus: newRemaining <= 0 ? 'PAID' : 'PARTIAL'
            }
          });
        }
      }

      // 2. Complete Booking
      const completedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'COMPLETED',
          endOdometer: odoValue,
          returnFuelLevel: fuelLevel,
          notes: notes ? `${booking.notes ? booking.notes + ' | ' : ''}Return Note: ${notes}` : booking.notes
        },
        include: {
          car: true,
          customer: true,
          payments: true,
          damages: true
        }
      });

      // 3. Update Car status and odometer
      const carNewStatus = (hasDamage && sendToMaintenance) ? 'MAINTENANCE' : 'AVAILABLE';
      await tx.car.update({
        where: { id: booking.carId },
        data: {
          status: carNewStatus,
          odometer: Math.max(booking.car.odometer, odoValue)
        }
      });

      return { completedBooking, damageRecord, carNewStatus };
    });

    return NextResponse.json({
      success: true,
      message: 'Vehicle return inspection completed successfully.',
      ...result
    });
  } catch (error: any) {
    console.error('Vehicle return error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process vehicle return.' }, { status: 500 });
  }
}
