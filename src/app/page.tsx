'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';

// Views
import { AuthView } from '@/components/views/AuthView';
import { DashboardView } from '@/components/views/DashboardView';
import { FleetView } from '@/components/views/FleetView';
import { BookingsView } from '@/components/views/BookingsView';
import { CustomersView } from '@/components/views/CustomersView';
import { PaymentsView } from '@/components/views/PaymentsView';
import { ExpensesView } from '@/components/views/ExpensesView';
import { DamagesView } from '@/components/views/DamagesView';
import { InvoicesView } from '@/components/views/InvoicesView';
import { SettingsView } from '@/components/views/SettingsView';
import { PricingView } from '@/components/views/PricingView';
import { SuperAdminView } from '@/components/views/SuperAdminView';

// Modals
import { CreateBookingModal } from '@/components/modals/CreateBookingModal';
import { AddCarModal } from '@/components/modals/AddCarModal';
import { ReturnVehicleModal } from '@/components/modals/ReturnVehicleModal';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { AddDamageModal } from '@/components/modals/AddDamageModal';
import { InvoiceModal } from '@/components/modals/InvoiceModal';
import { CarDetailModal } from '@/components/modals/CarDetailModal';
import { CustomerDetailModal } from '@/components/modals/CustomerDetailModal';
import { TrackviseLogo } from '@/components/TrackviseLogo';

const MainApp: React.FC = () => {
  const { user, loading, activeView } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b1120',
        gap: 16
      }}>
        <TrackviseLogo size="lg" theme="dark" variant="full" />
        <div style={{
          color: '#60a5fa',
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 8
        }}>
          <span className="pulse-dot status-dot-green" />
          <span>Initializing Trackvise OS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-content">
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-body">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'fleet' && <FleetView />}
          {activeView === 'bookings' && <BookingsView />}
          {activeView === 'customers' && <CustomersView />}
          {activeView === 'payments' && <PaymentsView />}
          {activeView === 'expenses' && <ExpensesView />}
          {activeView === 'damages' && <DamagesView />}
          {activeView === 'invoices' && <InvoicesView />}
          {activeView === 'pricing' && <PricingView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'superadmin' && <SuperAdminView />}
        </main>
      </div>

      {/* Interactive Operational Modals */}
      <CreateBookingModal />
      <AddCarModal />
      <ReturnVehicleModal />
      <RecordPaymentModal />
      <AddCustomerModal />
      <AddExpenseModal />
      <AddDamageModal />
      <InvoiceModal />
      <CarDetailModal />
      <CustomerDetailModal />
    </div>
  );
};

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
