import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      name,
      fullName,
      businessName,
      ownerName,
      email,
      phone,
      password,
      address,
      city,
      state,
      country = 'India',
      currency = 'INR',
      timezone = 'Asia/Kolkata',
      gstNumber,
      selectedPlan
    } = data;

    const finalName = (ownerName || fullName || name || '').trim();
    const finalBusiness = (businessName || `${finalName} Car Rentals`).trim();
    const finalEmail = (email || '').toLowerCase().trim();
    const finalPhone = (phone || '').trim();

    if (!finalName || !finalEmail || !password) {
      return NextResponse.json(
        { error: 'Please provide full name, email and password.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: finalEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create Tenant and Business Admin in a transaction
    const newTenant = await prisma.tenant.create({
      data: {
        name: finalBusiness,
        ownerName: finalName,
        email: finalEmail,
        phone: finalPhone || '+91 9800000000',
        address: address || '',
        city: city || 'Mumbai',
        state: state || 'Maharashtra',
        country: country,
        currency: currency,
        timezone: timezone,
        gstNumber: gstNumber || null,
        status: 'ACTIVE',
        users: {
          create: {
            name: finalName,
            email: finalEmail,
            passwordHash: hashedPassword,
            role: 'BUSINESS_ADMIN',
            status: 'ACTIVE'
          }
        },
        subscriptions: {
          create: {
            plan: selectedPlan ? `Trackvise ${selectedPlan}` : 'Trackvise Starter',
            amount: selectedPlan === 'Growth' ? 1999 : selectedPlan === 'Business' ? 2999 : selectedPlan === 'Enterprise' ? 4000 : 999,
            status: 'ACTIVE',
            startDate: new Date(),
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      include: {
        users: true,
        subscriptions: true
      }
    });

    const adminUser = newTenant.users[0];

    const token = signToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      tenantId: newTenant.id
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        tenantId: newTenant.id
      },
      tenant: newTenant,
      isOnboarding: true
    });

    response.cookies.set('trackvise_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register business tenant.' },
      { status: 500 }
    );
  }
}
