'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TrackviseLogoIcon } from '@/components/TrackviseLogo';
import {
  Menu,
  Plus,
  Car,
  ChevronDown,
  Building2,
  Shield,
  RefreshCw,
  Search,
  Check,
  Zap,
  Globe
} from 'lucide-react';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, tenant, setOpenModal, logout, triggerRefresh } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefreshClick = () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="top-bar">
      {/* Left: Menu toggle & Active Business Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 9px', borderRadius: 8 }}
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        {/* Current Active Business Identity Badge (Non-switchable) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px 6px 8px',
            borderRadius: 10,
            border: '1px solid var(--border-light)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          {user?.role === 'SUPER_ADMIN' || !tenant ? (
            <TrackviseLogoIcon size={30} />
          ) : (
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}>
              <Building2 size={16} />
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: 'var(--navy-900)',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>{tenant ? tenant.name : 'Trackvise Platform Command'}</span>
              <span className="pulse-dot status-dot-green" title="Active Session" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 2 }}>
              {user?.role === 'SUPER_ADMIN'
                ? 'Super Administrator HQ'
                : `${tenant?.city || 'India'} • ${user?.role === 'BUSINESS_ADMIN' ? 'Business Admin' : 'Staff'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Telemetry, Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live Operations Telemetry Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(241, 245, 249, 0.75)',
          padding: '5px 12px',
          borderRadius: 20,
          border: '1px solid var(--border-light)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--navy-700)'
        }}>
          <span className="pulse-dot status-dot-green" />
          <span>Fleet Connected</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Action Buttons for Business Admin / Staff */}
        {user?.role !== 'SUPER_ADMIN' && (
          <>
            <button
              onClick={() => setOpenModal('addCar')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}
            >
              <Car size={15} color="var(--navy-700)" />
              <span>Add Vehicle</span>
            </button>

            <button
              onClick={() => setOpenModal('createBooking')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Booking</span>
            </button>
          </>
        )}

        {/* Quick Refresh Icon */}
        <button
          onClick={handleRefreshClick}
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 9px', borderRadius: 8 }}
          title="Refresh Data & Availability"
        >
          <RefreshCw
            size={15}
            style={{
              transition: 'transform 0.5s ease',
              transform: refreshing ? 'rotate(360deg)' : 'none'
            }}
          />
        </button>

        {/* User Account Menu with Logout */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px 4px 6px',
              borderRadius: 24,
              border: '1px solid var(--border-light)',
              background: '#ffffff',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-900)', lineHeight: 1.1 }}>
                {user?.name || 'Operator'}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {user?.role || 'User'}
              </span>
            </div>
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 220,
              background: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)',
              padding: 8,
              zIndex: 100,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  setUserMenuOpen(false);
                  await logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

