import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { status: 'ACTIVE' } });
    const suspendedTenants = await prisma.tenant.count({ where: { status: 'SUSPENDED' } });

    const totalCars = await prisma.car.count();
    const totalBookings = await prisma.booking.count();
    const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });

    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    });

    const trialSubscriptions = await prisma.subscription.count({
      where: { status: 'TRIAL' }
    });

    // MRR calculation based on standard subscription fee ₹2,999/mo
    const mrr = activeSubscriptions * 2999;

    return NextResponse.json({
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalCars,
      totalBookings,
      totalPlatformRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      trialSubscriptions,
      mrr
    });
  } catch (error: any) {
    console.error('Superadmin stats error:', error);
    return NextResponse.json({ error: 'Failed to retrieve super admin metrics.' }, { status: 500 });
  }
}
