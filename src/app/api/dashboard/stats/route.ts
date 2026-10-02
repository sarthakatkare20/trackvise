import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant context required.' },
        { status: 400 }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Fleet status counts
    const totalCars = await prisma.car.count({ where: { tenantId } });
    const availableCars = await prisma.car.count({ where: { tenantId, status: 'AVAILABLE' } });
    const onRentCars = await prisma.car.count({ where: { tenantId, status: 'ON_RENT' } });
    const maintenanceCars = await prisma.car.count({ where: { tenantId, status: 'MAINTENANCE' } });

    // Active rentals count
    const activeRentals = await prisma.booking.count({
      where: { tenantId, status: 'ACTIVE' }
    });

    // Today's bookings count
    const todayBookingsCount = await prisma.booking.count({
      where: {
        tenantId,
        pickupDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Revenue calculations from Payments
    const todayPayments = await prisma.payment.aggregate({
      where: {
        tenantId,
        paidAt: { gte: todayStart, lte: todayEnd }
      },
      _sum: { amount: true }
    });

    const weekPayments = await prisma.payment.aggregate({
      where: {
        tenantId,
        paidAt: { gte: weekStart }
      },
      _sum: { amount: true }
    });

    const monthPayments = await prisma.payment.aggregate({
      where: {
        tenantId,
        paidAt: { gte: monthStart }
      },
      _sum: { amount: true }
    });

    // Pending payments from non-cancelled bookings
    const pendingAggregation = await prisma.booking.aggregate({
      where: {
        tenantId,
        status: { notIn: ['CANCELLED'] }
      },
      _sum: { remainingAmount: true }
    });

    // Today's Bookings list
    const todayBookings = await prisma.booking.findMany({
      where: {
        tenantId,
        OR: [
          { pickupDate: { gte: todayStart, lte: todayEnd } },
          { status: 'ACTIVE' }
        ]
      },
      include: {
        customer: true,
        car: true
      },
      orderBy: { pickupDate: 'asc' },
      take: 10
    });

    // Check onboarding checklist counts
    const totalCustomers = await prisma.customer.count({ where: { tenantId } });
    const totalBookings = await prisma.booking.count({ where: { tenantId } });

    const onboarding = {
      hasCar: totalCars > 0,
      hasPricing: totalCars > 0,
      hasCustomer: totalCustomers > 0,
      hasBooking: totalBookings > 0,
      isComplete: totalCars > 0 && totalCustomers > 0 && totalBookings > 0
    };

    return NextResponse.json({
      kpis: {
        totalCars,
        availableCars,
        onRentCars,
        maintenanceCars,
        todayBookings: todayBookingsCount,
        todayRevenue: todayPayments._sum.amount || 0,
        weekRevenue: weekPayments._sum.amount || 0,
        monthRevenue: monthPayments._sum.amount || 0,
        pendingPayments: pendingAggregation._sum.remainingAmount || 0,
        activeRentals
      },
      todayBookings,
      onboarding
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics.' },
      { status: 500 }
    );
  }
}
