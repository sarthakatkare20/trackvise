'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  Car,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Building2,
  PhoneCall,
  Sliders
} from 'lucide-react';

interface PlanDetails {
  id: string;
  name: string;
  tagline: string;
  fleetRange: string;
  minCars: number;
  maxCars: number;
  monthlyPrice: number;
  annualPricePerMonth: number;
  badge?: string;
  popular?: boolean;
  color: string;
  features: string[];
  omittedFeatures: string[];
}

const PLANS: PlanDetails[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Ideal for independent operators & single-hub boutique fleets.',
    fleetRange: '1–5 cars',
    minCars: 1,
    maxCars: 5,
    monthlyPrice: 999,
    annualPricePerMonth: 799,
    color: '#0284c7',
    features: [
      'Up to 5 Registered Vehicles',
      'Real-time Double-Booking Conflict Engine',
      'Driver License & Aadhaar KYC Storage',
      'Instant GST Tax Invoicing (18%)',
      'Damage Claim Logging & Photos',
      '1 Staff Login + 1 Business Admin',
      'Standard Email & Community Support'
    ],
    omittedFeatures: [
      'Multi-hub dispatching',
      'Staff granular permission roles',
      'Dedicated Account Manager'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Built for expanding rental agencies scaling their active fleet.',
    fleetRange: '6–10 cars',
    minCars: 6,
    maxCars: 10,
    monthlyPrice: 1999,
    annualPricePerMonth: 1599,
    popular: true,
    badge: 'MOST POPULAR',
    color: '#2563eb',
    features: [
      'Up to 10 Registered Vehicles',
      'All Starter Features Included',
      'Automated Vehicle Return Inspection Checklist',
      'Operating Expense Ledger & Car-wise ROI',
      'Up to 3 Staff User Logins',
      'WhatsApp & SMS Booking Confirmation Alerts',
      'Priority WhatsApp Support (10 AM – 8 PM)'
    ],
    omittedFeatures: [
      'Custom invoice branding / domain',
      'Dedicated Account Manager'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For established car rental enterprises demanding total control.',
    fleetRange: '11–20 cars',
    minCars: 11,
    maxCars: 20,
    monthlyPrice: 2999,
    annualPricePerMonth: 2399,
    badge: 'BEST VALUE',
    color: '#7c3aed',
    features: [
      'Up to 20 Registered Vehicles',
      'All Growth Features Included',
      'Multi-Staff Role Based Permissions (Admin/Staff)',
      'Advanced Fleet Utilization & P&L Analytics',
      'Up to 8 Staff User Logins',
      'Comprehensive Damage Recovery Ledger',
      'Priority 24/7 Phone & WhatsApp Support'
    ],
    omittedFeatures: [
      'Custom ERP/GPS Telematics API integrations'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'High-volume operators with 20+ cars, multiple hubs or franchises.',
    fleetRange: '21+ cars',
    minCars: 21,
    maxCars: 100,
    monthlyPrice: 4000,
    annualPricePerMonth: 3200,
    badge: 'UNLIMITED SCALE',
    color: '#0f172a',
    features: [
      '21+ Cars (Custom Scalable Quotas)',
      'All Business Features Included',
      'Unlimited Staff & Multi-Hub Admin Accounts',
      'Custom White-Label Invoice & Booking Prefixes',
      'GPS Tracker & Fastag API Integration Ready',
      'Dedicated Account Manager & Fast-Track Onboarding',
      'Custom Feature Engineering & SLA Guarantees'
    ],
    omittedFeatures: []
  }
];

export const PricingView: React.FC = () => {
  const { tenant, showToast, triggerRefresh } = useApp();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [fleetSlider, setFleetSlider] = useState<number>(8);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [currentCarCount, setCurrentCarCount] = useState<number>(0);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/subscriptions')
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription) setCurrentSub(data.subscription);
        if (data.carCount !== undefined) {
          setCurrentCarCount(data.carCount);
          if (data.carCount > 0) setFleetSlider(data.carCount);
        }
      })
      .catch(console.error);
  }, []);

  const getRecommendedPlanId = (cars: number) => {
    if (cars <= 5) return 'starter';
    if (cars <= 10) return 'growth';
    if (cars <= 20) return 'business';
    return 'enterprise';
  };

  const recommendedPlanId = getRecommendedPlanId(fleetSlider);

  const handleSelectPlan = async (plan: PlanDetails) => {
    const amount = billingCycle === 'ANNUAL' ? plan.annualPricePerMonth * 12 : plan.monthlyPrice;
    setUpgradingPlan(plan.id);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.name,
          amount,
          billingCycle
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update plan', 'error');
        return;
      }

      setCurrentSub(data.subscription);
      showToast(`Congratulations! You are now on the Trackvise ${plan.name} plan.`, 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error processing plan upgrade', 'error');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const faqs = [
    {
      q: 'Can I change my plan as my fleet size grows or contracts?',
      a: 'Yes, absolutely. Trackvise lets you upgrade or downgrade seamlessly at any time. When you add more cars to your fleet beyond your current tier limit, you will be prompted to upgrade to the matching tier.'
    },
    {
      q: 'Are GST invoices provided for the subscription fee?',
      a: 'Yes. All subscription payments generate a 18% GST input tax credit invoice containing your registered company name and GSTIN number.'
    },
    {
      q: 'What happens if my fleet exceeds 20 cars?',
      a: 'For fleets of 21 cars and above, our Enterprise tier starts at ₹4,000/month and scales based on your exact vehicle count with tailored volume pricing and dedicated onboarding support.'
    },
    {
      q: 'Is there any long-term lock-in or cancellation fee?',
      a: 'No lock-in contracts. Monthly plans can be renewed or cancelled monthly with zero cancellation penalties. Annual plans give you a 20% discount (equivalent to 2.4 months free).'
    },
    {
      q: 'Can multiple staff members access the CRM simultaneously?',
      a: 'Yes! Depending on your chosen tier, you can add Staff users with operational permissions (making bookings, return inspections) without exposing company financial settings.'
    }
  ];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{
        textAlign: 'center',
        padding: '36px 20px 24px 20px',
        marginBottom: 28,
        borderRadius: 20,
        background: 'radial-gradient(ellipse at 50% -20%, rgba(37, 99, 235, 0.15), transparent 70%), var(--bg-card)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          background: 'rgba(37, 99, 235, 0.1)',
          color: '#2563eb',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 12
        }}>
          <Sparkles size={14} />
          Transparent & Fleet-Scaled Pricing
        </div>

        <h1 className="title-xl" style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 10 }}>
          Pick the Perfect Plan for Your Car Rental Business
        </h1>
        <p className="text-body" style={{ maxWidth: 640, margin: '0 auto', fontSize: 15 }}>
          Built specifically for Indian self-drive & chauffeur car rental operators. Simple, transparent pricing based strictly on your active fleet size.
        </p>

        {/* Billing Cycle Switcher */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-subtle)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--border-light)',
          marginTop: 24,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            style={{
              padding: '8px 18px',
              borderRadius: 9,
              border: 'none',
              background: billingCycle === 'MONTHLY' ? '#ffffff' : 'transparent',
              color: billingCycle === 'MONTHLY' ? 'var(--navy-900)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: billingCycle === 'MONTHLY' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            style={{
              padding: '8px 18px',
              borderRadius: 9,
              border: 'none',
              background: billingCycle === 'ANNUAL' ? '#ffffff' : 'transparent',
              color: billingCycle === 'ANNUAL' ? '#2563eb' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: billingCycle === 'ANNUAL' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Annual Billing</span>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 10
            }}>
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Fleet Size Calculator Bar */}
      <div className="card" style={{
        padding: '20px 28px',
        marginBottom: 32,
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        border: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sliders size={18} color="#2563eb" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)' }}>
              How many cars are currently in your fleet?
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            Slide to find the most cost-effective tier tailored for your rental garage.
          </p>
        </div>

        <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            type="range"
            min="1"
            max="35"
            value={fleetSlider}
            onChange={(e) => setFleetSlider(parseInt(e.target.value, 10))}
            style={{
              flex: 1,
              accentColor: '#2563eb',
              cursor: 'pointer'
            }}
          />
          <div style={{
            minWidth: 90,
            textAlign: 'center',
            padding: '6px 12px',
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #bfdbfe',
            boxShadow: '0 2px 4px rgba(37,99,235,0.08)'
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>{fleetSlider}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>
              {fleetSlider === 1 ? 'car' : 'cars'}
            </span>
          </div>
        </div>

        <div style={{
          padding: '8px 16px',
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #93c5fd',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Recommended Tier:
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#1e40af',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {recommendedPlanId} Plan
          </span>
        </div>
      </div>

      {/* 4 Pricing Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        marginBottom: 40
      }}>
        {PLANS.map((plan) => {
          const isRecommended = recommendedPlanId === plan.id;
          const isCurrentPlan = currentSub?.plan?.toLowerCase().includes(plan.id.toLowerCase());
          const price = billingCycle === 'ANNUAL' ? plan.annualPricePerMonth : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className="card"
              style={{
                position: 'relative',
                padding: '28px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 16,
                border: isRecommended
                  ? '2px solid #2563eb'
                  : '1px solid var(--border-light)',
                boxShadow: isRecommended
                  ? '0 12px 30px -6px rgba(37, 99, 235, 0.22)'
                  : 'var(--shadow-sm)',
                transform: isRecommended ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease',
                background: '#ffffff'
              }}
            >
              {/* Card Top Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.popular
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '4px 14px',
                  borderRadius: 20,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap'
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    {plan.name}
                  </h3>
                  {isCurrentPlan && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      ACTIVE PLAN
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', minHeight: 38, lineHeight: 1.4, margin: '4px 0 16px 0' }}>
                  {plan.tagline}
                </p>

                {/* Fleet Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  marginBottom: 16
                }}>
                  <Car size={15} color="#2563eb" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)' }}>
                    Fleet: {plan.fleetRange}
                  </span>
                </div>

                {/* Price Display */}
                <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--navy-900)' }}>
                      ₹{price.toLocaleString('en-IN')}
                      {plan.id === 'enterprise' ? '+' : ''}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                      / month
                    </span>
                  </div>
                  {billingCycle === 'ANNUAL' ? (
                    <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                      Billed annually (₹{(price * 12).toLocaleString('en-IN')}/yr)
                    </div>
                  ) : (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      Billed monthly + 18% GST
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
                    What’s included:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={upgradingPlan === plan.id}
                  className={`btn ${isRecommended || plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    borderRadius: 10,
                    boxShadow: isRecommended ? '0 4px 12px rgba(37,99,235,0.3)' : 'none'
                  }}
                >
                  {upgradingPlan === plan.id ? (
                    'Activating...'
                  ) : isCurrentPlan ? (
                    'Current Active Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Summary Comparison Table */}
      <div className="card" style={{ padding: 28, marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <TrendingUp size={20} color="#2563eb" />
          <h2 className="title-md" style={{ margin: 0 }}>Plan & Fleet Capacity Matrix</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Plan Tier</th>
                <th>Fleet Capacity</th>
                <th>Monthly Rate</th>
                <th>Annual Rate (Save 20%)</th>
                <th>Max Staff Logins</th>
                <th>Invoicing & KYC</th>
                <th>Support SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 800, color: '#0284c7' }}>Starter</td>
                <td><strong>1–5 cars</strong></td>
                <td>₹999 / month</td>
                <td><span style={{ color: '#16a34a', fontWeight: 700 }}>₹799 / mo</span></td>
                <td>2 Accounts</td>
                <td>Included (18% GST)</td>
                <td>Standard Email</td>
              </tr>
              <tr style={{ background: 'rgba(37, 99, 235, 0.03)' }}>
                <td style={{ fontWeight: 800, color: '#2563eb' }}>
                  Growth <span className="badge badge-primary" style={{ marginLeft: 6, fontSize: 10 }}>Popular</span>
                </td>
                <td><strong>6–10 cars</strong></td>
                <td>₹1,999 / month</td>
                <td><span style={{ color: '#16a34a', fontWeight: 700 }}>₹1,599 / mo</span></td>
                <td>3 Accounts</td>
                <td>Included + WhatsApp Alerts</td>
                <td>Priority WhatsApp</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#7c3aed' }}>Business</td>
                <td><strong>11–20 cars</strong></td>
                <td>₹2,999 / month</td>
                <td><span style={{ color: '#16a34a', fontWeight: 700 }}>₹2,399 / mo</span></td>
                <td>8 Accounts</td>
                <td>Included + P&L Analytics</td>
                <td>24/7 Phone & WhatsApp</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>Enterprise</td>
                <td><strong>21+ cars</strong></td>
                <td>₹4,000+ / month</td>
                <td><span style={{ color: '#16a34a', fontWeight: 700 }}>₹3,200+ / mo</span></td>
                <td>Unlimited</td>
                <td>Custom White-Label</td>
                <td>Dedicated Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Indian Operator FAQ Section */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HelpCircle size={20} color="#2563eb" />
          <h2 className="title-md" style={{ margin: 0 }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: isOpen ? 'var(--bg-subtle)' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--navy-900)'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 18px 16px 18px',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 12,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneCall size={16} color="#60a5fa" />
              Need a custom plan or high-volume multi-hub setup?
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Speak with our car rental automation architects. We help with custom ERP & GPS tracker integrations.
            </div>
          </div>
          <button
            onClick={() => showToast('Connecting to Trackvise Enterprise Sales Desk...', 'info')}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap' }}
          >
            Contact Sales Support
          </button>
        </div>
      </div>
    </div>
  );
};
