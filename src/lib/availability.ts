import prisma from './prisma';

export interface BookingTimeWindow {
  pickupDate: string | Date;
  pickupTime: string; // "10:00"
  dropDate: string | Date;
  dropTime: string;   // "10:00"
}

export function parseDateTime(dateVal: string | Date, timeStr: string = '10:00'): Date {
  const d = new Date(dateVal);
  const [hours, minutes] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function calculateDurationHours(pickup: Date, drop: Date): number {
  const diffMs = drop.getTime() - pickup.getTime();
  if (diffMs <= 0) return 0;
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
}

export function calculateRentalPricing(
  hours: number,
  price12hr: number,
  price24hr: number,
  extraHourlyRate: number
) {
  if (hours <= 0) {
    return { days: 0, extraHours: 0, basePrice: 0 };
  }

  if (hours <= 12) {
    return {
      days: 0,
      extraHours: hours,
      basePrice: price12hr
    };
  }

  if (hours <= 24) {
    return {
      days: 1,
      extraHours: 0,
      basePrice: price24hr
    };
  }

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  let extraCost = 0;
  if (remHours > 0) {
    if (remHours <= 12 && price12hr < remHours * extraHourlyRate) {
      extraCost = price12hr;
    } else {
      extraCost = Math.min(price24hr, remHours * extraHourlyRate);
    }
  }

  const basePrice = days * price24hr + extraCost;
  return {
    days,
    extraHours: remHours,
    basePrice
  };
}

/**
 * Checks if a specific car is available for the given time window.
 * Returns { available: boolean, conflictingBooking?: any, error?: string }
 */
export async function checkCarAvailability(
  tenantId: string,
  carId: string,
  window: BookingTimeWindow,
  excludeBookingId?: string
) {
  const pickup = parseDateTime(window.pickupDate, window.pickupTime);
  const drop = parseDateTime(window.dropDate, window.dropTime);

  if (drop.getTime() <= pickup.getTime()) {
    return {
      available: false,
      error: 'Drop date and time must be after pickup date and time.'
    };
  }

  // Check car existence & status
  const car = await prisma.car.findFirst({
    where: { id: carId, tenantId }
  });

  if (!car) {
    return {
      available: false,
      error: 'Vehicle not found.'
    };
  }

  if (car.status === 'MAINTENANCE') {
    return {
      available: false,
      error: `Vehicle ${car.make} ${car.model} (${car.registrationNumber}) is currently in maintenance.`
    };
  }

  if (car.status === 'INACTIVE') {
    return {
      available: false,
      error: `Vehicle ${car.make} ${car.model} is inactive.`
    };
  }

  // Find all active/confirmed/pending bookings for this vehicle
  const existingBookings = await prisma.booking.findMany({
    where: {
      tenantId,
      carId,
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {})
    },
    include: {
      customer: { select: { name: true, phone: true } }
    }
  });

  // Check for any overlap: (existingPickup < requestedDrop) && (existingDrop > requestedPickup)
  for (const b of existingBookings) {
    const existingPickup = parseDateTime(b.pickupDate, b.pickupTime);
    const existingDrop = parseDateTime(b.dropDate, b.dropTime);

    if (existingPickup < drop && existingDrop > pickup) {
      return {
        available: false,
        conflictingBooking: b,
        error: `Double booking detected: Vehicle is already reserved/rented from ${existingPickup.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${b.pickupTime} to ${existingDrop.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${b.dropTime} by ${b.customer.name}.`
      };
    }
  }

  return { available: true, car };
}

/**
 * Returns all available cars for the tenant in the requested time window
 */
export async function getAvailableFleet(
  tenantId: string,
  window: BookingTimeWindow
) {
  const pickup = parseDateTime(window.pickupDate, window.pickupTime);
  const drop = parseDateTime(window.dropDate, window.dropTime);

  // Fetch all cars for tenant that are not MAINTENANCE or INACTIVE
  const allCars = await prisma.car.findMany({
    where: {
      tenantId,
      status: { notIn: ['MAINTENANCE', 'INACTIVE'] }
    },
    orderBy: { model: 'asc' }
  });

  // Fetch all overlapping bookings in this time window
  const activeBookings = await prisma.booking.findMany({
    where: {
      tenantId,
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] }
    }
  });

  const bookedCarIds = new Set<string>();

  for (const b of activeBookings) {
    const existingPickup = parseDateTime(b.pickupDate, b.pickupTime);
    const existingDrop = parseDateTime(b.dropDate, b.dropTime);

    if (existingPickup < drop && existingDrop > pickup) {
      bookedCarIds.add(b.carId);
    }
  }

  const availableCars = allCars.filter((car) => !bookedCarIds.has(car.id));
  const unavailableCars = allCars.filter((car) => bookedCarIds.has(car.id));

  return {
    availableCars,
    unavailableCars,
    totalCars: allCars.length
  };
}
