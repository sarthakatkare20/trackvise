import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trackvise — The Operating System for Car Rental Businesses',
  description: 'Trackvise is a multi-tenant SaaS platform designed specifically for self-drive and car-rental businesses to manage their fleet, bookings, customers, payments, and operations.',
  keywords: ['car rental saas', 'self-drive rental management', 'fleet management', 'car booking software', 'Trackvise India'],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
