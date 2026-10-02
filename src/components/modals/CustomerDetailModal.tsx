'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, User, Calendar, CreditCard, AlertTriangle, FileCheck } from 'lucide-react';

export const CustomerDetailModal: React.FC = () => {
  const { openModal, modalData, setOpenModal } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'damages'>('bookings');
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const customerId = modalData?.customerId || modalData?.customer?.id;

  useEffect(() => {
    if (openModal === 'customerDetail' && customerId) {
      setLoading(true);
      fetch(`/api/customers/${customerId}`)
        .then((res) => res.json())
        .then((data) => {
          setCustomer(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [openModal, customerId]);

  if (openModal !== 'customerDetail') return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 740, maxHeight: '90vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            {customer ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                  {customer.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {customer.phone} • {customer.city || 'India'}
                </div>
              </div>
            ) : (
              <div>Loading profile...</div>
            )}
          </div>
          <button
            onClick={() => setOpenModal(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {customer && (
          <>
            <div className="modal-body" style={{ maxHeight: '70vh' }}>
              {/* Profile Card & Financials */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 20
              }}>
                <div className="kpi-card" style={{ padding: 12 }}>
                  <div className="kpi-label">Total Bookings</div>
                  <div className="kpi-value" style={{ fontSize: 20 }}>{customer.totalBookings}</div>
                </div>
                <div className="kpi-card" style={{ padding: 12 }}>
                  <div className="kpi-label">Total Spent</div>
                  <div className="kpi-value" style={{ fontSize: 20, color: 'var(--success-text)' }}>
                    ₹{customer.totalSpent?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="kpi-card" style={{ padding: 12 }}>
                  <div className="kpi-label">Pending Amount</div>
                  <div className="kpi-value" style={{ fontSize: 20, color: customer.pendingAmount > 0 ? 'var(--danger-text)' : 'var(--navy-900)' }}>
                    ₹{customer.pendingAmount?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="kpi-card" style={{ padding: 12 }}>
                  <div className="kpi-label">Driving License</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)', marginTop: 4 }}>
                    {customer.licenseNumber}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs-bar">
                <button
                  className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  Bookings ({customer.bookings?.length || 0})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payments')}
                >
                  Payments ({customer.payments?.length || 0})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'damages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('damages')}
                >
                  Damage Incidents ({customer.damages?.length || 0})
                </button>
              </div>

              {activeTab === 'bookings' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Vehicle</th>
                        <th>Pickup</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.bookings?.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No bookings yet</td></tr>
                      ) : (
                        customer.bookings?.map((b: any) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600 }}>{b.bookingNumber}</td>
                            <td>{b.car?.make} {b.car?.model}</td>
                            <td>{new Date(b.pickupDate).toLocaleDateString('en-IN')}</td>
                            <td style={{ fontWeight: 700 }}>₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--success-text)' }}>₹{b.paidAmount?.toLocaleString('en-IN')}</td>
                            <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Booking</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.payments?.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No payments recorded</td></tr>
                      ) : (
                        customer.payments?.map((p: any) => (
                          <tr key={p.id}>
                            <td>{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                            <td>{p.bookingNumber}</td>
                            <td><span className="badge badge-neutral">{p.method}</span></td>
                            <td style={{ fontSize: 12 }}>{p.reference || '—'}</td>
                            <td style={{ fontWeight: 700, color: 'var(--success-text)' }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'damages' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Description</th>
                        <th>Charged (₹)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.damages?.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No damage incidents</td></tr>
                      ) : (
                        customer.damages?.map((d: any) => (
                          <tr key={d.id}>
                            <td>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>{d.car?.make} {d.car?.model}</td>
                            <td>{d.description}</td>
                            <td style={{ fontWeight: 700 }}>₹{d.customerCharge?.toLocaleString('en-IN')}</td>
                            <td><span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setOpenModal('createBooking', { customerId: customer.id });
                }}
              >
                New Booking For This Customer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
