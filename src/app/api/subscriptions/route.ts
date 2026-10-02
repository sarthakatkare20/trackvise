import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const subscription = await prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    const carCount = await prisma.car.count({
      where: { tenantId }
    });

    return NextResponse.json({
      subscription: subscription || {
        plan: 'Trackvise Standard',
        amount: 2999,
        status: 'ACTIVE',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      carCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve subscription info.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN', 'BUSINESS_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const { plan, amount, billingCycle } = body;

    if (!plan || amount === undefined) {
      return NextResponse.json({ error: 'Plan name and amount are required.' }, { status: 400 });
    }

    const durationDays = billingCycle === 'ANNUAL' ? 365 : 30;
    const renewalDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const newSub = await prisma.subscription.create({
      data: {
        tenantId,
        plan: `Trackvise ${plan}`,
        amount: parseFloat(String(amount)),
        status: 'ACTIVE',
        renewalDate,
        startDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      subscription: newSub,
      message: `Successfully updated to Trackvise ${plan} plan!`
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upgrade subscription.' }, { status: 500 });
  }
}
