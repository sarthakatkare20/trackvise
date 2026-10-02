'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, Printer, Download, CheckCircle, FileText, Building2 } from 'lucide-react';
import { TrackviseLogo } from '@/components/TrackviseLogo';

export const InvoiceModal: React.FC = () => {
  const { openModal, modalData, setOpenModal, tenant } = useApp();

  const invoice = modalData?.invoice;

  if (openModal !== 'viewInvoice' || !invoice) return null;

  const booking = invoice.booking;
  const customer = booking?.customer;
  const car = booking?.car;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 800, maxHeight: '92vh' }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="var(--primary)" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              Tax Invoice #{invoice.invoiceNumber}
            </span>
            <span className={`badge badge-${invoice.status.toLowerCase()}`}>
              {invoice.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={() => setOpenModal(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body printable-invoice" style={{ padding: 32, background: '#ffffff' }}>
          {/* Header Branding */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--navy-900)',
            paddingBottom: 20,
            marginBottom: 24
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em' }}>
                {tenant?.name || 'Mumbai Drive Rentals'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 320 }}>
                {tenant?.address || 'Prime Mall, Linking Road, Bandra West, Mumbai'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Phone: {tenant?.phone || '+91 98201 23456'} • Email: {tenant?.email}
              </div>
              {tenant?.gstNumber && (
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginTop: 2 }}>
                  GSTIN: {tenant.gstNumber}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)', marginTop: 4 }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Booking Ref: <strong>{booking?.bookingNumber}</strong>
              </div>
            </div>
          </div>

          {/* Billed To & Rental Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={{
              padding: 14,
              borderRadius: 8,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Billed To (Customer)
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)' }}>
                {customer?.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Phone: {customer?.phone}
              </div>
              {customer?.email && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Email: {customer.email}
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                DL: <strong>{customer?.licenseNumber}</strong>
              </div>
            </div>

            <div style={{
              padding: 14,
              borderRadius: 8,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Vehicle & Rental Period
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)' }}>
                {car?.make} {car?.model} {car?.variant || ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Reg No: <strong>{car?.registrationNumber}</strong> • Fuel: {car?.fuelType}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Pickup: {booking ? new Date(booking.pickupDate).toLocaleDateString('en-IN') : ''} {booking?.pickupTime}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Drop: {booking ? new Date(booking.dropDate).toLocaleDateString('en-IN') : ''} {booking?.dropTime} ({booking?.durationHours} hrs)
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--navy-900)', color: '#ffffff' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Item Description</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Duration / Qty</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <strong>Self-Drive Rental Charges</strong>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {car?.make} {car?.model} ({car?.registrationNumber})
                  </div>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  {booking?.durationHours} Hours
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>
                  ₹{invoice.subtotal?.toLocaleString('en-IN')}
                </td>
              </tr>

              {invoice.discount > 0 && (
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--success-text)' }}>
                  <td style={{ padding: '10px 14px' }}>Discount Applied</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                    -₹{invoice.discount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}

              {invoice.taxAmount > 0 && (
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 14px' }}>GST ({invoice.taxRate}%) [CGST + SGST]</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{invoice.taxRate}%</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                    ₹{invoice.taxAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals & Settlement */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ width: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>₹{(invoice.subtotal - invoice.discount).toLocaleString('en-IN')}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST:</span>
                  <span>₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                fontSize: 16,
                fontWeight: 800,
                color: 'var(--navy-900)',
                borderTop: '2px solid var(--navy-900)'
              }}>
                <span>Total Amount:</span>
                <span>₹{invoice.total?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--success-text)', fontWeight: 600 }}>
                <span>Paid to Date:</span>
                <span>₹{invoice.paid?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 14,
                fontWeight: 700,
                color: invoice.remaining > 0 ? 'var(--danger-text)' : 'var(--success-text)'
              }}>
                <span>Balance Due:</span>
                <span>₹{invoice.remaining?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 11,
            color: 'var(--text-muted)'
          }}>
            <div>
              <strong>Rental Terms:</strong>
              <div>• Fuel policy: Same-to-Same tank return.</div>
              <div>• Speed limit: 100 km/h on expressways as per Indian road safety regulations.</div>
              <div>• This is a computer generated invoice powered by Trackvise SaaS.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <TrackviseLogo size="sm" theme="light" variant="compact" />
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Official Receipt & Billing Document</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
