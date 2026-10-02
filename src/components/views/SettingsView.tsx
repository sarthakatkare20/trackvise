'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Settings, Building2, UserPlus, CreditCard, Shield, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { tenant, showToast, triggerRefresh, setActiveView } = useApp();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [bookingPrefix, setBookingPrefix] = useState('TV');

  // Staff management
  const [users, setUsers] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('STAFF');
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);

  useEffect(() => {
    fetch('/api/tenants')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setName(data.name || '');
          setOwnerName(data.ownerName || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setGstNumber(data.gstNumber || '');
          setInvoicePrefix(data.invoicePrefix || 'INV');
          setBookingPrefix(data.bookingPrefix || 'TV');
          setUsers(data.users || []);
          if (data.subscriptions && data.subscriptions.length > 0) {
            setSubscription(data.subscriptions[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ownerName,
          phone,
          email,
          address,
          city,
          state,
          gstNumber,
          invoicePrefix,
          bookingPrefix
        })
      });

      if (res.ok) {
        showToast('Business settings saved successfully!', 'success');
        triggerRefresh();
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPassword) {
      showToast('Please fill all staff fields', 'error');
      return;
    }

    setAddingStaff(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffPassword,
          role: newStaffRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add staff', 'error');
        return;
      }

      showToast(`Staff member ${data.name} added!`, 'success');
      setUsers((prev) => [...prev, data]);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
    } catch (err: any) {
      showToast(err.message || 'Error adding staff', 'error');
    } finally {
      setAddingStaff(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="title-xl">Business Settings & Subscriptions</h1>
          <p className="text-body" style={{ marginTop: 2 }}>
            Manage company profile, GST invoicing configuration, staff members, and Trackvise SaaS subscription.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Column: Business Profile */}
        <div>
          <form onSubmit={handleSaveProfile} className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Building2 size={20} color="var(--primary)" />
              <h2 className="title-md">Business Profile & Invoicing</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rental Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner / Managing Director *</label>
                <input
                  type="text"
                  className="form-control"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Official Phone *</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Support Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Office / Hub Address</label>
              <input
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GSTIN (for 18% GST Invoicing)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 27AABCS1429B1Z8"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Invoice Prefix</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Booking Prefix</label>
                <input
                  type="text"
                  className="form-control"
                  value={bookingPrefix}
                  onChange={(e) => setBookingPrefix(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                <Save size={16} />
                <span>{savingProfile ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>

          {/* Staff Management Section */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <UserPlus size={20} color="var(--primary)" />
              <h2 className="title-md">Staff & Team Members</h2>
            </div>

            <div className="table-container" style={{ marginBottom: 20 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-neutral">{u.role}</span>
                      </td>
                      <td>
                        <span className="badge badge-available">{u.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddStaff} style={{
              background: 'var(--bg-subtle)',
              padding: 16,
              borderRadius: 8,
              border: '1px solid var(--border-light)'
            }}>
              <span className="form-label" style={{ display: 'block', marginBottom: 10 }}>
                Add New Staff Member
              </span>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label className="text-xs">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Staff Full Name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label className="text-xs">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="staff@company.in"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Permission Role</label>
                  <select
                    className="form-control"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                  >
                    <option value="STAFF">Staff (Operations)</option>
                    <option value="BUSINESS_ADMIN">Business Admin (Full Access)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={addingStaff}>
                    Add Member
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Subscription Architecture (Section 25) */}
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <CreditCard size={20} color="var(--primary)" />
              <h2 className="title-md">Trackvise SaaS Plan</h2>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0b1120 100%)',
              padding: 20,
              borderRadius: 12,
              color: '#ffffff',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Current Subscription</span>
                <span className={`badge badge-${(subscription?.status || 'active').toLowerCase()}`}>
                  {subscription?.status || 'ACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                {subscription?.plan || 'Trackvise Business'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>
                ₹{subscription?.amount ? subscription.amount.toLocaleString('en-IN') : '2,999'} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>/ month</span>
              </div>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 12 }}>
                Next Renewal: <strong>{subscription ? new Date(subscription.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '31 Dec 2026'}</strong>
              </div>

              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setActiveView('pricing')}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 14px',
                    borderRadius: 8
                  }}
                >
                  Explore All Fleet Plans & Upgrade →
                </button>
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p><strong>Fleet-Based Pricing Tiers:</strong></p>
              <ul style={{ paddingLeft: 18, marginTop: 6, fontSize: 12.5 }}>
                <li><strong>Starter:</strong> 1–5 cars (₹999/mo)</li>
                <li><strong>Growth:</strong> 6–10 cars (₹1,999/mo)</li>
                <li><strong>Business:</strong> 11–20 cars (₹2,999/mo)</li>
                <li><strong>Enterprise:</strong> 21+ cars (₹4,000+/mo)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
