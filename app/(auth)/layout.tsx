'use client';

import React from 'react';
import Link from 'next/link';
import { BrandIcon } from '@/components/brand-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cream text-body overflow-x-hidden selection:bg-lavender selection:text-charcoal">
      {/* Ambient background tints */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-lavender/15 via-mint/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-charcoal p-[1px] shadow-sm transition-all duration-300 group-hover:scale-105 border border-charcoal">
            <div className="w-full h-full bg-charcoal rounded-[15px] flex items-center justify-center p-2.5">
              <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-charcoal tracking-tight">
                Grivo
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lavender-soft text-charcoal border border-lavender/40">
                Campus
              </span>
            </div>
            <span className="text-[11px] text-slate font-medium tracking-wide">
              Campus Grievance & Resolution Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        {children}
      </div>
    </div>
  );
}
