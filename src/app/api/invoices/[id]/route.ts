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

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, tenantId },
      include: {
        booking: {
          include: {
            customer: true,
            car: true,
            payments: true
          }
        },
        tenant: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve invoice.' }, { status: 500 });
  }
}
