import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = { tenantId };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { make: { contains: search } },
        { model: { contains: search } },
        { registrationNumber: { contains: search } }
      ];
    }

    const cars = await prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            bookings: true,
            expenses: true,
            damages: true
          }
        }
      }
    });

    return NextResponse.json(cars);
  } catch (error: any) {
    console.error('Cars GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cars list.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN', 'BUSINESS_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      make,
      model,
      variant,
      year,
      registrationNumber,
      fuelType,
      transmission,
      seats = 5,
      color,
      status = 'AVAILABLE',
      images = [],
      price12hr = 1500,
      price24hr = 2500,
      extraHourlyRate = 150,
      extraKmRate = 12,
      freeKmPerDay = 250,
      rcExpiry,
      insuranceExpiry,
      pucExpiry,
      odometer = 0
    } = body;

    if (!make || !model || !registrationNumber || !fuelType || !transmission) {
      return NextResponse.json(
        { error: 'Missing required vehicle fields (Make, Model, Reg Number, Fuel Type, Transmission).' },
        { status: 400 }
      );
    }

    // Check if registration number already exists for this tenant
    const existing = await prisma.car.findFirst({
      where: {
        tenantId,
        registrationNumber: registrationNumber.toUpperCase().trim()
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Vehicle with registration number ${registrationNumber} already exists in your fleet.` },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        tenantId,
        make: make.trim(),
        model: model.trim(),
        variant: variant ? variant.trim() : null,
        year: parseInt(year, 10) || new Date().getFullYear(),
        registrationNumber: registrationNumber.toUpperCase().trim(),
        fuelType,
        transmission,
        seats: parseInt(seats, 10) || 5,
        color: color ? color.trim() : 'White',
        status,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        price12hr: parseFloat(price12hr) || 1500,
        price24hr: parseFloat(price24hr) || 2500,
        extraHourlyRate: parseFloat(extraHourlyRate) || 150,
        extraKmRate: parseFloat(extraKmRate) || 12,
        freeKmPerDay: parseInt(freeKmPerDay, 10) || 250,
        rcExpiry: rcExpiry ? new Date(rcExpiry) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        pucExpiry: pucExpiry ? new Date(pucExpiry) : null,
        odometer: parseInt(odometer, 10) || 0
      }
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error: any) {
    console.error('Cars POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create car.' },
      { status: 500 }
    );
  }
}
