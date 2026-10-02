'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { FileText, Search, Printer, Eye, CheckCircle2, AlertCircle, FileCheck, Receipt } from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { setOpenModal, refreshTrigger } = useApp();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    let url = `/api/invoices?status=${statusFilter}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter, refreshTrigger]);

  const summary = useMemo(() => {
    const total = invoices.length;
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.remaining || 0), 0);
    return { total, totalBilled, totalCollected, totalOutstanding };
  }, [invoices]);

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
            <h1 className="title-xl">Tax Invoices & Billing</h1>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              border: '1px solid rgba(37, 99, 235, 0.18)'
            }}>
              GST Ready (CGST + SGST)
            </span>
          </div>
          <p className="text-body" style={{ marginTop: 4 }}>
            Official commercial tax invoices, automated line items, settlement receipts, and PDF/WhatsApp generation.
          </p>
        </div>
      </div>

      {/* Top Financial Ribbon */}
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
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Invoices Issued
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
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Billed
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-heading)' }}>
              ₹{summary.totalBilled.toLocaleString('en-IN')}
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
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Collected to Date
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              ₹{summary.totalCollected.toLocaleString('en-IN')}
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
              Remaining Dues
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
              ₹{summary.totalOutstanding.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20
      }}>
        <div className="tabs-bar" style={{ marginBottom: 0 }}>
          {['ALL', 'ISSUED', 'PAID'].map((s) => (
            <button
              key={s}
              className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'ALL' ? 'All Invoices' : s === 'ISSUED' ? 'Issued / Pending Settlement' : 'Fully Settled'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search invoice # or customer name..."
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
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Subtotal</th>
                <th>Total (with GST)</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
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
                        {inv.invoiceNumber}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
                        {inv.booking?.bookingNumber}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {inv.booking?.customer?.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {inv.booking?.customer?.phone}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {inv.booking?.car?.make} {inv.booking?.car?.model}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {inv.booking?.car?.registrationNumber}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        ₹{inv.subtotal?.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--navy-900)', fontSize: 14 }}>
                        ₹{inv.total?.toLocaleString('en-IN')}
                      </div>
                      {inv.taxAmount > 0 && (
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                          Incl. GST ₹{inv.taxAmount?.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#059669' }}>
                        ₹{inv.paid?.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      {inv.remaining > 0 ? (
                        <span className="badge badge-danger">
                          ₹{inv.remaining?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                          Settled
                        </span>
                      )}
                    </td>

                    <td>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setOpenModal('viewInvoice', { invoice: inv })}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Printer size={13} />
                        <span>Print / PDF</span>
                      </button>
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
