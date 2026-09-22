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
        <linearGradient id="scms-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="scms-inner-grad" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Outer Institutional Shield Contour */}
      <path
        d="M12 2.5L4 6.5V12.8C4 17.8 7.4 21.6 12 22.8C16.6 21.6 20 17.8 20 12.8V6.5L12 2.5Z"
        stroke="url(#scms-logo-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Precision Check & Resolution Grid Pathway */}
      <path
        d="M8.5 12.5L11 15L15.8 9.5"
        stroke="url(#scms-inner-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Status Active Pulse Apex Node */}
      <circle cx="12" cy="6" r="1.25" fill="#38bdf8" />
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
  tagline = 'Smart Complaint System',
  showTagline = true,
}: BrandLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
        <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center p-2">
          <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
        </div>
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-tight text-lg leading-tight">
            SCMS
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Campus
          </span>
        </div>
        {showTagline && (
          <span className="hidden sm:inline text-[11px] text-slate-400 font-normal leading-tight">
            {tagline}
          </span>
        )}
      </div>
    </Link>
  );
}
