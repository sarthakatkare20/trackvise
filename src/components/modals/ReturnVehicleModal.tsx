'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle, AlertTriangle, Gauge, Fuel } from 'lucide-react';

export const ReturnVehicleModal: React.FC = () => {
  const { openModal, modalData, setOpenModal, showToast, triggerRefresh } = useApp();

  const booking = modalData?.booking;

  const [fuelLevel, setFuelLevel] = useState('Full');
  const [returnOdometer, setReturnOdometer] = useState<number>(
    booking?.car?.odometer ? booking.car.odometer + 180 : 25000
  );
  const [hasDamage, setHasDamage] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [customerCharge, setCustomerCharge] = useState<number>(0);
  const [repairCost, setRepairCost] = useState<number>(0);
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (openModal !== 'returnVehicle' || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/bookings/${booking.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fuelLevel,
          returnOdometer: parseInt(String(returnOdometer), 10),
          hasDamage,
          damageDescription,
          customerCharge: parseFloat(String(customerCharge)) || 0,
          repairCost: parseFloat(String(repairCost)) || 0,
          sendToMaintenance,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to complete vehicle return', 'error');
        return;
      }

      showToast(
        `Vehicle ${booking.car.make} ${booking.car.model} returned. Booking ${booking.bookingNumber} completed!`,
        'success'
      );
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error processing return', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Vehicle Return Inspection
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Booking {booking.bookingNumber} • {booking.car.make} {booking.car.model} ({booking.car.registrationNumber})
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
            {/* Customer & Vehicle Info */}
            <div style={{
              padding: 12,
              background: 'var(--bg-subtle)',
              borderRadius: 8,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {booking.customer.name}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Phone: {booking.customer.phone}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy-800)' }}>
                  Start Odo: {booking.startOdometer || booking.car.odometer} km
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Remaining Due: ₹{booking.remainingAmount?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Odometer and Fuel */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Gauge size={15} /> Return Odometer (km) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(parseInt(e.target.value, 10))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Fuel size={15} /> Fuel Level Upon Return *
                </label>
                <select
                  className="form-control"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                >
                  <option value="Full">Full (100%)</option>
                  <option value="3/4">3/4 Tank (75%)</option>
                  <option value="Half">Half Tank (50%)</option>
                  <option value="1/4">Quarter Tank (25%)</option>
                  <option value="Low">Low / Reserve</option>
                </select>
              </div>
            </div>

            {/* Damage Inspection Toggle */}
            <div style={{
              margin: '16px 0',
              padding: 14,
              borderRadius: 8,
              border: hasDamage ? '1px solid var(--danger-border)' : '1px solid var(--border-light)',
              background: hasDamage ? 'var(--danger-bg)' : '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} color={hasDamage ? 'var(--danger)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: hasDamage ? 'var(--danger-text)' : 'var(--navy-900)' }}>
                      Vehicle Damage Inspection
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Were any new scratches, dents, or defects observed?
                    </div>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasDamage}
                    onChange={(e) => setHasDamage(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Damage Detected</span>
                </label>
              </div>

              {hasDamage && (
                <div style={{ marginTop: 14 }}>
                  <div className="form-group">
                    <label className="text-xs">Damage Description *</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. Rear bumper scrape and right taillight cracked"
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      required={hasDamage}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="text-xs">Charge to Customer (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={customerCharge}
                        onChange={(e) => setCustomerCharge(parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="text-xs">Estimated Repair Cost (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={repairCost}
                        onChange={(e) => setRepairCost(parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sendToMaintenance}
                      onChange={(e) => setSendToMaintenance(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-900)' }}>
                      Send vehicle directly to Maintenance workshop
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="text-xs">Inspection Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Car interior clean, keys and documents verified"
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
              {submitting ? 'Completing...' : 'Complete Return & Free Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
