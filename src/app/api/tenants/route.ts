import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
          }
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve tenant settings.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN', 'BUSINESS_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      name,
      ownerName,
      phone,
      email,
      address,
      city,
      state,
      gstNumber,
      invoicePrefix,
      bookingPrefix,
      logo
    } = body;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: name ? name.trim() : undefined,
        ownerName: ownerName ? ownerName.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email ? email.trim() : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        gstNumber: gstNumber !== undefined ? gstNumber : undefined,
        invoicePrefix: invoicePrefix ? invoicePrefix.trim().toUpperCase() : undefined,
        bookingPrefix: bookingPrefix ? bookingPrefix.trim().toUpperCase() : undefined,
        logo: logo !== undefined ? logo : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update tenant profile.' }, { status: 500 });
  }
}

// Add staff member
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN', 'BUSINESS_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { name, email, password, role = 'STAFF' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        tenantId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role === 'BUSINESS_ADMIN' ? 'BUSINESS_ADMIN' : 'STAFF',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add staff.' }, { status: 500 });
  }
}
