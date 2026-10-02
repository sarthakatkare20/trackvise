'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CreditCard, Plus, Filter, IndianRupee, CheckCircle2 } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { setOpenModal, refreshTrigger } = useApp();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    let url = `/api/payments?method=${methodFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPayments(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [methodFilter, refreshTrigger]);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const methods = ['ALL', 'UPI', 'Cash', 'Card', 'Bank Transfer'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="title-xl">Payment Ledger</h1>
          <p className="text-body" style={{ marginTop: 2 }}>
            Complete audit trail of advance payments, rentals settlement, and damage recoveries.
          </p>
        </div>

        <button
          onClick={() => setOpenModal('recordPayment')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary KPI & Method Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Ledger Inflow
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success-text)' }}>
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Method filter tabs */}
        <div className="tabs-bar" style={{ marginBottom: 0 }}>
          {methods.map((m) => (
            <button
              key={m}
              className={`tab-btn ${methodFilter === m ? 'active' : ''}`}
              onClick={() => setMethodFilter(m)}
            >
              {m === 'ALL' ? 'All Channels' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Payment Channel</th>
                <th>Transaction Reference</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No payment transactions recorded for this filter.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(p.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {p.booking?.bookingNumber}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {p.booking?.customer?.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {p.booking?.customer?.phone}
                      </div>
                    </td>

                    <td>
                      <div>
                        {p.booking?.car?.make} {p.booking?.car?.model}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {p.booking?.car?.registrationNumber}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-paid">
                        {p.method}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {p.reference || '—'}
                      </div>
                      {p.notes && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {p.notes}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--success-text)' }}>
                        +₹{p.amount?.toLocaleString('en-IN')}
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
