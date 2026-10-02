import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { checkCarAvailability, calculateDurationHours, calculateRentalPricing, parseDateTime, getAvailableFleet } from '@/lib/availability';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const carId = searchParams.get('carId');
    const customerId = searchParams.get('customerId');

    const where: any = { tenantId };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (carId) {
      where.carId = carId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { car: { model: { contains: search } } },
        { car: { registrationNumber: { contains: search } } }
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        car: true,
        payments: true,
        invoices: true,
        damages: true
      }
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.errorResponse) return auth.errorResponse;
    const tenantId = auth.tenantId!;

    const body = await req.json();
    const {
      customerId,
      newCustomer, // { name, phone, email, licenseNumber } if adding inline
      carId,
      pickupDate,
      pickupTime = '10:00',
      dropDate,
      dropTime = '10:00',
      pickupLocation = 'Hub Office',
      dropLocation = 'Hub Office',
      discount = 0,
      additionalCharges = 0,
      advanceAmount = 0,
      advancePaidNow = 0,
      paymentMethod = 'UPI',
      paymentReference = '',
      notes = ''
    } = body;

    let targetCustomerId = customerId;

    // Handle inline new customer creation if provided
    if (!targetCustomerId && newCustomer) {
      if (!newCustomer.name || !newCustomer.phone || !newCustomer.licenseNumber) {
        return NextResponse.json(
          { error: 'Customer name, phone, and driving license are required.' },
          { status: 400 }
        );
      }

      const createdCustomer = await prisma.customer.create({
        data: {
          tenantId,
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim(),
          email: newCustomer.email ? newCustomer.email.trim() : null,
          city: newCustomer.city || null,
          licenseNumber: newCustomer.licenseNumber.trim()
        }
      });
      targetCustomerId = createdCustomer.id;
    }

    if (!targetCustomerId || !carId || !pickupDate || !dropDate) {
      return NextResponse.json(
        { error: 'Customer, vehicle, pickup date and drop date are required.' },
        { status: 400 }
      );
    }

    // Double Booking Prevention on backend!
    const availability = await checkCarAvailability(tenantId, carId, {
      pickupDate,
      pickupTime,
      dropDate,
      dropTime
    });

    if (!availability.available) {
      // Fetch suggested alternative cars
      const fleet = await getAvailableFleet(tenantId, {
        pickupDate,
        pickupTime,
        dropDate,
        dropTime
      });

      return NextResponse.json(
        {
          error: availability.error || 'This vehicle is already booked during the selected period.',
          isDoubleBooking: true,
          conflictingBooking: availability.conflictingBooking,
          suggestedCars: fleet.availableCars
        },
        { status: 409 }
      );
    }

    const car = availability.car!;
    const pDate = parseDateTime(pickupDate, pickupTime);
    const dDate = parseDateTime(dropDate, dropTime);
    const durationHours = calculateDurationHours(pDate, dDate);

    const priceCalc = calculateRentalPricing(
      durationHours,
      car.price12hr,
      car.price24hr,
      car.extraHourlyRate
    );

    const baseRentalPrice = priceCalc.basePrice;
    const numDiscount = parseFloat(discount) || 0;
    const numAddCharges = parseFloat(additionalCharges) || 0;
    const totalAmount = Math.max(0, baseRentalPrice - numDiscount + numAddCharges);

    const numAdvance = parseFloat(advanceAmount) || 0;
    const numPaidNow = parseFloat(advancePaidNow) || 0;
    const remainingAmount = Math.max(0, totalAmount - numPaidNow);

    let paymentStatus = 'UNPAID';
    if (numPaidNow >= totalAmount && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (numPaidNow > 0) {
      paymentStatus = 'PARTIAL';
    }

    // Generate unique sequential Booking Number
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const count = await prisma.booking.count({ where: { tenantId } });
    const prefix = tenant?.bookingPrefix || 'TV';
    const year = new Date().getFullYear();
    const bookingNumber = `${prefix}-${year}-${String(count + 101).padStart(6, '0')}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        tenantId,
        bookingNumber,
        customerId: targetCustomerId,
        carId,
        pickupDate: pDate,
        pickupTime,
        dropDate: dDate,
        dropTime,
        pickupLocation,
        dropLocation,
        durationHours,
        baseRentalPrice,
        discount: numDiscount,
        additionalCharges: numAddCharges,
        totalAmount,
        advanceAmount: numAdvance,
        paidAmount: numPaidNow,
        remainingAmount,
        status: 'CONFIRMED',
        paymentStatus,
        notes,
        startOdometer: car.odometer
      },
      include: {
        customer: true,
        car: true
      }
    });

    // If advance payment recorded now, create payment ledger record
    if (numPaidNow > 0) {
      await prisma.payment.create({
        data: {
          tenantId,
          bookingId: booking.id,
          amount: numPaidNow,
          method: paymentMethod || 'UPI',
          reference: paymentReference || `ADV-${bookingNumber}`,
          notes: 'Advance payment collected at booking creation'
        }
      });
    }

    // Also auto-generate an initial invoice for the booking
    const invCount = await prisma.invoice.count({ where: { tenantId } });
    const invPrefix = tenant?.invoicePrefix || 'INV';
    const invoiceNumber = `${invPrefix}-${year}-${String(invCount + 101).padStart(6, '0')}`;
    const taxRate = tenant?.gstNumber ? 18 : 0;
    const taxAmount = Math.round(totalAmount * (taxRate / 100));
    const grandTotal = totalAmount + taxAmount;

    await prisma.invoice.create({
      data: {
        tenantId,
        bookingId: booking.id,
        invoiceNumber,
        subtotal: totalAmount,
        discount: numDiscount,
        taxRate,
        taxAmount,
        total: grandTotal,
        paid: numPaidNow,
        remaining: Math.max(0, grandTotal - numPaidNow),
        status: paymentStatus === 'PAID' ? 'PAID' : 'ISSUED'
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking.' },
      { status: 500 }
    );
  }
}
