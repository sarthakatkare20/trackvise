'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Plus,
  Search,
  Eye,
  CalendarPlus,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { setOpenModal, refreshTrigger } = useApp();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    let url = '/api/customers';
    if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, refreshTrigger]);

  const summary = useMemo(() => {
    const total = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalPending = customers.reduce((sum, c) => sum + (c.pendingAmount || 0), 0);
    const totalTrips = customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
    return { total, totalSpent, totalPending, totalTrips };
  }, [customers]);

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
            <h1 className="title-xl">Customer Directory</h1>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              border: '1px solid rgba(37, 99, 235, 0.18)'
            }}>
              KYC & License Verified
            </span>
          </div>
          <p className="text-body" style={{ marginTop: 4 }}>
            Customer profiles, driving license compliance records, lifetime trip spend, and pending dues.
          </p>
        </div>

        <button
          onClick={() => setOpenModal('addCustomer')}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13.5 }}
        >
          <Plus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Top Customer KPI Ribbon */}
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
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Registered Drivers
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
            <CreditCard size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Lifetime Revenue
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              ₹{summary.totalSpent.toLocaleString('en-IN')}
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
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Outstanding Balance
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
              ₹{summary.totalPending.toLocaleString('en-IN')}
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
              Completed Rentals
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-heading)' }}>
              {summary.totalTrips}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', width: 340 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone, or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>License & KYC</th>
                <th>Trips</th>
                <th>Lifetime Value</th>
                <th>Pending Balance</th>
                <th>Last Rental</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    Loading customer profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const initials = c.name
                    ? c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'CU';

                  return (
                    <tr key={c.id}>
                      {/* Name with Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            fontSize: 12,
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
                              onClick={() => setOpenModal('customerDetail', { customerId: c.id, customer: c })}
                            >
                              {c.name}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {c.city || 'India'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.phone}</div>
                        {c.email && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {c.email}
                          </div>
                        )}
                      </td>

                      {/* License */}
                      <td>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--navy-800)'
                        }}>
                          {c.licenseNumber}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <ShieldCheck size={12} color="#059669" />
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                            {c.idProofType || 'Aadhaar'} Verified
                          </span>
                        </div>
                      </td>

                      {/* Trips */}
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {c.totalBookings} rentals
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>
                          ₹{c.totalSpent?.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Pending Balance */}
                      <td>
                        {c.pendingAmount > 0 ? (
                          <span className="badge badge-danger">
                            Due: ₹{c.pendingAmount?.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                            ₹0 (Clear)
                          </span>
                        )}
                      </td>

                      {/* Last Booking */}
                      <td>
                        <div style={{ fontSize: 12.5, color: 'var(--navy-800)' }}>
                          {c.lastBooking
                            ? new Date(c.lastBooking).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'No trips yet'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setOpenModal('customerDetail', { customerId: c.id, customer: c })}
                            className="btn btn-secondary btn-sm"
                          >
                            <Eye size={13} />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => setOpenModal('createBooking', { customerId: c.id })}
                            className="btn btn-outline-primary btn-sm"
                          >
                            <CalendarPlus size={13} />
                            <span>Book</span>
                          </button>
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
