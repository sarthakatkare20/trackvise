# trackvise — The Operating System for Car Rental Businesses
> Production-grade Multi-Tenant SaaS MVP built specifically for self-drive and car rental operations in India.

---

## 1. Product Overview & Tagline

**trackvise — The Operating System for Car Rental Businesses**

trackvise is a multi-tenant SaaS platform built to unify the daily operations of car-rental and self-drive companies: fleet scheduling, booking reservations, customer identity compliance (Aadhaar & DL), payment ledger, vehicle return inspections, damage claims, expense tracking, and GST invoicing.

### First Target Market
**Indian car rental and self-drive businesses** (INR ₹ currency, GST compliance, Indian vehicle brands like Mahindra Thar/Scorpio, Hyundai Creta, Maruti Suzuki Swift, Toyota Innova Crysta, etc.).

---

## 2. Commercial Business Model
trackvise is sold as:
1. **Public Website**: ₹20,000 one-time setup/development fee (the tenant's public-facing customer booking portal).
2. **trackvise SaaS**: ₹2,999/month subscription for the internal operations management OS.
3. **Custom Development**: Paid custom modules quoted separately.

---

## 3. Multi-Tenant Architecture & Data Isolation

- **Single Codebase, Multiple Tenants**: Every business is an isolated tenant (e.g., Tenant A: *Mumbai Drive Rentals*, Tenant B: *Goa Coastline Self-Drive*).
- **Backend Authorization Isolation**: Every database entity (`Car`, `Booking`, `Customer`, `Payment`, `Expense`, `Damage`, `Invoice`) contains `tenantId`.
- **Zero Cross-Tenant Leakage**: Queries automatically enforce `WHERE tenantId = user.tenantId`. Tenant A can never view or manipulate Tenant B's fleet or customer records.

---

## 4. User Roles

| Role | Access & Capabilities |
| :--- | :--- |
| **Super Admin** | trackvise platform owner. View all tenants, platform MRR, total platform fleet, activate/suspend businesses, switch contexts. |
| **Business Admin** | Rental company owner. Full management of fleet, bookings, customers, payments ledger, damage recovery, expenses, staff, and GST settings. |
| **Staff** | Fleet operations team member. Simplified day-to-day dispatch, return inspections, and payment collection. |

---

## 5. Critical Core Engines & Modules

### 1. Booking Availability & Double Booking Prevention
- Real-time overlap detection on the backend: checks `(existingPickup < requestedDrop) AND (existingDrop > requestedPickup)`.
- If an overlap exists, booking creation is blocked with a human-readable conflict error and suggested available alternative vehicles.
- Automatic pricing calculation: 12-hour rate, 24-hour rate, extra hour charges, advance payments, and remaining balance.

### 2. Vehicle Return Flow & Inspection
- Returns active rentals with structured inspection:
  - Fuel level upon return (Full, 3/4, Half, 1/4, Low)
  - Return odometer reading
  - Damage detection toggle: records damage incident directly linked to Customer + Car + Booking
  - Maintenance routing: sends damaged vehicle straight to workshop if required
  - Automatically resets vehicle status to `AVAILABLE` (or `MAINTENANCE`) and updates booking to `COMPLETED`.

### 3. Payment Ledger
- Independent ledger tracking cash, UPI, card, and bank transfers with reference numbers.
- Live synchronization of `paidAmount`, `remainingAmount`, and payment status (`UNPAID`, `PARTIAL`, `PAID`).

### 4. Expense Management
- Category-wise tracking: Fuel, Maintenance, Repair, Insurance, Cleaning, Staff Salaries.
- Summary metrics and car-wise cost allocation.

### 5. Damage Claims & Net Margin
- Connects incident to Booking + Customer + Vehicle.
- Net Recovery calculation: `Customer Charge - Bodyshop Repair Cost = Net Margin`.

### 6. GST Invoicing
- Generates professional tax invoices with trackvise branding, tenant GSTIN, line item breakdowns, and print/PDF support.

---

## 6. Seeded Demo Accounts & Credentials

To explore and test multi-tenant isolation, the database is pre-seeded with realistic Indian data:

| Account | Email | Password | Role / Company |
| :--- | :--- | :--- | :--- |
| **Primary Business Admin** | `demo@trackvise.app` | `demo1234` | Business Admin — **Mumbai Drive Rentals** (10 cars, 20 customers, 20 bookings, payments, expenses, invoices) |
| **Platform Super Admin** | `admin@trackvise.app` | `admin1234` | **Super Admin** — Platform-wide MRR, tenant controls |
| **Secondary Tenant Admin** | `clive@goacoastline.in` | `demo1234` | Business Admin — **Goa Coastline Self-Drive** (Isolated fleet & bookings to verify zero cross-talk) |

---

## 7. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma SQLite schema
npx prisma db push

# 3. Seed demo data
node prisma/seed.js

# 4. Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your web browser.
