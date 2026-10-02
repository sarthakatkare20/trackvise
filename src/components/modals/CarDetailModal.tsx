'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Car, Calendar, Wrench, AlertTriangle, Receipt, CheckCircle, Clock } from 'lucide-react';
import { getCarImageUrl } from '@/lib/carImages';

export const CarDetailModal: React.FC = () => {
  const { openModal, modalData, setOpenModal, triggerRefresh, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'expenses' | 'damages'>('overview');
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const carId = modalData?.carId || modalData?.car?.id;

  useEffect(() => {
    if (openModal === 'carDetail' && carId) {
      setLoading(true);
      fetch(`/api/cars/${carId}`)
        .then((res) => res.json())
        .then((data) => {
          setCar(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [openModal, carId]);

  if (openModal !== 'carDetail') return null;

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setCar((prev: any) => ({ ...prev, status: updated.status }));
        showToast(`Vehicle status changed to ${newStatus}`, 'success');
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 780, maxHeight: '90vh' }}>
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
              <Car size={18} />
            </div>
            {car ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                  {car.make} {car.model} {car.variant || ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {car.registrationNumber} • {car.fuelType} • {car.year}
                </div>
              </div>
            ) : (
              <div>Loading vehicle...</div>
            )}
          </div>
          <button
            onClick={() => setOpenModal(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {car && (
          <>
            {/* Tabs Bar */}
            <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="tabs-bar" style={{ marginBottom: 0 }}>
                <button
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview & Rates
                </button>
                <button
                  className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  Booking History ({car.bookings?.length || 0})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('expenses')}
                >
                  Maintenance & Expenses ({car.expenses?.length || 0})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'damages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('damages')}
                >
                  Damage Records ({car.damages?.length || 0})
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: '65vh' }}>
              {activeTab === 'overview' && (
                <div>
                  {/* Car Image Preview */}
                  <div style={{
                    height: 200,
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 16,
                    position: 'relative',
                    background: '#0f172a'
                  }}>
                    <img
                      src={getCarImageUrl(car)}
                      alt={`${car.make} ${car.model}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {car.registrationNumber}
                    </div>
                  </div>

                  {/* Status & Quick Change */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    background: 'var(--bg-subtle)',
                    borderRadius: 8,
                    marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Current Status:</span>
                      <span className={`badge badge-${car.status.toLowerCase()}`}>
                        {car.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Change:</span>
                      {['AVAILABLE', 'ON_RENT', 'MAINTENANCE'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={car.status === s || updatingStatus}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            background: car.status === s ? '#e2e8f0' : '#ffffff'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div style={{ marginBottom: 20 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}>Rental Pricing Rates</div>
                    <div className="kpi-grid" style={{ marginBottom: 0 }}>
                      <div className="kpi-card" style={{ padding: 14 }}>
                        <div className="kpi-label">12-Hour Rental</div>
                        <div className="kpi-value" style={{ fontSize: 20 }}>₹{car.price12hr}</div>
                      </div>
                      <div className="kpi-card" style={{ padding: 14 }}>
                        <div className="kpi-label">24-Hour Daily</div>
                        <div className="kpi-value" style={{ fontSize: 20 }}>₹{car.price24hr}</div>
                      </div>
                      <div className="kpi-card" style={{ padding: 14 }}>
                        <div className="kpi-label">Extra Hour Rate</div>
                        <div className="kpi-value" style={{ fontSize: 20 }}>₹{car.extraHourlyRate}/hr</div>
                      </div>
                      <div className="kpi-card" style={{ padding: 14 }}>
                        <div className="kpi-label">Extra KM Charge</div>
                        <div className="kpi-value" style={{ fontSize: 20 }}>₹{car.extraKmRate}/km</div>
                      </div>
                    </div>
                  </div>

                  {/* Specs & Compliance */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                        Vehicle Specs
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Transmission:</span>
                        <strong>{car.transmission}</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Fuel Type:</span>
                        <strong>{car.fuelType}</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Seating Capacity:</span>
                        <strong>{car.seats} Seats</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Color:</span>
                        <strong>{car.color}</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Odometer:</span>
                        <strong>{car.odometer?.toLocaleString('en-IN')} km</strong>
                      </div>
                    </div>

                    <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                        Compliance Documents
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>RC Expiry:</span>
                        <strong>{car.rcExpiry ? new Date(car.rcExpiry).toLocaleDateString('en-IN') : 'Active'}</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Insurance Expiry:</span>
                        <strong>{car.insuranceExpiry ? new Date(car.insuranceExpiry).toLocaleDateString('en-IN') : 'Active'}</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>PUC Expiry:</span>
                        <strong>{car.pucExpiry ? new Date(car.pucExpiry).toLocaleDateString('en-IN') : 'Active'}</strong>
                      </div>
                      <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Free KM/Day:</span>
                        <strong>{car.freeKmPerDay} km</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Pickup</th>
                        <th>Drop</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {car.bookings?.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                            No booking records found for this car.
                          </td>
                        </tr>
                      ) : (
                        car.bookings?.map((b: any) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600 }}>{b.bookingNumber}</td>
                            <td>{b.customer?.name}</td>
                            <td>{new Date(b.pickupDate).toLocaleDateString('en-IN')} {b.pickupTime}</td>
                            <td>{new Date(b.dropDate).toLocaleDateString('en-IN')} {b.dropTime}</td>
                            <td style={{ fontWeight: 700 }}>₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'expenses' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {car.expenses?.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                            No expenses recorded for this vehicle.
                          </td>
                        </tr>
                      ) : (
                        car.expenses?.map((e: any) => (
                          <tr key={e.id}>
                            <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                            <td>
                              <span className="badge badge-neutral">{e.category}</span>
                            </td>
                            <td>{e.description}</td>
                            <td style={{ fontWeight: 700, color: 'var(--danger-text)' }}>
                              ₹{e.amount?.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'damages' && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Description</th>
                        <th>Charge</th>
                        <th>Repair Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {car.damages?.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                            No damage incidents recorded. Clean history!
                          </td>
                        </tr>
                      ) : (
                        car.damages?.map((d: any) => (
                          <tr key={d.id}>
                            <td>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>{d.customer?.name || '—'}</td>
                            <td>{d.description}</td>
                            <td style={{ fontWeight: 600, color: 'var(--success-text)' }}>
                              ₹{d.customerCharge?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--danger-text)' }}>
                              ₹{d.repairCost?.toLocaleString('en-IN')}
                            </td>
                            <td>
                              <span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setOpenModal('createBooking', { carId: car.id });
                }}
              >
                + Create Booking For This Car
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
