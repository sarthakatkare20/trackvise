'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, Plus, CheckCircle, ShieldAlert, IndianRupee } from 'lucide-react';

export const DamagesView: React.FC = () => {
  const { setOpenModal, refreshTrigger, triggerRefresh, showToast } = useApp();

  const [damages, setDamages] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    let url = `/api/damages?status=${statusFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDamages(data.damages || []);
        setMetrics(data.metrics || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, refreshTrigger]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/damages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        showToast(`Damage status updated to ${newStatus}`, 'success');
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to update damage status', 'error');
    }
  };

  const statuses = ['ALL', 'REPORTED', 'CHARGED', 'REPAIR_PENDING', 'REPAIRED', 'CLOSED'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="title-xl">Damage Management</h1>
          <p className="text-body" style={{ marginTop: 2 }}>
            Track vehicle incidents, customer compensation charges, repair shop invoices, and net financial recovery.
          </p>
        </div>

        <button
          onClick={() => setOpenModal('addDamage')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Record Damage</span>
        </button>
      </div>

      {/* Recovery Financials KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Reported Incidents</div>
          <div className="kpi-value">{metrics?.totalDamages || 0}</div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Damage cases registered
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Customer Billed</div>
          <div className="kpi-value" style={{ color: 'var(--success-text)' }}>
            ₹{(metrics?.totalCustomerCharges || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--success-text)' }}>
            Total recovery charged
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Bodyshop Repair Costs</div>
          <div className="kpi-value" style={{ color: 'var(--danger-text)' }}>
            ₹{(metrics?.totalRepairCosts || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--danger-text)' }}>
            Actual workshop expenses
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Net Recovery Margin</div>
          <div className="kpi-value" style={{ color: (metrics?.netRecovery || 0) >= 0 ? 'var(--primary)' : 'var(--danger-text)' }}>
            ₹{(metrics?.netRecovery || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Customer charge - Workshop cost
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        {statuses.map((s) => (
          <button
            key={s}
            className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'ALL' ? 'All Incidents' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident Date</th>
                <th>Vehicle</th>
                <th>Responsible Customer</th>
                <th>Damage Description</th>
                <th>Customer Charge</th>
                <th>Repair Cost</th>
                <th>Net Margin</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Loading damage records...
                  </td>
                </tr>
              ) : damages.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No vehicle damage records found.
                  </td>
                </tr>
              ) : (
                damages.map((d) => {
                  const net = d.customerCharge - d.repairCost;
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {d.car?.make} {d.car?.model}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {d.car?.registrationNumber}
                        </div>
                      </td>

                      <td>
                        {d.customer ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{d.customer.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.customer.phone}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontSize: 13, color: 'var(--navy-900)' }}>
                          {d.description}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--success-text)' }}>
                          ₹{d.customerCharge?.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--danger-text)' }}>
                          ₹{d.repairCost?.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: net >= 0 ? 'var(--primary)' : 'var(--danger-text)' }}>
                          ₹{net.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${d.status.toLowerCase()}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="form-control"
                          value={d.status}
                          onChange={(e) => handleStatusUpdate(d.id, e.target.value)}
                          style={{ fontSize: 11, padding: '4px 6px', width: 120 }}
                        >
                          <option value="REPORTED">Reported</option>
                          <option value="CHARGED">Charged</option>
                          <option value="REPAIR_PENDING">Repair Pending</option>
                          <option value="REPAIRED">Repaired</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
