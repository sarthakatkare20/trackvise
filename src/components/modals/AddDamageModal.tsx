'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, AlertTriangle } from 'lucide-react';

export const AddDamageModal: React.FC = () => {
  const { openModal, setOpenModal, showToast, triggerRefresh } = useApp();

  const [cars, setCars] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [carId, setCarId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [customerCharge, setCustomerCharge] = useState<number>(0);
  const [repairCost, setRepairCost] = useState<number>(0);
  const [status, setStatus] = useState('REPORTED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (openModal === 'addDamage') {
      fetch('/api/cars?status=ALL')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCars(data);
            if (data.length > 0) setCarId(data[0].id);
          }
        })
        .catch(console.error);

      fetch('/api/customers')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCustomers(data);
            if (data.length > 0) setCustomerId(data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [openModal]);

  if (openModal !== 'addDamage') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId || !description) {
      showToast('Please select vehicle and enter damage details', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/damages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId,
          customerId: customerId || null,
          description,
          customerCharge: parseFloat(String(customerCharge)) || 0,
          repairCost: parseFloat(String(repairCost)) || 0,
          status,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to record damage', 'error');
        return;
      }

      showToast('Damage record saved successfully', 'success');
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error recording damage', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Record Vehicle Damage
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Track damages, customer recovery charges and repair costs
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
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select
                  className="form-control"
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Car --</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.make} {c.model} ({c.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Customer (Optional)</label>
                <select
                  className="form-control"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- No Customer Linked --</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Damage Description *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Scratched left front fender and cracked side mirror housing during return"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Charge (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={customerCharge}
                  onChange={(e) => setCustomerCharge(parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repair Cost (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={repairCost}
                  onChange={(e) => setRepairCost(parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="REPORTED">Reported</option>
                  <option value="CHARGED">Charged to Customer</option>
                  <option value="REPAIR_PENDING">Repair Pending</option>
                  <option value="REPAIRED">Repaired</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Internal Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Repair completed at authorized bodyshop with invoice"
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
              {submitting ? 'Saving...' : 'Record Damage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
