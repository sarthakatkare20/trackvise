'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Car, Shield, FileText } from 'lucide-react';

export const AddCarModal: React.FC = () => {
  const { openModal, setOpenModal, showToast, triggerRefresh } = useApp();

  const [make, setMake] = useState('Hyundai');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [seats, setSeats] = useState(5);
  const [color, setColor] = useState('White');
  const [status, setStatus] = useState('AVAILABLE');

  // Pricing
  const [price12hr, setPrice12hr] = useState(1800);
  const [price24hr, setPrice24hr] = useState(3000);
  const [extraHourlyRate, setExtraHourlyRate] = useState(200);
  const [extraKmRate, setExtraKmRate] = useState(14);
  const [freeKmPerDay, setFreeKmPerDay] = useState(250);
  const [odometer, setOdometer] = useState(15000);

  // Expiry dates
  const [rcExpiry, setRcExpiry] = useState('2038-05-15');
  const [insuranceExpiry, setInsuranceExpiry] = useState('2027-06-20');
  const [pucExpiry, setPucExpiry] = useState('2026-12-31');

  const [submitting, setSubmitting] = useState(false);

  if (openModal !== 'addCar') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !registrationNumber) {
      showToast('Please fill all mandatory car fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make,
          model,
          variant,
          year: parseInt(String(year), 10),
          registrationNumber: registrationNumber.toUpperCase().trim(),
          fuelType,
          transmission,
          seats: parseInt(String(seats), 10),
          color,
          status,
          price12hr: parseFloat(String(price12hr)),
          price24hr: parseFloat(String(price24hr)),
          extraHourlyRate: parseFloat(String(extraHourlyRate)),
          extraKmRate: parseFloat(String(extraKmRate)),
          freeKmPerDay: parseInt(String(freeKmPerDay), 10),
          odometer: parseInt(String(odometer), 10),
          rcExpiry,
          insuranceExpiry,
          pucExpiry
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add car', 'error');
        return;
      }

      showToast(`Added ${data.make} ${data.model} (${data.registrationNumber}) to fleet!`, 'success');
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error adding vehicle', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 700 }}>
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
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Add Vehicle to Fleet
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Register car, specifications, rental rates and compliance
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
          <div className="modal-body" style={{ maxHeight: '72vh' }}>
            {/* Section 1: Basic Information */}
            <div style={{ marginBottom: 20 }}>
              <span className="form-label" style={{ display: 'block', marginBottom: 10 }}>
                1. Vehicle Specifications
              </span>
              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs">Brand / Make *</label>
                  <select
                    className="form-control"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    required
                  >
                    <option value="Hyundai">Hyundai</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                    <option value="Tata">Tata Motors</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Kia">Kia</option>
                    <option value="Honda">Honda</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Skoda">Skoda</option>
                    <option value="MG">MG Motor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-xs">Model Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Creta, Thar, Swift"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Variant (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SX (O), LX 4x4"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs">Registration Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MH 02 DT 8821"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Fuel Type *</label>
                  <select
                    className="form-control"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">Electric (EV)</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-xs">Transmission *</label>
                  <select
                    className="form-control"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs">Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Seating Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Initial Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Rental Pricing */}
            <div style={{
              background: 'var(--bg-subtle)',
              padding: 14,
              borderRadius: 'var(--radius-sm)',
              marginBottom: 20,
              border: '1px solid var(--border-light)'
            }}>
              <span className="form-label" style={{ display: 'block', marginBottom: 10 }}>
                2. Rental Pricing (₹ INR)
              </span>
              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs">12-Hour Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price12hr}
                    onChange={(e) => setPrice12hr(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">24-Hour Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price24hr}
                    onChange={(e) => setPrice24hr(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Extra Hour Charge (₹/hr)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={extraHourlyRate}
                    onChange={(e) => setExtraHourlyRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Free KM Per Day</label>
                  <input
                    type="number"
                    className="form-control"
                    value={freeKmPerDay}
                    onChange={(e) => setFreeKmPerDay(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Extra KM Charge (₹/km)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={extraKmRate}
                    onChange={(e) => setExtraKmRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Current Odometer (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={odometer}
                    onChange={(e) => setOdometer(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Compliance & Documents */}
            <div>
              <span className="form-label" style={{ display: 'block', marginBottom: 10 }}>
                3. Compliance Documents Expiry Dates
              </span>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Registration (RC) Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    value={rcExpiry}
                    onChange={(e) => setRcExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Insurance Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">PUC Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    value={pucExpiry}
                    onChange={(e) => setPucExpiry(e.target.value)}
                  />
                </div>
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
              {submitting ? 'Saving...' : 'Add Vehicle to Fleet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
