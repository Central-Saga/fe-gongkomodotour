// src/app/(landing)/layout.tsx
import { ReactNode } from 'react';
import LandingHeader from '@/components/LandingHeader';

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <LandingHeader />
      <main className="container mx-auto p-4">{children}</main>
      <footer className="py-4 text-center text-gray-600">
        © 2025 Gong Komodo Tour & Travel
      </footer>
    </div>
  );
}