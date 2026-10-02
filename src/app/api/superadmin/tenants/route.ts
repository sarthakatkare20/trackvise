import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, status: true }
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            cars: true,
            bookings: true,
            customers: true
          }
        }
      }
    });

    const formattedTenants = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      ownerName: t.ownerName,
      email: t.email,
      phone: t.phone,
      city: t.city,
      state: t.state,
      status: t.status,
      createdAt: t.createdAt,
      carsCount: t._count.cars,
      bookingsCount: t._count.bookings,
      customersCount: t._count.customers,
      subscription: t.subscriptions[0] || null,
      adminUser: t.users.find((u) => u.role === 'BUSINESS_ADMIN') || t.users[0]
    }));

    return NextResponse.json(formattedTenants);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve tenants list.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const { tenantId, status, subscriptionStatus, plan } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required.' }, { status: 400 });
    }

    if (status) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { status }
      });
    }

    if (subscriptionStatus || plan) {
      const sub = await prisma.subscription.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: subscriptionStatus ?? sub.status,
            plan: plan ?? sub.plan
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Tenant updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update tenant status.' }, { status: 500 });
  }
}
