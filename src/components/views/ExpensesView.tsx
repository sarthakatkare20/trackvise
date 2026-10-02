'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Receipt, Plus, Filter, Trash2, Fuel, Wrench, Sparkles, AlertCircle } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { setOpenModal, refreshTrigger, triggerRefresh, showToast } = useApp();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    let url = `/api/expenses?category=${categoryFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data.expenses || []);
        setSummary(data.summary || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryFilter, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Expense record deleted', 'info');
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete expense', 'error');
    }
  };

  const categories = ['ALL', 'Fuel', 'Maintenance', 'Repair', 'Insurance', 'Cleaning', 'Salary', 'Other'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="title-xl">Expense Management</h1>
          <p className="text-body" style={{ marginTop: 2 }}>
            Track car servicing, periodic maintenance, fuel top-ups, cleaning and operations overhead.
          </p>
        </div>

        <button
          onClick={() => setOpenModal('addExpense')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense KPI summary cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Outflow</div>
          <div className="kpi-value" style={{ color: 'var(--danger-text)' }}>
            ₹{(summary?.totalAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            {summary?.count || 0} recorded items
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Maintenance & Service</div>
          <div className="kpi-value">
            ₹{(summary?.categoryBreakdown?.['Maintenance'] || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Workshop & spare parts
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Fleet Fuel Outflow</div>
          <div className="kpi-value">
            ₹{(summary?.categoryBreakdown?.['Fuel'] || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Petrol / Diesel refuels
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Cleaning & Detailing</div>
          <div className="kpi-value">
            ₹{(summary?.categoryBreakdown?.['Cleaning'] || 0).toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
            Hub washes & sanitization
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        {categories.map((c) => (
          <button
            key={c}
            className={`tab-btn ${categoryFilter === c ? 'active' : ''}`}
            onClick={() => setCategoryFilter(c)}
          >
            {c === 'ALL' ? 'All Categories' : c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No expenses recorded in this category.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {e.category}
                      </span>
                    </td>

                    <td>
                      {e.car ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {e.car.make} {e.car.model}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {e.car.registrationNumber}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          General / Overhead
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ color: 'var(--navy-900)' }}>{e.description}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger-text)' }}>
                        ₹{e.amount?.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger-text)', padding: 5 }}
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
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
