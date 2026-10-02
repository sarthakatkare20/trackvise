'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { TrackviseLogo } from '@/components/TrackviseLogo';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  CreditCard,
  Receipt,
  AlertTriangle,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Building2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, tenant, activeView, setActiveView, logout } = useApp();

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet Management', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  const financeNav = [
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    { id: 'expenses', label: 'Expense Tracking', icon: Receipt },
    { id: 'invoices', label: 'GST Invoices', icon: FileText },
    { id: 'damages', label: 'Damage Claims', icon: AlertTriangle },
  ];

  const adminNav = [
    { id: 'pricing', label: 'Plans & Pricing', icon: Sparkles },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    adminNav.push({ id: 'superadmin', label: 'Super Admin HQ', icon: ShieldAlert });
  }

  const renderNavGroup = (title: string, items: typeof mainNav) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#475569',
        letterSpacing: '0.08em',
        padding: '0 12px 6px 12px'
      }}>
        {title}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: isActive ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: isActive ? '#60a5fa' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(96, 165, 250, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#60a5fa' : '#64748b'
                }}>
                  <Icon size={17} />
                </div>
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#60a5fa',
                  boxShadow: '0 0 8px #60a5fa'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Logo & Tagline */}
        <div style={{
          padding: '20px 20px 18px 20px',
          borderBottom: '1px solid var(--sidebar-border)'
        }}>
          <TrackviseLogo size="md" theme="dark" variant="full" />

          {/* Current Business Identity Card */}
          {tenant && (
            <div style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--sidebar-surface)',
              border: '1px solid var(--sidebar-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(37, 99, 235, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                fontWeight: 700,
                fontSize: 13
              }}>
                {tenant.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {tenant.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {tenant.city || 'India'} • {tenant.currency}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {renderNavGroup('Operations', mainNav)}
          {renderNavGroup('Finance & Recovery', financeNav)}
          {renderNavGroup('Administration', adminNav)}
        </nav>

        {/* User Profile & Logout Footer */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--sidebar-border)',
          background: 'rgba(9, 14, 24, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.name || 'Operator'}
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#60a5fa',
                  fontWeight: 500
                }}>
                  {user?.role === 'SUPER_ADMIN' ? 'Platform Owner' : user?.role === 'BUSINESS_ADMIN' ? 'Company Owner' : 'Operations Staff'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 7,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 14, 24, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 35
          }}
        />
      )}
    </>
  );
};

