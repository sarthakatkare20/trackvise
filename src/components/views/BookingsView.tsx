'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle,
  Play,
  RotateCcw,
  FileText,
  Clock,
  Car,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const BookingsView: React.FC = () => {
  const { setOpenModal, refreshTrigger, triggerRefresh, showToast } = useApp();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let url = `/api/bookings?status=${statusFilter}&paymentStatus=${paymentFilter}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, paymentFilter, search, refreshTrigger]);

  const handleStatusTransition = async (bookingId: string, targetStatus: string) => {
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update booking status', 'error');
        return;
      }
      showToast(`Booking transitioned to ${targetStatus}!`, 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick summary metrics
  const summary = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'ACTIVE').length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const totalDue = bookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);
    return { total, active, confirmed, totalDue };
  }, [bookings]);

  const tabs = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'ACTIVE', label: 'Active on Road' },
    { id: 'PENDING', label: 'Pending Approval' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="title-xl">Booking Operations</h1>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              border: '1px solid rgba(37, 99, 235, 0.18)'
            }}>
              Lifecycle Dispatch Engine
            </span>
          </div>
          <p className="text-body" style={{ marginTop: 4 }}>
            Manage the full rental workflow: dispatch vehicle, capture security deposits, execute returns, and generate GST invoices.
          </p>
        </div>

        <button
          onClick={() => setOpenModal('createBooking')}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13.5 }}
        >
          <Plus size={16} />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Top Operations Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 24
      }}>
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(37, 99, 235, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Bookings
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)', fontFamily: 'var(--font-heading)' }}>
              {summary.total}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={20} fill="#059669" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active on Road
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              {summary.active}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Confirmed / Scheduled
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-heading)' }}>
              {summary.confirmed}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Uncollected Balance
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
              ₹{summary.totalDue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20
      }}>
        <div className="tabs-bar" style={{ marginBottom: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-control"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{ width: 140, padding: '8px 12px', fontSize: 13 }}
          >
            <option value="ALL">Payment: All</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search customer, vehicle, or TV#..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Rental Schedule</th>
                <th>Trip Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const initials = b.customer?.name
                    ? b.customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'CU';

                  return (
                    <tr key={b.id}>
                      {/* Booking ID */}
                      <td>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: 13,
                          color: 'var(--primary)',
                          background: 'var(--primary-subtle)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-block'
                        }}>
                          {b.bookingNumber}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                            color: '#3730a3',
                            fontWeight: 700,
                            fontSize: 11.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}
                              onClick={() => setOpenModal('customerDetail', { customerId: b.customerId })}
                            >
                              {b.customer?.name}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {b.customer?.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td>
                        <div
                          style={{ fontWeight: 700, cursor: 'pointer', color: 'var(--navy-900)' }}
                          onClick={() => setOpenModal('carDetail', { carId: b.carId })}
                        >
                          {b.car?.make} {b.car?.model}
                        </div>
                        <div style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          marginTop: 2
                        }}>
                          {b.car?.registrationNumber}
                        </div>
                      </td>

                      {/* Rental Schedule */}
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-900)' }}>
                          {new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {b.pickupTime}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          to {new Date(b.dropDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {b.dropTime}
                        </div>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--navy-700)',
                          background: 'var(--bg-subtle)',
                          padding: '1px 6px',
                          borderRadius: 4,
                          display: 'inline-block',
                          marginTop: 3
                        }}>
                          {b.durationHours} hrs duration
                        </span>
                      </td>

                      {/* Amount */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--navy-900)', fontSize: 14 }}>
                          ₹{b.totalAmount?.toLocaleString('en-IN')}
                        </div>
                        {b.remainingAmount > 0 ? (
                          <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginTop: 2 }}>
                            Due: ₹{b.remainingAmount?.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 2 }}>
                            Fully Settled
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td>
                        <span className={`badge badge-${b.paymentStatus.toLowerCase()}`}>
                          {b.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge badge-${b.status.toLowerCase()}`} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <span className={`status-dot ${
                            b.status === 'ACTIVE'
                              ? 'status-dot-blue'
                              : b.status === 'COMPLETED'
                              ? 'status-dot-green'
                              : b.status === 'CONFIRMED'
                              ? 'status-dot-green'
                              : 'status-dot-amber'
                          }`} />
                          {b.status}
                        </span>
                      </td>

                      {/* Lifecycle Action */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusTransition(b.id, 'CONFIRMED')}
                                className="btn btn-primary btn-sm"
                                disabled={actionInProgress === b.id}
                              >
                                <CheckCircle size={13} />
                                <span>Confirm</span>
                              </button>
                              <button
                                onClick={() => handleStatusTransition(b.id, 'CANCELLED')}
                                className="btn btn-secondary btn-sm"
                                disabled={actionInProgress === b.id}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleStatusTransition(b.id, 'ACTIVE')}
                                className="btn btn-primary btn-sm"
                                style={{ background: '#10b981' }}
                                title="Customer has picked up vehicle. Trip is now active."
                                disabled={actionInProgress === b.id}
                              >
                                <Play size={13} fill="#ffffff" />
                                <span>Start Trip</span>
                              </button>
                              {b.remainingAmount > 0 && (
                                <button
                                  onClick={() => setOpenModal('recordPayment', { booking: b })}
                                  className="btn btn-secondary btn-sm"
                                  title="Collect advance / balance"
                                >
                                  Collect ₹
                                </button>
                              )}
                            </>
                          )}

                          {b.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => setOpenModal('returnVehicle', { booking: b })}
                                className="btn btn-primary btn-sm"
                                style={{ background: 'var(--navy-900)' }}
                                title="Vehicle Return Inspection"
                              >
                                <RotateCcw size={13} />
                                <span>Inspect & Return</span>
                              </button>
                              {b.remainingAmount > 0 && (
                                <button
                                  onClick={() => setOpenModal('recordPayment', { booking: b })}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Collect ₹
                                </button>
                              )}
                            </>
                          )}

                          {b.status === 'COMPLETED' && (
                            <>
                              {b.invoices && b.invoices.length > 0 && (
                                <button
                                  onClick={() => setOpenModal('viewInvoice', { invoice: b.invoices[0] })}
                                  className="btn btn-outline-primary btn-sm"
                                  title="View GST Tax Invoice"
                                >
                                  <FileText size={13} />
                                  <span>GST Invoice</span>
                                </button>
                              )}
                              {b.remainingAmount > 0 && (
                                <button
                                  onClick={() => setOpenModal('recordPayment', { booking: b })}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Settle ₹
                                </button>
                              )}
                            </>
                          )}

                          {b.status === 'CANCELLED' && (
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
