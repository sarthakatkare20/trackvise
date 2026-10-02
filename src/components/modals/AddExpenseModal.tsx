'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Receipt } from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const { openModal, setOpenModal, showToast, triggerRefresh } = useApp();

  const [category, setCategory] = useState('Fuel');
  const [carId, setCarId] = useState('');
  const [cars, setCars] = useState<any[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (openModal === 'addExpense') {
      fetch('/api/cars?status=ALL')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCars(data);
        })
        .catch(console.error);
    }
  }, [openModal]);

  if (openModal !== 'addExpense') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || amount <= 0 || !description) {
      showToast('Please fill all required expense fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: carId || null,
          category,
          amount: parseFloat(String(amount)),
          date,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to record expense', 'error');
        return;
      }

      showToast(`Expense of ₹${amount.toLocaleString('en-IN')} recorded!`, 'success');
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error recording expense', 'error');
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
              <Receipt size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Record Operating Expense
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Track fleet maintenance, fuel, insurance and overhead
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
                <label className="form-label">Expense Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Fuel">Fuel</option>
                  <option value="Maintenance">Maintenance & Service</option>
                  <option value="Repair">Accident / Mechanical Repair</option>
                  <option value="Insurance">Insurance Policy Renewal</option>
                  <option value="Cleaning">Car Wash & Detailing</option>
                  <option value="Salary">Staff / Driver Salary</option>
                  <option value="Other">Other Operating Cost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Linked Vehicle (Optional)</label>
                <select
                  className="form-control"
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                >
                  <option value="">-- General / No Specific Car --</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
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
                <label className="form-label">Expense Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description / Vendor Notes *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. 40,000 km periodic engine service and brake pad replacement at Authorized Center"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
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
              {submitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
