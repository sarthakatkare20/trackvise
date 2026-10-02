const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding trackvise database...');

  // Clean existing data
  await prisma.invoice.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.damage.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const superAdminHash = await bcrypt.hash('admin1234', 10);

  // 1. Create Super Admin user
  const superAdmin = await prisma.user.create({
    data: {
      name: 'trackvise Platform Admin',
      email: 'admin@trackvise.app',
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  // 2. Create Primary Demo Tenant: Mumbai Drive Rentals
  const mumbaiTenant = await prisma.tenant.create({
    data: {
      name: 'Mumbai Drive Rentals',
      ownerName: 'Vikramaditya Singhania',
      email: 'vikram@mumbaidrive.in',
      phone: '+91 98201 23456',
      address: 'Shop 14, Prime Mall, Linking Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      gstNumber: '27AABCS1429B1Z8',
      invoicePrefix: 'MDR-INV',
      bookingPrefix: 'MDR-BK',
      status: 'ACTIVE',
      subscriptions: {
        create: {
          plan: 'trackvise Standard',
          amount: 2999,
          status: 'ACTIVE',
          startDate: new Date('2026-01-01'),
          renewalDate: new Date('2026-12-31')
        }
      }
    }
  });

  // Create Business Admin for Mumbai Drive Rentals
  const demoAdmin = await prisma.user.create({
    data: {
      tenantId: mumbaiTenant.id,
      name: 'Vikramaditya Singhania',
      email: 'demo@trackvise.app',
      passwordHash: passwordHash,
      role: 'BUSINESS_ADMIN',
      status: 'ACTIVE'
    }
  });

  // Create Staff for Mumbai Drive
  await prisma.user.create({
    data: {
      tenantId: mumbaiTenant.id,
      name: 'Rajesh Patil',
      email: 'rajesh@mumbaidrive.in',
      passwordHash: passwordHash,
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  // 3. Create Secondary Tenant to demonstrate strict multi-tenant data isolation
  const goaTenant = await prisma.tenant.create({
    data: {
      name: 'Goa Coastline Self-Drive',
      ownerName: 'Clive Fernandes',
      email: 'clive@goacoastline.in',
      phone: '+91 98221 98765',
      address: 'Near Calangute Circle, Calangute',
      city: 'North Goa',
      state: 'Goa',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      gstNumber: '30AACCG5541C1Z4',
      invoicePrefix: 'GCS-INV',
      bookingPrefix: 'GCS-BK',
      status: 'ACTIVE',
      subscriptions: {
        create: {
          plan: 'trackvise Standard',
          amount: 2999,
          status: 'TRIAL',
          startDate: new Date('2026-09-01'),
          renewalDate: new Date('2026-10-01'),
          trialEndsAt: new Date('2026-10-15')
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      tenantId: goaTenant.id,
      name: 'Clive Fernandes',
      email: 'clive@goacoastline.in',
      passwordHash: passwordHash,
      role: 'BUSINESS_ADMIN',
      status: 'ACTIVE'
    }
  });

  // Add 2 cars for Goa tenant
  await prisma.car.createMany({
    data: [
      {
        tenantId: goaTenant.id,
        make: 'Mahindra',
        model: 'Thar',
        variant: 'LX 4x4 Soft Top',
        year: 2024,
        registrationNumber: 'GA 03 AB 4001',
        fuelType: 'Diesel',
        transmission: 'Manual',
        seats: 4,
        color: 'Rocky Beige',
        status: 'AVAILABLE',
        price12hr: 2500,
        price24hr: 4500,
        extraHourlyRate: 300,
        extraKmRate: 18,
        freeKmPerDay: 200,
        odometer: 18200,
        images: JSON.stringify(['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'])
      },
      {
        tenantId: goaTenant.id,
        make: 'Maruti Suzuki',
        model: 'Jimny',
        variant: 'Alpha 4WD',
        year: 2024,
        registrationNumber: 'GA 03 K 9900',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seats: 4,
        color: 'Kinetic Yellow',
        status: 'ON_RENT',
        price12hr: 2200,
        price24hr: 3800,
        extraHourlyRate: 250,
        extraKmRate: 15,
        freeKmPerDay: 200,
        odometer: 14100,
        images: JSON.stringify(['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'])
      }
    ]
  });

  // 4. Seed 10 realistic Indian cars for Mumbai Drive Rentals
  const carsData = [
    {
      make: 'Hyundai',
      model: 'Creta',
      variant: 'SX (O) Turbo',
      year: 2024,
      registrationNumber: 'MH 02 FZ 1024',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      color: 'Abyss Black',
      status: 'ON_RENT',
      price12hr: 2200,
      price24hr: 3800,
      extraHourlyRate: 250,
      extraKmRate: 15,
      freeKmPerDay: 300,
      odometer: 24500
    },
    {
      make: 'Mahindra',
      model: 'Thar',
      variant: 'LX 4x4 Hard Top',
      year: 2023,
      registrationNumber: 'MH 01 EA 4499',
      fuelType: 'Diesel',
      transmission: 'Manual',
      seats: 4,
      color: 'Napoli Black',
      status: 'ON_RENT',
      price12hr: 2800,
      price24hr: 4800,
      extraHourlyRate: 350,
      extraKmRate: 18,
      freeKmPerDay: 250,
      odometer: 31200
    },
    {
      make: 'Maruti Suzuki',
      model: 'Swift',
      variant: 'ZXi Plus',
      year: 2024,
      registrationNumber: 'MH 02 EG 3312',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: 5,
      color: 'Pearl Arctic White',
      status: 'AVAILABLE',
      price12hr: 1200,
      price24hr: 2000,
      extraHourlyRate: 150,
      extraKmRate: 12,
      freeKmPerDay: 250,
      odometer: 18400
    },
    {
      make: 'Toyota',
      model: 'Innova Crysta',
      variant: '2.4 ZX 7-Seater',
      year: 2023,
      registrationNumber: 'MH 04 KQ 8800',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      color: 'Silver Metallic',
      status: 'ON_RENT',
      price12hr: 3200,
      price24hr: 5500,
      extraHourlyRate: 400,
      extraKmRate: 20,
      freeKmPerDay: 300,
      odometer: 48900
    },
    {
      make: 'Tata',
      model: 'Nexon',
      variant: 'Fearless Plus S',
      year: 2024,
      registrationNumber: 'MH 03 DN 5521',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 5,
      color: 'Daytona Grey',
      status: 'AVAILABLE',
      price12hr: 1800,
      price24hr: 3200,
      extraHourlyRate: 200,
      extraKmRate: 14,
      freeKmPerDay: 250,
      odometer: 16800
    },
    {
      make: 'Mahindra',
      model: 'Scorpio-N',
      variant: 'Z8L 4xplor',
      year: 2024,
      registrationNumber: 'MH 02 GP 9012',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      color: 'Deep Forest Green',
      status: 'AVAILABLE',
      price12hr: 2900,
      price24hr: 5000,
      extraHourlyRate: 350,
      extraKmRate: 18,
      freeKmPerDay: 250,
      odometer: 19300
    },
    {
      make: 'Kia',
      model: 'Seltos',
      variant: 'GTX Plus',
      year: 2023,
      registrationNumber: 'MH 01 EN 7714',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      color: 'Imperial Blue',
      status: 'MAINTENANCE',
      price12hr: 2100,
      price24hr: 3600,
      extraHourlyRate: 250,
      extraKmRate: 15,
      freeKmPerDay: 250,
      odometer: 35400
    },
    {
      make: 'Honda',
      model: 'City',
      variant: 'ZX e:HEV Hybrid',
      year: 2023,
      registrationNumber: 'MH 02 DK 6211',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      color: 'Radiant Red Metallic',
      status: 'AVAILABLE',
      price12hr: 2000,
      price24hr: 3400,
      extraHourlyRate: 220,
      extraKmRate: 14,
      freeKmPerDay: 250,
      odometer: 28900
    },
    {
      make: 'Maruti Suzuki',
      model: 'Baleno',
      variant: 'Alpha AGS',
      year: 2023,
      registrationNumber: 'MH 04 HR 2244',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      color: 'Nexa Blue',
      status: 'AVAILABLE',
      price12hr: 1300,
      price24hr: 2200,
      extraHourlyRate: 160,
      extraKmRate: 12,
      freeKmPerDay: 250,
      odometer: 22100
    },
    {
      make: 'Tata',
      model: 'Harrier',
      variant: 'Fearless Plus Dark',
      year: 2024,
      registrationNumber: 'MH 01 FA 9988',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 5,
      color: 'Oberon Black',
      status: 'AVAILABLE',
      price12hr: 2700,
      price24hr: 4600,
      extraHourlyRate: 320,
      extraKmRate: 18,
      freeKmPerDay: 250,
      odometer: 14700
    }
  ];

  const carImageMap = {
    'Creta': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    'Thar': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    'Swift': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'Innova Crysta': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    'Nexon': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    'Scorpio-N': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    'Seltos': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    'City': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    'Baleno': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    'Harrier': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    'Jimny': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
  };

  const createdCars = [];
  for (const car of carsData) {
    const imgUrl = carImageMap[car.model] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
    const c = await prisma.car.create({
      data: {
        ...car,
        tenantId: mumbaiTenant.id,
        images: JSON.stringify([imgUrl]),
        rcExpiry: new Date('2038-05-15'),
        insuranceExpiry: new Date('2027-04-20'),
        pucExpiry: new Date('2026-11-10')
      }
    });
    createdCars.push(c);
  }

  // 5. Seed 20 realistic Indian customers
  const customersData = [
    { name: 'Rahul Sharma', phone: '+91 98190 11223', email: 'rahul.sharma@gmail.com', city: 'Mumbai', licenseNumber: 'MH02-2017-0045210' },
    { name: 'Pooja Mehta', phone: '+91 98205 44332', email: 'pooja.mehta@yahoo.com', city: 'Thane', licenseNumber: 'MH04-2019-0098311' },
    { name: 'Amit Verma', phone: '+91 97690 88776', email: 'amit.verma@outlook.com', city: 'Navi Mumbai', licenseNumber: 'MH43-2016-0012903' },
    { name: 'Sneha Kulkarni', phone: '+91 98211 55664', email: 'sneha.k@gmail.com', city: 'Pune', licenseNumber: 'MH12-2020-0087421' },
    { name: 'Rohan Deshmukh', phone: '+91 99203 77889', email: 'rohan.d@gmail.com', city: 'Mumbai', licenseNumber: 'MH01-2018-0056123' },
    { name: 'Kavita Nair', phone: '+91 98334 22115', email: 'kavita.nair@hotmail.com', city: 'Mumbai', licenseNumber: 'MH02-2015-0034981' },
    { name: 'Aditya Chopra', phone: '+91 98112 33445', email: 'aditya.c@gmail.com', city: 'Mumbai', licenseNumber: 'MH03-2021-0067332' },
    { name: 'Ananya Roy', phone: '+91 99301 66554', email: 'ananya.roy@gmail.com', city: 'Mumbai', licenseNumber: 'MH02-2022-0012554' },
    { name: 'Gaurav Jain', phone: '+91 98209 88990', email: 'gaurav.jain@gmail.com', city: 'Mumbai', licenseNumber: 'MH01-2016-0089124' },
    { name: 'Deepak Patel', phone: '+91 97694 44556', email: 'deepak.p@gmail.com', city: 'Surat', licenseNumber: 'GJ05-2018-0044129' },
    { name: 'Meera Iyer', phone: '+91 98202 33119', email: 'meera.iyer@gmail.com', city: 'Mumbai', licenseNumber: 'MH02-2019-0078231' },
    { name: 'Kunal Malhotra', phone: '+91 98198 77665', email: 'kunal.m@gmail.com', city: 'Delhi', licenseNumber: 'DL04-2017-0099881' },
    { name: 'Priyanka Sen', phone: '+91 98215 66778', email: 'priyanka.sen@gmail.com', city: 'Mumbai', licenseNumber: 'MH03-2020-0033451' },
    { name: 'Varun Joshi', phone: '+91 99207 11443', email: 'varun.joshi@gmail.com', city: 'Nashik', licenseNumber: 'MH15-2019-0066712' },
    { name: 'Tanvi Shah', phone: '+91 98331 99882', email: 'tanvi.shah@gmail.com', city: 'Mumbai', licenseNumber: 'MH02-2021-0023456' },
    { name: 'Nikhil Rane', phone: '+91 98195 22331', email: 'nikhil.rane@gmail.com', city: 'Mumbai', licenseNumber: 'MH01-2018-0088991' },
    { name: 'Shweta Bhatia', phone: '+91 98204 77112', email: 'shweta.b@gmail.com', city: 'Mumbai', licenseNumber: 'MH02-2016-0054321' },
    { name: 'Siddharth Menon', phone: '+91 97691 33448', email: 'sid.menon@gmail.com', city: 'Bengaluru', licenseNumber: 'KA03-2017-0077651' },
    { name: 'Zoya Khan', phone: '+91 98218 55442', email: 'zoya.khan@gmail.com', city: 'Mumbai', licenseNumber: 'MH03-2022-0098112' },
    { name: 'Harsh Vardhan', phone: '+91 99208 66221', email: 'harsh.v@gmail.com', city: 'Mumbai', licenseNumber: 'MH02-2018-0066129' }
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        tenantId: mumbaiTenant.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        city: c.city,
        address: `${c.city}, Maharashtra`,
        licenseNumber: c.licenseNumber,
        licenseExpiry: new Date('2035-10-10'),
        idProofType: 'Aadhaar',
        idProofNumber: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000)
      }
    });
    createdCustomers.push(cust);
  }

  // 6. Seed 20 realistic bookings across active, confirmed, completed, pending, cancelled
  const now = new Date('2026-09-30T10:00:00Z');
  const bookingsDef = [
    // Today's Active / Confirmed
    {
      custIdx: 0, carIdx: 0, // Rahul Sharma, Creta
      pOffsetDays: 0, dOffsetDays: 2,
      durationHours: 48, base: 7600, disc: 100, add: 0, total: 7500, adv: 2500, paid: 2500, rem: 5000,
      status: 'ACTIVE', pStatus: 'PARTIAL', notes: 'Pickup from Bandra Hub. Adv via UPI.'
    },
    {
      custIdx: 1, carIdx: 1, // Pooja Mehta, Thar
      pOffsetDays: 0, dOffsetDays: 1,
      durationHours: 24, base: 4800, disc: 0, add: 0, total: 4800, adv: 4800, paid: 4800, rem: 0,
      status: 'ACTIVE', pStatus: 'PAID', notes: 'Weekend trip to Lonavala.'
    },
    {
      custIdx: 2, carIdx: 3, // Amit Verma, Innova Crysta
      pOffsetDays: 0, dOffsetDays: 3,
      durationHours: 72, base: 16500, disc: 1000, add: 0, total: 15500, adv: 5000, paid: 5000, rem: 10500,
      status: 'ACTIVE', pStatus: 'PARTIAL', notes: 'Family airport pickup and Mahabaleshwar tour.'
    },
    {
      custIdx: 3, carIdx: 2, // Sneha Kulkarni, Swift
      pOffsetDays: 1, dOffsetDays: 2,
      durationHours: 24, base: 2000, disc: 0, add: 0, total: 2000, adv: 1000, paid: 1000, rem: 1000,
      status: 'CONFIRMED', pStatus: 'PARTIAL', notes: 'City driving in Pune.'
    },
    {
      custIdx: 4, carIdx: 4, // Rohan Deshmukh, Nexon
      pOffsetDays: 2, dOffsetDays: 4,
      durationHours: 48, base: 6400, disc: 400, add: 0, total: 6000, adv: 2000, paid: 2000, rem: 4000,
      status: 'CONFIRMED', pStatus: 'PARTIAL', notes: 'Confirmed with Aadhaar verification.'
    },
    {
      custIdx: 5, carIdx: 5, // Kavita Nair, Scorpio-N
      pOffsetDays: 3, dOffsetDays: 6,
      durationHours: 72, base: 15000, disc: 500, add: 0, total: 14500, adv: 0, paid: 0, rem: 14500,
      status: 'PENDING', pStatus: 'UNPAID', notes: 'Awaiting advance payment confirmation.'
    },
    {
      custIdx: 6, carIdx: 7, // Aditya Chopra, Honda City
      pOffsetDays: 1, dOffsetDays: 3,
      durationHours: 48, base: 6800, disc: 0, add: 0, total: 6800, adv: 3000, paid: 3000, rem: 3800,
      status: 'CONFIRMED', pStatus: 'PARTIAL', notes: 'Corporate business rental.'
    },
    {
      custIdx: 7, carIdx: 8, // Ananya Roy, Baleno
      pOffsetDays: 0, dOffsetDays: 1,
      durationHours: 24, base: 2200, disc: 0, add: 0, total: 2200, adv: 2200, paid: 2200, rem: 0,
      status: 'CONFIRMED', pStatus: 'PAID', notes: 'Self pickup 6 PM today.'
    },
    {
      custIdx: 8, carIdx: 9, // Gaurav Jain, Harrier
      pOffsetDays: 4, dOffsetDays: 6,
      durationHours: 48, base: 9200, disc: 200, add: 0, total: 9000, adv: 4000, paid: 4000, rem: 5000,
      status: 'CONFIRMED', pStatus: 'PARTIAL', notes: 'Advance received via Card.'
    },
    // Completed Bookings (Past)
    {
      custIdx: 9, carIdx: 0,
      pOffsetDays: -5, dOffsetDays: -3,
      durationHours: 48, base: 7600, disc: 0, add: 0, total: 7600, adv: 3000, paid: 7600, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Returned safely, clean vehicle.'
    },
    {
      custIdx: 10, carIdx: 1,
      pOffsetDays: -7, dOffsetDays: -5,
      durationHours: 48, base: 9600, disc: 600, add: 0, total: 9000, adv: 5000, paid: 9000, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Completed trip without any issues.'
    },
    {
      custIdx: 11, carIdx: 2,
      pOffsetDays: -4, dOffsetDays: -2,
      durationHours: 48, base: 4000, disc: 0, add: 0, total: 4000, adv: 2000, paid: 4000, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Completed.'
    },
    {
      custIdx: 12, carIdx: 3,
      pOffsetDays: -10, dOffsetDays: -7,
      durationHours: 72, base: 16500, disc: 500, add: 0, total: 16000, adv: 6000, paid: 16000, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Goa tour returned smoothly.'
    },
    {
      custIdx: 13, carIdx: 4,
      pOffsetDays: -3, dOffsetDays: -1,
      durationHours: 48, base: 6400, disc: 0, add: 0, total: 6400, adv: 3000, paid: 6400, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Returned, minor bumper scratch noted.'
    },
    {
      custIdx: 14, carIdx: 5,
      pOffsetDays: -6, dOffsetDays: -4,
      durationHours: 48, base: 10000, disc: 0, add: 0, total: 10000, adv: 5000, paid: 10000, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'All clear.'
    },
    {
      custIdx: 15, carIdx: 6, // Kia Seltos
      pOffsetDays: -8, dOffsetDays: -6,
      durationHours: 48, base: 7200, disc: 0, add: 0, total: 7200, adv: 3600, paid: 7200, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Sent for maintenance after this booking.'
    },
    {
      custIdx: 16, carIdx: 7,
      pOffsetDays: -12, dOffsetDays: -10,
      durationHours: 48, base: 6800, disc: 300, add: 0, total: 6500, adv: 3000, paid: 6500, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Paid full via UPI.'
    },
    {
      custIdx: 17, carIdx: 8,
      pOffsetDays: -2, dOffsetDays: -1,
      durationHours: 24, base: 2200, disc: 0, add: 0, total: 2200, adv: 2200, paid: 2200, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Quick 1-day trip.'
    },
    {
      custIdx: 18, carIdx: 9,
      pOffsetDays: -15, dOffsetDays: -12,
      durationHours: 72, base: 13800, disc: 800, add: 0, total: 13000, adv: 5000, paid: 13000, rem: 0,
      status: 'COMPLETED', pStatus: 'PAID', notes: 'Outstation trip completed.'
    },
    {
      custIdx: 19, carIdx: 0,
      pOffsetDays: 5, dOffsetDays: 7,
      durationHours: 48, base: 7600, disc: 0, add: 0, total: 7600, adv: 0, paid: 0, rem: 7600,
      status: 'CANCELLED', pStatus: 'UNPAID', notes: 'Customer cancelled due to plan change.'
    }
  ];

  const createdBookings = [];
  let bookingCounter = 100;
  for (const b of bookingsDef) {
    bookingCounter++;
    const pDate = new Date(now.getTime() + b.pOffsetDays * 86400000);
    const dDate = new Date(now.getTime() + b.dOffsetDays * 86400000);
    const bookingNumber = `TV-2026-${String(bookingCounter).padStart(6, '0')}`;

    const booking = await prisma.booking.create({
      data: {
        tenantId: mumbaiTenant.id,
        bookingNumber: bookingNumber,
        customerId: createdCustomers[b.custIdx].id,
        carId: createdCars[b.carIdx].id,
        pickupDate: pDate,
        pickupTime: '10:00',
        dropDate: dDate,
        dropTime: '10:00',
        pickupLocation: 'Bandra West Hub',
        dropLocation: 'Bandra West Hub',
        durationHours: b.durationHours,
        baseRentalPrice: b.base,
        discount: b.disc,
        additionalCharges: b.add,
        totalAmount: b.total,
        advanceAmount: b.adv,
        paidAmount: b.paid,
        remainingAmount: b.rem,
        status: b.status,
        paymentStatus: b.pStatus,
        notes: b.notes,
        startOdometer: createdCars[b.carIdx].odometer,
        endOdometer: b.status === 'COMPLETED' ? createdCars[b.carIdx].odometer + 320 : null,
        returnFuelLevel: b.status === 'COMPLETED' ? 'Full' : null
      }
    });
    createdBookings.push(booking);
  }

  // 7. Seed Payments (10 payments)
  const paymentsDef = [
    { bIdx: 0, amount: 2500, method: 'UPI', ref: 'UPI-98218821' },
    { bIdx: 1, amount: 4800, method: 'Card', ref: 'CARD-HDFC-9921' },
    { bIdx: 2, amount: 5000, method: 'UPI', ref: 'UPI-77129033' },
    { bIdx: 3, amount: 1000, method: 'Cash', ref: 'CASH-REC-101' },
    { bIdx: 4, amount: 2000, method: 'UPI', ref: 'UPI-44910231' },
    { bIdx: 6, amount: 3000, method: 'Bank Transfer', ref: 'IMPS-22001923' },
    { bIdx: 7, amount: 2200, method: 'UPI', ref: 'UPI-55019283' },
    { bIdx: 8, amount: 4000, method: 'Card', ref: 'CARD-ICICI-8812' },
    { bIdx: 9, amount: 3000, method: 'UPI', ref: 'UPI-66192831' },
    { bIdx: 9, amount: 4600, method: 'Cash', ref: 'CASH-REC-102' }
  ];

  for (const p of paymentsDef) {
    await prisma.payment.create({
      data: {
        tenantId: mumbaiTenant.id,
        bookingId: createdBookings[p.bIdx].id,
        amount: p.amount,
        method: p.method,
        reference: p.ref,
        notes: `Payment recorded via ${p.method}`,
        paidAt: new Date(now.getTime() - Math.floor(Math.random() * 5) * 86400000)
      }
    });
  }

  // 8. Seed Expenses (10 expenses)
  const expensesDef = [
    { carIdx: 0, category: 'Cleaning', amount: 800, desc: 'Deep interior sanitization and wash' },
    { carIdx: 1, category: 'Fuel', amount: 3500, desc: 'Tank fill prior to outstation trip' },
    { carIdx: 6, category: 'Maintenance', amount: 8500, desc: '40,000 km periodic service & brake pads replacement' },
    { carIdx: 3, category: 'Repair', amount: 2400, desc: 'Puncture repair and wheel balancing' },
    { carIdx: 4, category: 'Cleaning', amount: 600, desc: 'Foam wash and vacuuming' },
    { carIdx: 5, category: 'Insurance', amount: 18000, desc: 'Annual comprehensive insurance renewal' },
    { carIdx: 2, category: 'Maintenance', amount: 3200, desc: 'Oil filter and engine oil top-up' },
    { carIdx: null, category: 'Salary', amount: 25000, desc: 'Monthly driver & maintenance staff salary' },
    { carIdx: 7, category: 'Fuel', amount: 2000, desc: 'Petrol top-up for corporate client delivery' },
    { carIdx: 8, category: 'Cleaning', amount: 500, desc: 'Hub car wash' }
  ];

  for (const exp of expensesDef) {
    await prisma.expense.create({
      data: {
        tenantId: mumbaiTenant.id,
        carId: exp.carIdx !== null ? createdCars[exp.carIdx].id : null,
        category: exp.category,
        amount: exp.amount,
        date: new Date(now.getTime() - Math.floor(Math.random() * 10) * 86400000),
        description: exp.desc
      }
    });
  }

  // 9. Seed Damages (5 damage records)
  const damagesDef = [
    { bIdx: 13, carIdx: 4, custIdx: 13, desc: 'Minor scratch on rear bumper and right quarter panel', cCharge: 2000, rCost: 1200, status: 'REPAIRED' },
    { bIdx: 15, carIdx: 6, custIdx: 15, desc: 'Front bumper scrape and cracked fog lamp housing', cCharge: 4500, rCost: 3800, status: 'REPAIR_PENDING' },
    { bIdx: 10, carIdx: 1, custIdx: 10, desc: 'Side fender minor dent from parking obstacle', cCharge: 3000, rCost: 2200, status: 'CHARGED' },
    { bIdx: 1, carIdx: 1, custIdx: 1, desc: 'Alloy wheel edge scuff', cCharge: 1500, rCost: 1000, status: 'REPORTED' },
    { bIdx: 12, carIdx: 3, custIdx: 12, desc: 'Tailgate small scratch during luggage unloading', cCharge: 1200, rCost: 800, status: 'CLOSED' }
  ];

  for (const dmg of damagesDef) {
    await prisma.damage.create({
      data: {
        tenantId: mumbaiTenant.id,
        bookingId: createdBookings[dmg.bIdx].id,
        carId: createdCars[dmg.carIdx].id,
        customerId: createdCustomers[dmg.custIdx].id,
        description: dmg.desc,
        customerCharge: dmg.cCharge,
        repairCost: dmg.rCost,
        status: dmg.status,
        notes: `Recovery net: ₹${dmg.cCharge - dmg.rCost}`
      }
    });
  }

  // 10. Seed Invoices (10 invoices)
  let invCounter = 1;
  const invoiceBookings = [0, 1, 2, 9, 10, 11, 12, 13, 14, 16];
  for (const bIdx of invoiceBookings) {
    const bk = createdBookings[bIdx];
    const invNumber = `INV-2026-${String(invCounter).padStart(6, '0')}`;
    invCounter++;
    const taxRate = 18; // 18% GST
    const subtotal = bk.baseRentalPrice;
    const taxAmount = Math.round(subtotal * 0.18);
    const total = subtotal - bk.discount + taxAmount;

    await prisma.invoice.create({
      data: {
        tenantId: mumbaiTenant.id,
        bookingId: bk.id,
        invoiceNumber: invNumber,
        subtotal: subtotal,
        discount: bk.discount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        paid: bk.paidAmount,
        remaining: Math.max(0, total - bk.paidAmount),
        status: bk.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED'
      }
    });
  }

  console.log('Seeding completed successfully!');
  console.log('Demo Credentials:');
  console.log('Business Admin: demo@trackvise.app / demo1234');
  console.log('Super Admin:    admin@trackvise.app / admin1234');
  console.log('Tenant 2 Admin: clive@goacoastline.in / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
