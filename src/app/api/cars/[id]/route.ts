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

    const car = await prisma.car.findFirst({
      where: { id: params.id, tenantId },
      include: {
        bookings: {
          include: { customer: true },
          orderBy: { pickupDate: 'desc' },
          take: 10
        },
        expenses: {
          orderBy: { date: 'desc' },
          take: 10
        },
        damages: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve car' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN', 'BUSINESS_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();

    const existing = await prisma.car.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const updated = await prisma.car.update({
      where: { id: params.id },
      data: {
        make: body.make ?? existing.make,
        model: body.model ?? existing.model,
        variant: body.variant ?? existing.variant,
        year: body.year ? parseInt(body.year, 10) : existing.year,
        registrationNumber: body.registrationNumber ? body.registrationNumber.toUpperCase().trim() : existing.registrationNumber,
        fuelType: body.fuelType ?? existing.fuelType,
        transmission: body.transmission ?? existing.transmission,
        seats: body.seats ? parseInt(body.seats, 10) : existing.seats,
        color: body.color ?? existing.color,
        status: body.status ?? existing.status,
        images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : existing.images,
        price12hr: body.price12hr ? parseFloat(body.price12hr) : existing.price12hr,
        price24hr: body.price24hr ? parseFloat(body.price24hr) : existing.price24hr,
        extraHourlyRate: body.extraHourlyRate ? parseFloat(body.extraHourlyRate) : existing.extraHourlyRate,
        extraKmRate: body.extraKmRate ? parseFloat(body.extraKmRate) : existing.extraKmRate,
        freeKmPerDay: body.freeKmPerDay ? parseInt(body.freeKmPerDay, 10) : existing.freeKmPerDay,
        odometer: body.odometer ? parseInt(body.odometer, 10) : existing.odometer,
        rcExpiry: body.rcExpiry ? new Date(body.rcExpiry) : existing.rcExpiry,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : existing.insuranceExpiry,
        pucExpiry: body.pucExpiry ? new Date(body.pucExpiry) : existing.pucExpiry
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update car' }, { status: 500 });
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

    const existing = await prisma.car.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Check if there are active bookings
    const activeBooking = await prisma.booking.findFirst({
      where: {
        carId: params.id,
        status: { in: ['CONFIRMED', 'ACTIVE'] }
      }
    });

    if (activeBooking) {
      return NextResponse.json(
        { error: 'Cannot delete car with active or confirmed bookings. Please change status to INACTIVE instead.' },
        { status: 400 }
      );
    }

    await prisma.car.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
}
