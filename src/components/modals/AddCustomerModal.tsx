'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, UserPlus, FileCheck } from 'lucide-react';

export const AddCustomerModal: React.FC = () => {
  const { openModal, setOpenModal, showToast, triggerRefresh } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (openModal !== 'addCustomer') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !licenseNumber) {
      showToast('Please enter name, phone, and license number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          city,
          address,
          licenseNumber,
          idProofType,
          idProofNumber
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add customer', 'error');
        return;
      }

      showToast(`Customer ${data.name} added successfully!`, 'success');
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error adding customer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 560 }}>
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
              <UserPlus size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Add New Customer
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Register customer identity and driving license
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
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Vikram Malhotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Phone *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +91 98200 44332"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="vikram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Apartment, Street, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{
              padding: 14,
              background: 'var(--bg-subtle)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              marginTop: 10
            }}>
              <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <FileCheck size={16} /> Identity & Driving License Compliance
              </span>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Driving License No. *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MH02-2019-0012984"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">ID Proof Type</label>
                  <select
                    className="form-control"
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                <label className="text-xs">ID Proof Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 5421-9982-1209"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                />
              </div>
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
              {submitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
