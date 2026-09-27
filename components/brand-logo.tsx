'use client';

import React from 'react';
import Link from 'next/link';

export function BrandIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="grivo-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#86EFAC" />
        </linearGradient>
        <linearGradient id="grivo-inner-grad" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD" />
          <stop offset="1" stopColor="#86EFAC" />
        </linearGradient>
      </defs>
      {/* Outer Institutional Shield Contour */}
      <path
        d="M12 2.5L4 6.5V12.8C4 17.8 7.4 21.6 12 22.8C16.6 21.6 20 17.8 20 12.8V6.5L12 2.5Z"
        stroke="url(#grivo-logo-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Precision Check & Resolution Grid Pathway */}
      <path
        d="M8.5 12.5L11 15L15.8 9.5"
        stroke="url(#grivo-inner-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Status Active Pulse Apex Node */}
      <circle cx="12" cy="6" r="1.25" fill="#86EFAC" />
    </svg>
  );
}

interface BrandLogoProps {
  href?: string;
  tagline?: string;
  showTagline?: boolean;
}

export function BrandLogo({
  href = '/',
  tagline = 'Campus Grievance Platform',
  showTagline = true,
}: BrandLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl bg-charcoal border border-slate-700/80 p-[1px] shadow-sm transition-all duration-300 group-hover:scale-105">
        <div className="w-full h-full bg-charcoal rounded-[11px] flex items-center justify-center p-2">
          <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
        </div>
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-tight text-lg leading-tight">
            Grivo
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lavender text-charcoal">
            Campus
          </span>
        </div>
        {showTagline && (
          <span className="hidden sm:inline text-[11px] text-slate-300 font-normal leading-tight">
            {tagline}
          </span>
        )}
      </div>
    </Link>
  );
}
