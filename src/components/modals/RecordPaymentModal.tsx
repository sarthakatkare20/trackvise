'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CreditCard, Check } from 'lucide-react';

export const RecordPaymentModal: React.FC = () => {
  const { openModal, modalData, setOpenModal, showToast, triggerRefresh } = useApp();

  const [bookingId, setBookingId] = useState<string>('');
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('UPI');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (openModal === 'recordPayment') {
      if (modalData?.booking) {
        setBookingId(modalData.booking.id);
        setAmount(modalData.booking.remainingAmount || 0);
      } else {
        fetch('/api/bookings?status=ALL')
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              const pendingOnes = data.filter((b) => b.remainingAmount > 0 && b.status !== 'CANCELLED');
              setActiveBookings(pendingOnes);
              if (pendingOnes.length > 0) {
                setBookingId(pendingOnes[0].id);
                setAmount(pendingOnes[0].remainingAmount);
              }
            }
          })
          .catch(console.error);
      }
    }
  }, [openModal, modalData]);

  if (openModal !== 'recordPayment') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || amount <= 0) {
      showToast('Please enter a valid amount and select booking', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount: parseFloat(String(amount)),
          method,
          reference,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to record payment', 'error');
        return;
      }

      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`, 'success');
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error recording payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 520 }}>
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
              <CreditCard size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Record Payment
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Add transaction to booking payment ledger
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!modalData?.booking && (
              <div className="form-group">
                <label className="form-label">Select Booking *</label>
                <select
                  className="form-control"
                  value={bookingId}
                  onChange={(e) => {
                    setBookingId(e.target.value);
                    const b = activeBookings.find((x) => x.id === e.target.value);
                    if (b) setAmount(b.remainingAmount);
                  }}
                  required
                >
                  <option value="">-- Choose Booking --</option>
                  {activeBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} • {b.customer.name} (Due: ₹{b.remainingAmount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {modalData?.booking && (
              <div style={{
                padding: 12,
                background: 'var(--bg-subtle)',
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)' }}>
                  Booking {modalData.booking.bookingNumber}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Customer: {modalData.booking.customer?.name} • Vehicle: {modalData.booking.car?.make} {modalData.booking.car?.model}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginTop: 4 }}>
                  Outstanding Due: ₹{modalData.booking.remainingAmount?.toLocaleString('en-IN')}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Payment Amount (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-control"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Reference Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. UPI-99821892 or HDFC-102931"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Received full settlement at car drop"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpenModal(null)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
