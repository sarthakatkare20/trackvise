'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { OnboardingBanner } from '@/components/OnboardingBanner';
import {
  Car,
  CalendarCheck,
  IndianRupee,
  AlertCircle,
  Clock,
  TrendingUp,
  Key,
  Wrench,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { tenant, setOpenModal, refreshTrigger, triggerRefresh } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading && !stats) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(37, 99, 235, 0.2)',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>Loading operations telemetry...</div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const todayBookings = stats?.todayBookings || [];

  return (
    <div>
      {/* Onboarding Checklist for newly setup business */}
      {stats?.onboarding && <OnboardingBanner onboarding={stats.onboarding} />}

      {/* Executive Welcome & Actions Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)',
              background: 'var(--primary-light)',
              padding: '2px 8px',
              borderRadius: 6
            }}>
              Live Telemetry
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="title-xl">
            Operations Command Center
          </h1>
          <p className="text-body" style={{ marginTop: 2 }}>
            Real-time fleet dispatch, rental turnover and revenue collections for {tenant?.name || 'your fleet'}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setOpenModal('addCar')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <Car size={15} />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={() => setOpenModal('createBooking')}
            className="btn btn-primary"
            style={{ fontWeight: 700, padding: '10px 20px' }}
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Top 8 Telemetry KPI Cards */}
      <div className="kpi-grid">
        {/* Total Fleet */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total Fleet</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
              <Car size={16} />
            </div>
          </div>
          <div className="kpi-value">{kpis.totalCars ?? 0}</div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Active Fleet</span>
            <span>• Registered units</span>
          </div>
        </div>

        {/* Available Cars */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Available Cars</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#047857' }}>
            {kpis.availableCars ?? 0}
          </div>
          <div className="kpi-subtext" style={{ color: '#059669' }}>
            <span className="pulse-dot status-dot-green" />
            <span style={{ fontWeight: 600 }}>Ready for Instant Dispatch</span>
          </div>
        </div>

        {/* On Rent / Active Rentals */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>On Rent / Active</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
              <Key size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#b45309' }}>
            {kpis.onRentCars ?? 0}
          </div>
          <div className="kpi-subtext" style={{ color: '#b45309' }}>
            <span className="pulse-dot status-dot-amber" />
            <span style={{ fontWeight: 600 }}>{kpis.activeRentals ?? 0} Active Road Trips</span>
          </div>
        </div>

        {/* In Maintenance */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>In Maintenance</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
              <Wrench size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#b91c1c' }}>
            {kpis.maintenanceCars ?? 0}
          </div>
          <div className="kpi-subtext" style={{ color: '#b91c1c' }}>
            <span>Workshop / Servicing</span>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Today's Bookings</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="kpi-value">{kpis.todayBookings ?? 0}</div>
          <div className="kpi-subtext">
            <span>Pickups scheduled today</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Today's Revenue</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#047857' }}>
            ₹{(kpis.todayRevenue ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: '#059669' }}>
            <span style={{ fontWeight: 600 }}>Collected in cash ledger</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Pending Balance</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#b91c1c' }}>
            ₹{(kpis.pendingPayments ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: '#b91c1c' }}>
            <span>Outstanding collections</span>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>This Month Revenue</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            ₹{(kpis.monthRevenue ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext">
            <span>7-Day: ₹{(kpis.weekRevenue ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Revenue Velocity & Utilization Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 18,
        marginBottom: 26
      }}>
        {/* Cash Flow Velocity Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={15} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)' }}>
                Cash Flow Velocity
              </span>
            </div>
            <span className="badge badge-paid">
              Live Ledger
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
            <div style={{
              background: 'var(--bg-subtle)',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-light)'
            }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Today</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success-text)', marginTop: 4 }}>
                ₹{(kpis.todayRevenue ?? 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-light)'
            }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>7 Days</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)', marginTop: 4 }}>
                ₹{(kpis.weekRevenue ?? 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{
              background: 'rgba(37, 99, 235, 0.05)',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--primary-border)'
            }}>
              <div className="text-xs" style={{ color: 'var(--primary)', fontWeight: 700 }}>Month</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                ₹{(kpis.monthRevenue ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Utilization Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Layers size={15} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)' }}>
                Fleet Utilization Rate
              </span>
            </div>
            <span className="badge badge-confirmed" style={{ fontSize: 12, padding: '4px 10px' }}>
              {kpis.totalCars > 0 ? Math.round(((kpis.onRentCars || 0) / kpis.totalCars) * 100) : 0}% Active
            </span>
          </div>

          {/* Segmented Meter Bar */}
          <div style={{
            height: 14,
            background: 'var(--bg-subtle)',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            marginTop: 14,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div
              style={{
                width: `${kpis.totalCars > 0 ? ((kpis.onRentCars || 0) / kpis.totalCars) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`On Rent: ${kpis.onRentCars || 0}`}
            />
            <div
              style={{
                width: `${kpis.totalCars > 0 ? ((kpis.availableCars || 0) / kpis.totalCars) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`Available: ${kpis.availableCars || 0}`}
            />
            <div
              style={{
                width: `${kpis.totalCars > 0 ? ((kpis.maintenanceCars || 0) / kpis.totalCars) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`Maintenance: ${kpis.maintenanceCars || 0}`}
            />
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              On Rent: <strong>{kpis.onRentCars || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              Available: <strong>{kpis.availableCars || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              Workshop: <strong>{kpis.maintenanceCars || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Today's Bookings Table Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="title-md">Today's Rentals & Dispatches</h2>
            <p className="text-sm">Active vehicle operations scheduled for pickup or currently running.</p>
          </div>
          <button
            onClick={() => setOpenModal('createBooking')}
            className="btn btn-outline-primary btn-sm"
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} />
            <span>New Reservation</span>
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Car Details</th>
                <th>Pickup Window</th>
                <th>Return Window</th>
                <th>Total Fare</th>
                <th>Payment</th>
                <th>Rental Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <CalendarCheck size={28} color="var(--text-light)" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: 600, color: 'var(--navy-800)' }}>No rentals scheduled for today</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Create a new reservation to dispatch a car.</div>
                  </td>
                </tr>
              ) : (
                todayBookings.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                          color: '#3730a3',
                          fontWeight: 700,
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {b.customer?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                            {b.customer?.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {b.customer?.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                        {b.car?.make} {b.car?.model}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        background: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        marginTop: 2
                      }}>
                        {b.car?.registrationNumber}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{b.pickupTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{new Date(b.dropDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{b.dropTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 14 }}>
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </div>
                      {b.remainingAmount > 0 && (
                        <div style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>
                          Due: ₹{b.remainingAmount?.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${b.paymentStatus.toLowerCase()}`}>
                        <span className={`pulse-dot ${b.paymentStatus === 'PAID' ? 'status-dot-green' : b.paymentStatus === 'PARTIAL' ? 'status-dot-amber' : 'status-dot-red'}`} />
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {b.status === 'ACTIVE' && (
                          <button
                            onClick={() => setOpenModal('returnVehicle', { booking: b })}
                            className="btn btn-sm btn-primary"
                            style={{ background: 'var(--navy-900)' }}
                          >
                            Return Vehicle
                          </button>
                        )}
                        {b.remainingAmount > 0 && (
                          <button
                            onClick={() => setOpenModal('recordPayment', { booking: b })}
                            className="btn btn-sm btn-secondary"
                            style={{ fontWeight: 600 }}
                          >
                            Collect ₹
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

