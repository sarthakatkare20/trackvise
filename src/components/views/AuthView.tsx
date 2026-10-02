'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TrackviseLogo } from '@/components/TrackviseLogo';
import {
  Car,
  Building2,
  ArrowRight,
  Lock,
  Mail,
  Zap,
  Globe2,
  FileCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign Up form state
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Growth');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          businessName: businessName || `${fullName}'s Fleet`,
          email: regEmail,
          phone,
          password: regPassword,
          selectedPlan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create account', 'error');
        setLoading(false);
        return;
      }

      showToast(`Account created successfully for ${data.tenant.name}! Welcome to Trackvise.`, 'success');
      await login(regEmail, regPassword);
    } catch (err: any) {
      showToast(err.message || 'Registration error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #1e293b 0%, #0b1120 50%, #030712 100%)',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient lighting effects */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '15%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: 1080,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 36,
        alignItems: 'center',
        zIndex: 1
      }}>
        {/* Left Side: Brand Narrative & Enterprise Capabilities */}
        <div style={{ color: '#ffffff', padding: '12px 16px' }}>
            <div style={{ marginBottom: 24 }}>
              <TrackviseLogo size="lg" theme="dark" variant="full" />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 20
            }}>
              <span className="status-dot status-dot-green" />
              TRACKVISE FLEET OS v2.4 • ENTERPRISE READY
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 16
            }}>
              Mission control for modern <br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                car rental companies.
              </span>
            </h1>

            <p style={{
              fontSize: 16,
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 460
            }}>
              Prevent double-bookings, automate GST invoicing, verify customer driving licenses, and track revenue across every vehicle in your fleet.
            </p>

            {/* Feature highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(37, 99, 235, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                  flexShrink: 0
                }}>
                  <Zap size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                    Zero Double-Booking Engine
                  </div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                    Real-time scheduling locks guarantee no vehicle is dispatched twice.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0
                }}>
                  <FileCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                    GST Invoicing & Fastag Audits
                  </div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                    Instant print & WhatsApp invoices with return inspection damage checks.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                  flexShrink: 0
                }}>
                  <Building2 size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                    Multi-Tenant Branch Architecture
                  </div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                    Strict database-level isolation between independent rental businesses.
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Tiers Preview */}
            <div style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              maxWidth: 420
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.06em', marginBottom: 6 }}>
                ⚡ Transparent Fleet Plans:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 4px', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>1–5 Cars</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>₹999</div>
                </div>
                <div style={{ background: 'rgba(37,99,235,0.2)', padding: '6px 4px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.3)' }}>
                  <div style={{ fontSize: 10, color: '#93c5fd' }}>6–10 Cars</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>₹1,999</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 4px', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>11–20 Cars</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>₹2,999</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 4px', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>21+ Cars</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>₹4,000+</div>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: 420
            }}>
              <Globe2 size={20} color="#60a5fa" />
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Operational across <strong style={{ color: '#ffffff' }}>Mumbai, Goa, Pune & Bangalore</strong>
              </div>
            </div>
          </div>

        {/* Right Side: Auth Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          padding: '32px 32px',
          maxWidth: 480,
          margin: '0 auto',
          width: '100%',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Card Top Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <TrackviseLogo size="md" theme="light" variant="full" />

            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 12,
              background: 'var(--bg-subtle)',
              color: 'var(--navy-700)',
              border: '1px solid var(--border-light)'
            }}>
              v2.4
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            padding: 4,
            borderRadius: 10,
            marginBottom: 24
          }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '9px 14px',
                border: 'none',
                borderRadius: 8,
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--navy-900)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '9px 14px',
                border: 'none',
                borderRadius: 8,
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? 'var(--navy-900)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
                  Sign in with Credentials
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
                  Enter your registered Operator Email & Password to access your fleet console.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5 }}>
                  Operator Email / User ID *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. demo@trackvise.app or admin@youragency.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 0 }}>
                    Password *
                  </label>
                  <span
                    onClick={() => showToast('For password reset, please contact your business administrator or platform support.', 'info')}
                    style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 2
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)'
                }}
                disabled={loading}
              >
                {loading ? 'Verifying Credentials...' : 'Sign In to Console'}
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Don&apos;t have an account yet?{' '}
                <span
                  onClick={() => setMode('register')}
                  style={{ color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign Up
                </span>
              </div>
            </form>
          ) : (
            /* Modern Sign Up Form */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
                  Create Your Account
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
                  Start managing your fleet, bookings, and GST invoices in minutes.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sarthak Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5 }}>
                    Company / Fleet Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Apex Self-Drive Rentals"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@yourcompany.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5 }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98200 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5 }}>
                  Create Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 2
                    }}
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Fleet Plan Selection */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>
                  Select Initial Fleet Tier:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { id: 'Starter', name: 'Starter', range: '1–5 cars', price: '₹999' },
                    { id: 'Growth', name: 'Growth', range: '6–10 cars', price: '₹1,999', popular: true },
                    { id: 'Business', name: 'Business', range: '11–20 cars', price: '₹2,999' },
                    { id: 'Enterprise', name: 'Enterprise', range: '21+ cars', price: '₹4,000+' }
                  ].map((p) => {
                    const isSelected = selectedPlan === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-light)',
                          background: isSelected ? 'rgba(37, 99, 235, 0.06)' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                      >
                        {p.popular && (
                          <span style={{
                            position: 'absolute',
                            top: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#2563eb',
                            color: '#ffffff',
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 6,
                            whiteSpace: 'nowrap'
                          }}>
                            POPULAR
                          </span>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy-900)' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0' }}>
                          {p.range}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#2563eb' : 'var(--navy-700)' }}>
                          {p.price}<span style={{ fontSize: 9.5, fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)'
                }}
                disabled={loading}
              >
                {loading ? 'Creating Your Account...' : 'Create Account & Launch Console'}
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <span
                  onClick={() => setMode('login')}
                  style={{ color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
