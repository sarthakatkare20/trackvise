import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const existing = await prisma.expense.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Expense deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete expense.' }, { status: 500 });
  }
}
