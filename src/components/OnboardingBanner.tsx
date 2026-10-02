'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onboarding: {
    hasCar: boolean;
    hasPricing: boolean;
    hasCustomer: boolean;
    hasBooking: boolean;
    isComplete: boolean;
  };
}

export const OnboardingBanner: React.FC<OnboardingProps> = ({ onboarding }) => {
  const { setOpenModal } = useApp();

  if (onboarding.isComplete) return null;

  const steps = [
    { title: 'Add your first car', done: onboarding.hasCar, action: () => setOpenModal('addCar') },
    { title: 'Add rental pricing', done: onboarding.hasPricing, action: () => setOpenModal('addCar') },
    { title: 'Add first customer', done: onboarding.hasCustomer, action: () => setOpenModal('addCustomer') },
    { title: 'Create first booking', done: onboarding.hasBooking, action: () => setOpenModal('createBooking') }
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      color: '#ffffff',
      marginBottom: 24,
      border: '1px solid #334155',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(37, 99, 235, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              Welcome to Trackvise! Quick Setup Checklist
            </div>
            <div style={{ fontSize: 12.5, color: '#94a3b8' }}>
              Complete these steps to get your rental business fully operational.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa' }}>
            {completedCount} of {steps.length} completed ({progressPercent}%)
          </span>
          <div style={{
            width: 120,
            height: 8,
            background: '#334155',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: '#2563eb',
              borderRadius: 4,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12
      }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            onClick={step.action}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              background: step.done ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${step.done ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {step.done ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <Circle size={18} color="#64748b" />
              )}
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: step.done ? '#a7f3d0' : '#f1f5f9',
                textDecoration: step.done ? 'line-through' : 'none'
              }}>
                {step.title}
              </span>
            </div>
            {!step.done && <ArrowRight size={14} color="#60a5fa" />}
          </div>
        ))}
      </div>
    </div>
  );
};
