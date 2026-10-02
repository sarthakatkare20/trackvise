import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { getAvailableFleet, checkCarAvailability, calculateDurationHours, calculateRentalPricing, parseDateTime } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { searchParams } = new URL(req.url);
    const pickupDate = searchParams.get('pickupDate');
    const pickupTime = searchParams.get('pickupTime') || '10:00';
    const dropDate = searchParams.get('dropDate');
    const dropTime = searchParams.get('dropTime') || '10:00';
    const carId = searchParams.get('carId');

    if (!pickupDate || !dropDate) {
      return NextResponse.json(
        { error: 'Pickup date and drop date are required.' },
        { status: 400 }
      );
    }

    const pickup = parseDateTime(pickupDate, pickupTime);
    const drop = parseDateTime(dropDate, dropTime);

    if (drop.getTime() <= pickup.getTime()) {
      return NextResponse.json(
        { error: 'Drop time must be after pickup time.' },
        { status: 400 }
      );
    }

    const durationHours = calculateDurationHours(pickup, drop);

    // If a specific car is requested, validate its availability
    if (carId) {
      const check = await checkCarAvailability(tenantId, carId, {
        pickupDate,
        pickupTime,
        dropDate,
        dropTime
      });

      if (!check.available) {
        // Find alternative available cars
        const fleet = await getAvailableFleet(tenantId, {
          pickupDate,
          pickupTime,
          dropDate,
          dropTime
        });

        return NextResponse.json({
          available: false,
          error: check.error,
          conflictingBooking: check.conflictingBooking,
          suggestedCars: fleet.availableCars
        }, { status: 409 });
      }

      const pricing = calculateRentalPricing(
        durationHours,
        check.car!.price12hr,
        check.car!.price24hr,
        check.car!.extraHourlyRate
      );

      return NextResponse.json({
        available: true,
        car: check.car,
        durationHours,
        pricing
      });
    }

    // Otherwise return list of all available fleet
    const fleet = await getAvailableFleet(tenantId, {
      pickupDate,
      pickupTime,
      dropDate,
      dropTime
    });

    const fleetWithPricing = fleet.availableCars.map((car) => {
      const pricing = calculateRentalPricing(
        durationHours,
        car.price12hr,
        car.price24hr,
        car.extraHourlyRate
      );
      return {
        ...car,
        calculatedPrice: pricing.basePrice,
        durationHours
      };
    });

    return NextResponse.json({
      durationHours,
      availableCars: fleetWithPricing,
      unavailableCars: fleet.unavailableCars,
      totalCars: fleet.totalCars
    });
  } catch (error: any) {
    console.error('Fleet availability check error:', error);
    return NextResponse.json({ error: 'Failed to verify fleet availability' }, { status: 500 });
  }
}
