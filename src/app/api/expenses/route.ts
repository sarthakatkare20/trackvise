import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const carId = searchParams.get('carId');

    const where: any = { tenantId };
    if (category && category !== 'ALL') where.category = category;
    if (carId) where.carId = carId;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        car: true
      }
    });

    // Compute monthly and category summaries
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    return NextResponse.json({
      expenses,
      summary: {
        totalAmount,
        categoryBreakdown,
        count: expenses.length
      }
    });
  } catch (error: any) {
    console.error('Expenses GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve expenses.' }, { status: 500 });
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
      category,
      amount,
      date = new Date(),
      description,
      receiptUrl
    } = body;

    const numAmount = parseFloat(amount);
    if (!category || isNaN(numAmount) || numAmount <= 0 || !description) {
      return NextResponse.json(
        { error: 'Category, valid amount, and description are required.' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        carId: carId || null,
        category,
        amount: numAmount,
        date: new Date(date),
        description: description.trim(),
        receiptUrl: receiptUrl ? receiptUrl.trim() : null
      },
      include: { car: true }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error('Expense POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record expense.' }, { status: 500 });
  }
}
