'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldAlert,
  Building2,
  Users,
  Car,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { user, showToast } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSuperAdminData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/superadmin/stats').then((r) => r.json()),
      fetch('/api/superadmin/tenants').then((r) => r.json())
    ])
      .then(([statsData, tenantsData]) => {
        setStats(statsData);
        if (Array.isArray(tenantsData)) setTenants(tenantsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/superadmin/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, status: nextStatus })
      });
      if (res.ok) {
        showToast(`Tenant status updated to ${nextStatus}`, 'success');
        fetchSuperAdminData();
      }
    } catch (err) {
      showToast('Failed to update tenant status', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="title-xl">Super Admin Platform Command Center</h1>
            <span className="badge badge-maintenance">Platform Owner</span>
          </div>
          <p className="text-body" style={{ marginTop: 2 }}>
            Manage SaaS tenants, multi-tenant database partitioning, subscriptions, and MRR.
          </p>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Tenants</div>
          <div className="kpi-value">{stats?.totalTenants ?? 0}</div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Rental businesses onboarded
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Active Tenants</div>
          <div className="kpi-value" style={{ color: 'var(--success-text)' }}>
            {stats?.activeTenants ?? 0}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--success-text)' }}>
            Operational subscriptions
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Monthly Recurring Revenue (MRR)</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            ₹{(stats?.mrr ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            At ₹2,999 / business / month
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Platform Total Fleet</div>
          <div className="kpi-value">{stats?.totalCars ?? 0}</div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Cars managed across tenants
          </div>
        </div>
      </div>

      {/* Tenants Management Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="title-md">All Registered Rental Companies</h2>
            <p className="text-sm">Manage tenant activation status and view per-tenant metrics.</p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner / Admin</th>
                <th>Contact</th>
                <th>Fleet Size</th>
                <th>Total Bookings</th>
                <th>SaaS Plan</th>
                <th>Subscription Status</th>
                <th>Tenant Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Loading tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No tenants registered.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {t.city}, {t.state}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{t.ownerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.email}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 12.5 }}>{t.phone}</div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {t.carsCount} cars
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {t.bookingsCount} bookings
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {t.subscription?.plan || 'trackvise Standard'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        ₹2,999/mo
                      </div>
                    </td>

                    <td>
                      <span className={`badge badge-${(t.subscription?.status || 'active').toLowerCase()}`}>
                        {t.subscription?.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge badge-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleStatus(t.id, t.status)}
                          className={`btn btn-sm ${t.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                        >
                          {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
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
