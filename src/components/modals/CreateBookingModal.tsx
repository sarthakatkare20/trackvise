'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Calendar, AlertCircle, CheckCircle, Car as CarIcon, User as UserIcon, CreditCard, Sparkles } from 'lucide-react';
import { getCarImageUrl } from '@/lib/carImages';

export const CreateBookingModal: React.FC = () => {
  const { openModal, setOpenModal, showToast, triggerRefresh, tenant } = useApp();

  const [step, setStep] = useState<number>(1);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustLicense, setNewCustLicense] = useState('');

  // Booking Time Window
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [pickupDate, setPickupDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [dropDate, setDropDate] = useState<string>(dayAfter.toISOString().split('T')[0]);
  const [dropTime, setDropTime] = useState<string>('10:00');
  const [pickupLocation, setPickupLocation] = useState<string>('Bandra Hub');
  const [dropLocation, setDropLocation] = useState<string>('Bandra Hub');

  // Fleet availability & selection
  const [availableCars, setAvailableCars] = useState<any[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [suggestedCars, setSuggestedCars] = useState<any[]>([]);

  // Pricing & Payment
  const [durationHours, setDurationHours] = useState<number>(24);
  const [baseRentalPrice, setBaseRentalPrice] = useState<number>(2500);
  const [discount, setDiscount] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [advancePaidNow, setAdvancePaidNow] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch customers
  useEffect(() => {
    if (openModal === 'createBooking') {
      fetch('/api/customers')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCustomers(data);
            if (data.length > 0) setSelectedCustomerId(data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [openModal]);

  // Check fleet availability whenever dates change
  useEffect(() => {
    if (openModal === 'createBooking' && pickupDate && dropDate) {
      setCheckingAvailability(true);
      setAvailabilityError(null);
      setSuggestedCars([]);

      const url = `/api/cars/available?pickupDate=${pickupDate}&pickupTime=${pickupTime}&dropDate=${dropDate}&dropTime=${dropTime}`;
      fetch(url)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setAvailableCars(data.availableCars || []);
            setDurationHours(data.durationHours || 24);
            if (data.availableCars && data.availableCars.length > 0) {
              if (!selectedCarId || !data.availableCars.find((c: any) => c.id === selectedCarId)) {
                setSelectedCarId(data.availableCars[0].id);
                setSelectedCar(data.availableCars[0]);
                setBaseRentalPrice(data.availableCars[0].calculatedPrice || 2500);
                setAdvancePaidNow(Math.round((data.availableCars[0].calculatedPrice || 2500) * 0.3));
              }
            }
          } else {
            setAvailabilityError(data.error || 'Failed to check car availability');
          }
        })
        .catch((err) => {
          setAvailabilityError('Error checking fleet schedule');
        })
        .finally(() => {
          setCheckingAvailability(false);
        });
    }
  }, [pickupDate, pickupTime, dropDate, dropTime, openModal]);

  // Handle car selection
  const handleCarSelect = (car: any) => {
    setSelectedCarId(car.id);
    setSelectedCar(car);
    setBaseRentalPrice(car.calculatedPrice || 2500);
    const adv = Math.round((car.calculatedPrice || 2500) * 0.3);
    setAdvancePaidNow(adv);
  };

  if (openModal !== 'createBooking') return null;

  const totalAmount = Math.max(0, baseRentalPrice - (parseFloat(String(discount)) || 0) + (parseFloat(String(additionalCharges)) || 0));
  const remainingAmount = Math.max(0, totalAmount - (parseFloat(String(advancePaidNow)) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingNewCustomer && !selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }
    if (isAddingNewCustomer && (!newCustName || !newCustPhone || !newCustLicense)) {
      showToast('Please fill all new customer fields', 'error');
      return;
    }
    if (!selectedCarId) {
      showToast('Please select a vehicle', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        carId: selectedCarId,
        pickupDate,
        pickupTime,
        dropDate,
        dropTime,
        pickupLocation,
        dropLocation,
        discount: parseFloat(String(discount)) || 0,
        additionalCharges: parseFloat(String(additionalCharges)) || 0,
        advanceAmount: advancePaidNow,
        advancePaidNow: parseFloat(String(advancePaidNow)) || 0,
        paymentMethod,
        paymentReference,
        notes
      };

      if (isAddingNewCustomer) {
        payload.newCustomer = {
          name: newCustName,
          phone: newCustPhone,
          email: newCustEmail,
          licenseNumber: newCustLicense
        };
      } else {
        payload.customerId = selectedCustomerId;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.isDoubleBooking) {
          setAvailabilityError(data.error);
          setSuggestedCars(data.suggestedCars || []);
          showToast(data.error, 'error');
        } else {
          showToast(data.error || 'Failed to create booking', 'error');
        }
        return;
      }

      showToast(`Booking ${data.bookingNumber} confirmed successfully!`, 'success');
      setOpenModal(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error creating booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 750 }}>
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
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Create New Booking
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Trackvise Booking & Availability Engine
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
          <div className="modal-body" style={{ maxHeight: '70vh' }}>
            {/* Step 1: Customer Selection */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserIcon size={15} /> 1. Customer Information
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                  className="btn btn-outline-primary btn-sm"
                >
                  {isAddingNewCustomer ? 'Select Existing Customer' : 'Add New Customer'}
                </button>
              </div>

              {!isAddingNewCustomer ? (
                <select
                  className="form-control"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Existing Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - DL: {c.licenseNumber}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  padding: 14,
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="text-xs">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sarthak Deshmukh"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="text-xs">Phone Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. +91 98200 12345"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="text-xs">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="sarthak@example.com"
                        value={newCustEmail}
                        onChange={(e) => setNewCustEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="text-xs">Driving License No. *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. MH02-2022-0099123"
                        value={newCustLicense}
                        onChange={(e) => setNewCustLicense(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Pickup and Drop Timing */}
            <div style={{ marginBottom: 20 }}>
              <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Calendar size={15} /> 2. Rental Schedule & Locations
              </span>
              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs">Pickup Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Pickup Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Drop Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dropDate}
                    onChange={(e) => setDropDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Drop Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={dropTime}
                    onChange={(e) => setDropTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 8 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Pickup Hub / Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Drop Hub / Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Vehicle Selection & Double Booking Warning */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CarIcon size={15} /> 3. Select Available Vehicle ({durationHours} hrs duration)
                </span>
                {checkingAvailability && (
                  <span style={{ fontSize: 12, color: 'var(--primary)' }}>
                    Verifying fleet availability...
                  </span>
                )}
              </div>

              {availabilityError && (
                <div className="alert-box alert-danger">
                  <AlertCircle size={18} />
                  <div>
                    <strong>Overlap / Double Booking Alert:</strong>
                    <div>{availabilityError}</div>
                  </div>
                </div>
              )}

              {availableCars.length === 0 && !checkingAvailability ? (
                <div style={{
                  padding: 20,
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: 8,
                  color: 'var(--danger-text)'
                }}>
                  No vehicles available for this exact time window. Try changing pickup/drop dates.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 10,
                  maxHeight: 220,
                  overflowY: 'auto',
                  padding: 4
                }}>
                  {availableCars.map((car) => {
                    const isSelected = selectedCarId === car.id;
                    return (
                      <div
                        key={car.id}
                        onClick={() => handleCarSelect(car)}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                          background: isSelected ? 'var(--primary-light)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center'
                        }}
                      >
                        <div style={{
                          width: 60,
                          height: 50,
                          borderRadius: 6,
                          overflow: 'hidden',
                          flexShrink: 0,
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
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {car.make} {car.model}
                            </span>
                            {isSelected && <CheckCircle size={15} color="var(--primary)" />}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                            {car.registrationNumber}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                              ₹{car.calculatedPrice?.toLocaleString('en-IN') || car.price24hr}
                            </span>
                            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                              ({durationHours}h)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 4: Pricing Breakdown & Payment */}
            <div style={{
              background: 'var(--bg-subtle)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <CreditCard size={15} /> 4. Pricing & Payment Ledger
              </span>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-xs">Base Rental Price (Auto-calc)</label>
                  <div style={{
                    padding: '8px 12px',
                    background: '#ffffff',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 14,
                    border: '1px solid var(--border-light)'
                  }}>
                    ₹{baseRentalPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-xs">Discount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs">Additional Charges (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#ffffff',
                borderRadius: 8,
                margin: '10px 0',
                border: '1px solid var(--border-light)'
              }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Rental Amount</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remaining Balance</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: remainingAmount > 0 ? 'var(--warning-text)' : 'var(--success-text)' }}>
                    ₹{remainingAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ marginTop: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Advance Amount Paid Now (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={advancePaidNow}
                    onChange={(e) => setAdvancePaidNow(parseFloat(e.target.value) || 0)}
                    min="0"
                    max={totalAmount}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Payment Method</label>
                  <select
                    className="form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-xs">Reference / Transaction ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UPI-992182"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
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
              disabled={submitting || availableCars.length === 0}
            >
              {submitting ? 'Confirming...' : 'Confirm & Generate Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
