'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Car,
  Plus,
  Search,
  Fuel,
  Users,
  Eye,
  CalendarPlus,
  Gauge,
  Sparkles,
  CheckCircle2,
  Clock,
  Wrench,
  Zap
} from 'lucide-react';
import { getCarImageUrl } from '@/lib/carImages';

export const FleetView: React.FC = () => {
  const { setOpenModal, refreshTrigger } = useApp();

  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    let url = `/api/cars?status=${statusFilter}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCars(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, search, refreshTrigger]);

  // Compute fleet counts
  const stats = useMemo(() => {
    const total = cars.length;
    const available = cars.filter(c => c.status === 'AVAILABLE').length;
    const onRent = cars.filter(c => c.status === 'ON_RENT').length;
    const maintenance = cars.filter(c => c.status === 'MAINTENANCE').length;
    return { total, available, onRent, maintenance };
  }, [cars]);

  const filterTabs = [
    { id: 'ALL', label: 'All Fleet', count: stats.total },
    { id: 'AVAILABLE', label: 'Available', count: stats.available },
    { id: 'ON_RENT', label: 'On Rent', count: stats.onRent },
    { id: 'MAINTENANCE', label: 'Maintenance', count: stats.maintenance }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="title-xl">Fleet Inventory</h1>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              border: '1px solid rgba(37, 99, 235, 0.18)'
            }}>
              {cars.length} Vehicles Managed
            </span>
          </div>
          <p className="text-body" style={{ marginTop: 4 }}>
            Real-time fleet readiness, live booking status, FASTag & maintenance tracking.
          </p>
        </div>

        <button
          onClick={() => setOpenModal('addCar')}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: 13.5 }}
        >
          <Plus size={16} />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Top Fleet Quick Status Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 24
      }}>
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(37, 99, 235, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Vehicles
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)', fontFamily: 'var(--font-heading)' }}>
              {stats.total}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ready For Dispatch
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              {stats.available}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Currently On Trip
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)' }}>
              {stats.onRent}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wrench size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Service / Inspection
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
              {stats.maintenance}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 24
      }}>
        <div className="tabs-bar" style={{ marginBottom: 0 }}>
          {filterTabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${statusFilter === t.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(t.id)}
            >
              <span>{t.label}</span>
              <span style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 10,
                background: statusFilter === t.id ? 'var(--primary)' : 'rgba(0,0,0,0.06)',
                color: statusFilter === t.id ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search make, model, or reg number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="status-dot status-dot-blue" style={{ margin: '0 auto 12px auto' }} />
          Loading fleet vehicles...
        </div>
      ) : cars.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Car size={40} color="var(--text-muted)" style={{ margin: '0 auto 14px auto' }} />
          <h3 className="title-md">No vehicles found</h3>
          <p className="text-sm" style={{ marginTop: 4, marginBottom: 20 }}>
            {search ? 'No cars match your search filter.' : 'Add your first vehicle to start managing your fleet.'}
          </p>
          <button
            onClick={() => setOpenModal('addCar')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: 24
        }}>
          {cars.map((car) => {
            const isAvail = car.status === 'AVAILABLE';
            const isOnRent = car.status === 'ON_RENT';
            const isMaint = car.status === 'MAINTENANCE';

            return (
              <div
                key={car.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Image Banner */}
                <div style={{
                  height: 195,
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#090e18'
                }}>
                  <img
                    src={getCarImageUrl(car)}
                    alt={`${car.make} ${car.model}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* High contrast gradient vignette for clarity */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(9, 14, 24, 0.2) 0%, rgba(9, 14, 24, 0.75) 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Top Status Badge with live pulsing dot */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 2
                  }}>
                    <span className={`badge badge-${car.status.toLowerCase()}`} style={{
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(8px)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span className={`status-dot ${isAvail ? 'status-dot-green' : isOnRent ? 'status-dot-blue' : 'status-dot-amber'}`} />
                      {car.status === 'AVAILABLE' ? 'Available' : car.status === 'ON_RENT' ? 'On Trip' : 'In Service'}
                    </span>
                  </div>

                  {/* HSRP Indian Registration Plate */}
                  <div style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: 5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                    border: '1.5px solid #0f172a'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      paddingRight: 6,
                      marginRight: 6,
                      borderRight: '1px solid #cbd5e1'
                    }}>
                      <span style={{ fontSize: 7, fontWeight: 900, color: '#1e3a8a', lineHeight: 1 }}>IND</span>
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#0f172a',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.06em'
                    }}>
                      {car.registrationNumber}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em' }}>
                      {car.make} {car.model}
                    </h3>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-subtle)',
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      {car.year}
                    </span>
                  </div>

                  {car.variant && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                      {car.variant}
                    </div>
                  )}

                  {/* Vehicle Spec Badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="badge badge-neutral" style={{ fontSize: 11, padding: '4px 8px' }}>
                      <Fuel size={12} color="#0284c7" /> {car.fuelType}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 11, padding: '4px 8px' }}>
                      <Zap size={12} color="#8b5cf6" /> {car.transmission}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 11, padding: '4px 8px' }}>
                      <Users size={12} color="#10b981" /> {car.seats} Seats
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 11, padding: '4px 8px' }}>
                      <Gauge size={12} color="#64748b" /> {car.odometer?.toLocaleString('en-IN')} km
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '12px 14px',
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
                    borderRadius: 10,
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                  }}>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        24-Hour Rental
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                        ₹{car.price24hr?.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        12-Hour Rate
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-800)', fontFamily: 'var(--font-heading)' }}>
                        ₹{car.price12hr?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Action CTA Buttons */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setOpenModal('carDetail', { carId: car.id, car })}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '8px 12px' }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => setOpenModal('createBooking', { carId: car.id })}
                      disabled={car.status === 'MAINTENANCE' || car.status === 'INACTIVE'}
                      className="btn btn-primary btn-sm"
                      style={{
                        flex: 1.2,
                        padding: '8px 12px',
                        background: car.status === 'ON_RENT' ? 'var(--navy-900)' : 'var(--primary)'
                      }}
                    >
                      <CalendarPlus size={14} />
                      <span>{car.status === 'ON_RENT' ? 'Pre-Book' : 'Book Vehicle'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
