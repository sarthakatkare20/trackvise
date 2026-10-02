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
    const carId = searchParams.get('carId');

    const where: any = { tenantId };
    if (status && status !== 'ALL') where.status = status;
    if (carId) where.carId = carId;

    const damages = await prisma.damage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        car: true,
        customer: true,
        booking: true
      }
    });

    const totalCustomerCharges = damages.reduce((sum, d) => sum + d.customerCharge, 0);
    const totalRepairCosts = damages.reduce((sum, d) => sum + d.repairCost, 0);
    const netRecovery = totalCustomerCharges - totalRepairCosts;

    return NextResponse.json({
      damages,
      metrics: {
        totalDamages: damages.length,
        totalCustomerCharges,
        totalRepairCosts,
        netRecovery
      }
    });
  } catch (error: any) {
    console.error('Damages GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve damages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      carId,
      customerId,
      bookingId,
      description,
      customerCharge = 0,
      repairCost = 0,
      status = 'REPORTED',
      photos = [],
      notes
    } = body;

    if (!carId || !description) {
      return NextResponse.json(
        { error: 'Vehicle and damage description are required.' },
        { status: 400 }
      );
    }

    const cCharge = parseFloat(customerCharge) || 0;
    const rCost = parseFloat(repairCost) || 0;

    const damage = await prisma.damage.create({
      data: {
        tenantId,
        carId,
        customerId: customerId || null,
        bookingId: bookingId || null,
        description: description.trim(),
        customerCharge: cCharge,
        repairCost: rCost,
        status,
        photos: typeof photos === 'string' ? photos : JSON.stringify(photos),
        notes: notes ? notes.trim() : null
      },
      include: {
        car: true,
        customer: true,
        booking: true
      }
    });

    return NextResponse.json(damage, { status: 201 });
  } catch (error: any) {
    console.error('Damage POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record damage.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const { id, status, customerCharge, repairCost, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Damage ID required.' }, { status: 400 });
    }

    const existing = await prisma.damage.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Damage record not found.' }, { status: 404 });
    }

    const updated = await prisma.damage.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        customerCharge: customerCharge !== undefined ? parseFloat(customerCharge) : existing.customerCharge,
        repairCost: repairCost !== undefined ? parseFloat(repairCost) : existing.repairCost,
        notes: notes ?? existing.notes
      },
      include: {
        car: true,
        customer: true,
        booking: true
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update damage record.' }, { status: 500 });
  }
}
