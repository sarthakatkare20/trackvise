'use client';

import React from 'react';
import logoImg from '@/assets/images/logo.png';

interface TrackviseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon' | 'logo-image';
  theme?: 'dark' | 'light';
  className?: string;
  style?: React.CSSProperties;
}

export const TrackviseLogoIcon: React.FC<{
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  bordered?: boolean;
}> = ({
  size = 40,
  style,
  className,
  bordered = false
}) => {
  const radius = Math.round(size * 0.24);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        background: 'transparent',
        boxShadow: bordered ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
        ...style
      }}
    >
      <img
        src={logoImg.src || '/logo.png'}
        alt="Trackvise Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
};

export const TrackviseLogo: React.FC<TrackviseLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'dark',
  className,
  style
}) => {
  const iconSizes = {
    sm: 32,
    md: 42,
    lg: 52,
    xl: 64
  };

  const titleSizes = {
    sm: 15,
    md: 19,
    lg: 24,
    xl: 30
  };

  const subtitleSizes = {
    sm: 10,
    md: 11.5,
    lg: 13,
    xl: 15
  };

  const isLight = theme === 'light';

  if (variant === 'logo-image') {
    return (
      <TrackviseLogoIcon
        size={iconSizes[size]}
        className={className}
        style={style}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'sm' ? 8 : size === 'xl' ? 14 : 12,
        ...style
      }}
    >
      <TrackviseLogoIcon size={iconSizes[size]} />

      {variant !== 'icon' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: titleSizes[size],
              fontWeight: 800,
              color: isLight ? '#0b1120' : '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <span>Trackvise</span>
            <span
              style={{
                fontSize: size === 'sm' ? 9.5 : size === 'xl' ? 12 : 10.5,
                fontWeight: 800,
                background: isLight ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.28)',
                color: isLight ? '#2563eb' : '#60a5fa',
                padding: '1.5px 6.5px',
                borderRadius: 6,
                border: isLight ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(96, 165, 250, 0.45)',
                letterSpacing: '0.02em',
                lineHeight: 1.3
              }}
            >
              OS
            </span>
          </div>

          {variant === 'full' && (
            <div
              style={{
                fontSize: subtitleSizes[size],
                color: isLight ? '#64748b' : '#94a3b8',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                marginTop: 2
              }}
            >
              Fleet Operating System
            </div>
          )}
        </div>
      )}
    </div>
  );
};

