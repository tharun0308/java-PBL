'use client';

import React from 'react';

interface CampusIllustrationProps {
  className?: string;
}

export function CampusIllustration({ className = '' }: CampusIllustrationProps) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className={`w-full h-full block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Architectural Faint Silhouette Gradients (~15-20% effective fill opacity) */}
        <linearGradient id="towerGlowGrad" x1="720" y1="200" x2="720" y2="740" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3730a3" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#2e2a72" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.25" />
        </linearGradient>

        <linearGradient id="engGlowGrad" x1="360" y1="420" x2="360" y2="740" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#283548" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.25" />
        </linearGradient>

        <linearGradient id="libGlowGrad" x1="1080" y1="430" x2="1080" y2="740" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#283548" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.25" />
        </linearGradient>

        <radialGradient id="lampLightGrad" cx="0.5" cy="0" r="0.65">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ================================================================== */}
      {/* 1. DISTANT BACKGROUND ARCHITECTURE (Domes & Secondary Pavilions)   */}
      {/* ================================================================== */}
      <g opacity="0.22">
        {/* Distant West Wing */}
        <path d="M50,740 L50,560 Q150,500 250,560 L250,740 Z" fill="#282566" stroke="#6366f1" strokeWidth="1.5" />
        {/* Distant East Wing */}
        <path d="M1190,740 L1190,560 Q1290,500 1390,560 L1390,740 Z" fill="#282566" stroke="#6366f1" strokeWidth="1.5" />
        {/* Secondary Trees */}
        <polygon points="60,740 85,640 110,740" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <polygon points="110,740 135,620 160,740" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx="1320" cy="660" r="35" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <polygon points="1350,740 1375,640 1400,740" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      </g>

      {/* ================================================================== */}
      {/* CAMPUS ARCHITECTURE LAYER (Subtle Faint Silhouette: Opacity 0.28)  */}
      {/* Fills: ~15-20% effective opacity, Strokes: crisp & non-intrusive   */}
      {/* ================================================================== */}
      <g id="campus-architecture" opacity="0.28">
        {/* ================================================================ */}
        {/* 2. WEST WING: ENGINEERING BLOCK C                                */}
        {/* ================================================================ */}
        <g id="engineering-block">
          {/* Building Structure */}
          <rect
            x="160"
            y="420"
            width="400"
            height="320"
            rx="4"
            fill="url(#engGlowGrad)"
            stroke="#818cf8"
            strokeWidth="2.2"
          />

          {/* Roof Parapet & Communication Antenna Mast */}
          <rect x="150" y="412" width="420" height="10" rx="2" fill="#3730a3" stroke="#818cf8" strokeWidth="1.6" />
          <line x1="220" y1="412" x2="220" y2="330" stroke="#a5b4fc" strokeWidth="2.5" />
          <path d="M205,348 Q220,325 235,348" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
          <circle cx="220" cy="326" r="3.5" fill="#7dd3fc" />
          {/* Rooftop Solar/HVAC Bank */}
          <rect x="340" y="394" width="120" height="18" rx="2" fill="#282566" stroke="#a5b4fc" strokeWidth="1.6" />
          <line x1="370" y1="394" x2="370" y2="412" stroke="#38bdf8" strokeWidth="1.6" />
          <line x1="400" y1="394" x2="400" y2="412" stroke="#38bdf8" strokeWidth="1.6" />
          <line x1="430" y1="394" x2="430" y2="412" stroke="#38bdf8" strokeWidth="1.6" />

          {/* Sign Plate */}
          <rect x="270" y="432" width="180" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.6" />
          <text x="360" y="448" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">
            ENGINEERING BLOCK C
          </text>

          {/* Window Matrix (3 Floors) */}
          {/* Floor 1 */}
          <rect x="195" y="475" width="42" height="34" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="255" y="475" width="42" height="34" rx="3" fill="#38bdf8" fillOpacity="0.55" />
          <rect x="315" y="475" width="42" height="34" rx="3" fill="#a5b4fc" fillOpacity="0.5" />
          <rect x="405" y="475" width="42" height="34" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="465" y="475" width="42" height="34" rx="3" fill="#38bdf8" fillOpacity="0.55" />

          {/* Floor 2 */}
          <rect x="195" y="535" width="42" height="34" rx="3" fill="#a5b4fc" fillOpacity="0.5" />
          <rect x="255" y="535" width="42" height="34" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="315" y="535" width="42" height="34" rx="3" fill="#38bdf8" fillOpacity="0.55" />
          <rect x="405" y="535" width="42" height="34" rx="3" fill="#a5b4fc" fillOpacity="0.5" />
          <rect x="465" y="535" width="42" height="34" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />

          {/* Floor 3 / Ground Entrance */}
          <rect x="195" y="595" width="42" height="34" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="255" y="595" width="42" height="34" rx="3" fill="#fbbf24" fillOpacity="0.5" />
          {/* Double Entrance Glass Doors */}
          <rect x="330" y="645" width="80" height="95" rx="3" fill="#0f172a" stroke="#a5b4fc" strokeWidth="2.2" />
          <rect x="338" y="653" width="30" height="87" fill="#282566" stroke="#818cf8" strokeWidth="1.2" />
          <rect x="372" y="653" width="30" height="87" fill="#282566" stroke="#818cf8" strokeWidth="1.2" />
          <line x1="370" y1="645" x2="370" y2="740" stroke="#a5b4fc" strokeWidth="1.6" />
          <rect x="465" y="595" width="42" height="34" rx="3" fill="#fbbf24" fillOpacity="0.5" />
        </g>

        {/* ================================================================ */}
        {/* 3. CENTER: MAIN ACADEMIC HALL & CLOCK TOWER                      */}
        {/* ================================================================ */}
        <g id="main-admin-clocktower">
          {/* Flanking Neoclassical Hall Wings */}
          <rect x="580" y="470" width="120" height="270" fill="#282566" stroke="#818cf8" strokeWidth="2.2" />
          <rect x="840" y="470" width="120" height="270" fill="#282566" stroke="#818cf8" strokeWidth="2.2" />

          {/* Windows on Flanking Halls */}
          <rect x="600" y="500" width="34" height="42" rx="3" fill="#38bdf8" fillOpacity="0.55" />
          <rect x="650" y="500" width="34" height="42" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="600" y="570" width="34" height="42" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="650" y="570" width="34" height="42" rx="3" fill="#fbbf24" fillOpacity="0.5" />

          <rect x="860" y="500" width="34" height="42" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <rect x="910" y="500" width="34" height="42" rx="3" fill="#a5b4fc" fillOpacity="0.55" />
          <rect x="860" y="570" width="34" height="42" rx="3" fill="#38bdf8" fillOpacity="0.55" />
          <rect x="910" y="570" width="34" height="42" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />

          {/* Main Clock Tower Base */}
          <rect
            x="680"
            y="270"
            width="160"
            height="470"
            fill="url(#towerGlowGrad)"
            stroke="#818cf8"
            strokeWidth="2.6"
          />

          {/* Spire Roof Pyramid */}
          <polygon
            points="665,270 760,175 855,270"
            fill="#3730a3"
            stroke="#a5b4fc"
            strokeWidth="2.6"
          />
          {/* Spire Flagpole & Flag */}
          <line x1="760" y1="175" x2="760" y2="140" stroke="#e2e8f0" strokeWidth="2.5" />
          <path
            d="M760,142 L800,152 L760,162 Z"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="1.4"
          />

          {/* Faint Ambient Clock Face */}
          <circle cx="760" cy="340" r="38" fill="#090d16" stroke="#a5b4fc" strokeWidth="3.6" />
          {/* Clock Ticks at 12, 3, 6, 9 */}
          <line x1="760" y1="308" x2="760" y2="316" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="760" y1="364" x2="760" y2="372" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="728" y1="340" x2="736" y2="340" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="784" y1="340" x2="792" y2="340" stroke="#ffffff" strokeWidth="2.5" />
          {/* Faint Hands */}
          <line x1="760" y1="340" x2="742" y2="326" stroke="#67e8f9" strokeWidth="3.6" strokeLinecap="round" />
          <line x1="760" y1="340" x2="780" y2="323" stroke="#67e8f9" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="760" cy="340" r="4.5" fill="#f8fafc" />

          {/* Middle Tower Arched Window */}
          <path
            d="M738,420 Q760,395 782,420 L782,460 L738,460 Z"
            fill="#0f172a"
            stroke="#a5b4fc"
            strokeWidth="2.2"
          />
          <rect x="746" y="425" width="28" height="32" fill="#38bdf8" fillOpacity="0.4" />

          {/* Grand Portico Pillars */}
          <polygon points="670,620 760,580 850,620" fill="#282566" stroke="#a5b4fc" strokeWidth="2.2" />
          <line x1="695" y1="620" x2="695" y2="740" stroke="#a5b4fc" strokeWidth="4.2" />
          <line x1="735" y1="620" x2="735" y2="740" stroke="#a5b4fc" strokeWidth="4.2" />
          <line x1="785" y1="620" x2="785" y2="740" stroke="#a5b4fc" strokeWidth="4.2" />
          <line x1="825" y1="620" x2="825" y2="740" stroke="#a5b4fc" strokeWidth="4.2" />
          <rect x="675" y="730" width="170" height="10" fill="#3730a3" stroke="#a5b4fc" strokeWidth="1.2" />
        </g>

        {/* ================================================================ */}
        {/* 4. EAST WING: CENTRAL LIBRARY & RESEARCH ATRIUM                   */}
        {/* ================================================================ */}
        <g id="library-block">
          {/* Main Body */}
          <rect
            x="980"
            y="430"
            width="400"
            height="310"
            rx="4"
            fill="url(#libGlowGrad)"
            stroke="#818cf8"
            strokeWidth="2.2"
          />
          <rect x="970" y="422" width="420" height="10" rx="2" fill="#3730a3" stroke="#818cf8" strokeWidth="1.6" />

          {/* Glass Dome Atrium */}
          <path
            d="M1100,422 A60,60 0 0,1 1220,422 Z"
            fill="#282566"
            stroke="#a5b4fc"
            strokeWidth="2.6"
          />
          <line x1="1160" y1="362" x2="1160" y2="422" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="1120" y1="386" x2="1200" y2="386" stroke="#38bdf8" strokeWidth="2.2" />

          {/* Building Sign */}
          <rect x="1080" y="440" width="180" height="24" rx="4" fill="#0f172a" stroke="#a5b4fc" strokeWidth="1.6" />
          <text x="1170" y="456" fill="#a5b4fc" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">
            CENTRAL LIBRARY
          </text>

          {/* Arched Windows with Faint Warm Study Light */}
          {/* Top Row */}
          <path d="M1010,490 Q1030,470 1050,490 L1050,525 L1010,525 Z" fill="#fbbf24" fillOpacity="0.5" stroke="#d97706" strokeWidth="1.2" />
          <path d="M1070,490 Q1090,470 1110,490 L1110,525 L1070,525 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <path d="M1130,490 Q1150,470 1170,490 L1170,525 L1130,525 Z" fill="#fbbf24" fillOpacity="0.5" stroke="#d97706" strokeWidth="1.2" />
          <path d="M1210,490 Q1230,470 1250,490 L1250,525 L1210,525 Z" fill="#fbbf24" fillOpacity="0.5" stroke="#d97706" strokeWidth="1.2" />
          <path d="M1270,490 Q1290,470 1310,490 L1310,525 L1270,525 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <path d="M1330,490 Q1350,470 1370,490 L1370,525 L1330,525 Z" fill="#38bdf8" fillOpacity="0.5" stroke="#0284c7" strokeWidth="1.2" />

          {/* Bottom Row */}
          <path d="M1010,565 Q1030,545 1050,565 L1050,600 L1010,600 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <path d="M1070,565 Q1090,545 1110,565 L1110,600 L1070,600 Z" fill="#fbbf24" fillOpacity="0.5" stroke="#d97706" strokeWidth="1.2" />
          <path d="M1130,565 Q1150,545 1170,565 L1170,600 L1130,600 Z" fill="#38bdf8" fillOpacity="0.5" stroke="#0284c7" strokeWidth="1.2" />
          <path d="M1210,565 Q1230,545 1250,565 L1250,600 L1210,600 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
          <path d="M1270,565 Q1290,545 1310,565 L1310,600 L1270,600 Z" fill="#fbbf24" fillOpacity="0.5" stroke="#d97706" strokeWidth="1.2" />
          <path d="M1330,565 Q1350,545 1370,565 L1370,600 L1330,600 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="1.4" />
        </g>

        {/* Foreground Campus Trees & Foliage */}
        <g id="campus-trees">
          <polygon points="60,740 90,650 120,740" fill="#282566" stroke="#818cf8" strokeWidth="1.6" />
          <polygon points="70,695 90,630 110,695" fill="#3730a3" />
          <circle cx="40" cy="685" r="28" fill="#282566" stroke="#818cf8" strokeWidth="1.6" />
          <line x1="40" y1="713" x2="40" y2="740" stroke="#a5b4fc" strokeWidth="3" />

          <polygon points="1380,740 1410,650 1440,740" fill="#282566" stroke="#818cf8" strokeWidth="1.6" />
          <polygon points="1390,695 1410,630 1430,695" fill="#3730a3" />
          <circle cx="1450" cy="685" r="28" fill="#282566" stroke="#818cf8" strokeWidth="1.6" />
        </g>
      </g>

      {/* ================================================================== */}
      {/* 5. CAMPUS LAMPPOSTS WITH AMBIENT LIGHT CONES                       */}
      {/* ================================================================== */}
      <g id="campus-lampposts" opacity="0.6">
        {/* Post 1 */}
        <polygon points="180,740 205,620 230,740" fill="url(#lampLightGrad)" />
        <line x1="205" y1="620" x2="205" y2="740" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M198,623 Q205,617 212,623" stroke="#38bdf8" strokeWidth="3" fill="none" />
        <circle cx="205" cy="623" r="4.5" fill="#7dd3fc" />

        {/* Post 2 */}
        <polygon points="535,740 560,620 585,740" fill="url(#lampLightGrad)" />
        <line x1="560" y1="620" x2="560" y2="740" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M553,623 Q560,617 567,623" stroke="#38bdf8" strokeWidth="3" fill="none" />
        <circle cx="560" cy="623" r="4.5" fill="#7dd3fc" />

        {/* Post 3 */}
        <polygon points="935,740 960,620 985,740" fill="url(#lampLightGrad)" />
        <line x1="960" y1="620" x2="960" y2="740" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M953,623 Q960,617 967,623" stroke="#38bdf8" strokeWidth="3" fill="none" />
        <circle cx="960" cy="623" r="4.5" fill="#7dd3fc" />

        {/* Post 4 */}
        <polygon points="1285,740 1310,620 1335,740" fill="url(#lampLightGrad)" />
        <line x1="1310" y1="620" x2="1310" y2="740" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M1303,623 Q1310,617 1317,623" stroke="#38bdf8" strokeWidth="3" fill="none" />
        <circle cx="1310" cy="623" r="4.5" fill="#7dd3fc" />
      </g>

      {/* ================================================================== */}
      {/* 6. WALKWAY CURB BASELINE (y = 740)                                 */}
      {/* ================================================================== */}
      <g id="campus-ground-lines" opacity="0.8">
        <line x1="0" y1="737" x2="1440" y2="737" stroke="#10b981" strokeWidth="2.2" strokeOpacity="0.85" />
        <line x1="0" y1="740" x2="1440" y2="740" stroke="#818cf8" strokeWidth="2.6" strokeOpacity="0.9" />
        {/* Paving block perspective joints */}
        <line x1="180" y1="740" x2="160" y2="900" stroke="#475569" strokeWidth="1.6" strokeOpacity="0.7" />
        <line x1="420" y1="740" x2="400" y2="900" stroke="#475569" strokeWidth="1.6" strokeOpacity="0.7" />
        <line x1="680" y1="740" x2="660" y2="900" stroke="#475569" strokeWidth="1.6" strokeOpacity="0.7" />
        <line x1="940" y1="740" x2="920" y2="900" stroke="#475569" strokeWidth="1.6" strokeOpacity="0.7" />
        <line x1="1200" y1="740" x2="1180" y2="900" stroke="#475569" strokeWidth="1.6" strokeOpacity="0.7" />
      </g>

      {/* ================================================================== */}
      {/* 7. ANIMATED BIRDS: EXACT SAME CLEAR VIBRANT SKY FLIGHT (DO NOT MOD)*/}
      {/* ================================================================== */}
      <g id="campus-birds-layer" opacity="0.90">
        {/* Bird 1: High glider in bright cyan */}
        <g className="anim-campus-bird-1">
          <g className="anim-campus-bird-bob">
            <path
              d="M-12,2.5 Q-6,-6 0,1 Q6,-6 12,2.5"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Bird 2: Mid-altitude soaring in light periwinkle/indigo */}
        <g className="anim-campus-bird-2">
          <g className="anim-campus-bird-bob">
            <path
              d="M-9,2 Q-4.5,-4.5 0,1 Q4.5,-4.5 9,2"
              fill="none"
              stroke="#a5b4fc"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Bird 3: Smooth cruising flyer in aqua cyan */}
        <g className="anim-campus-bird-3">
          <g className="anim-campus-bird-bob">
            <path
              d="M-10.5,2.2 Q-5,-5 0,1 Q5,-5 10.5,2.2"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>

      {/* ================================================================== */}
      {/* 8. ANIMATED STICK FIGURES: EXACT SAME ROLE CHARACTERS (DO NOT MOD) */}
      {/* ================================================================== */}
      <g id="stick-figures-layer" opacity="1">
        {/* Figure 1: Student with backpack (Cool Blue/Cyan tone) */}
        <g className="anim-campus-walk-1">
          <g className="anim-campus-bob">
            {/* Head - Cool Blue */}
            <circle cx="0" cy="686" r="7.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            {/* Torso - Vibrant Sky Blue */}
            <line x1="0" y1="693.5" x2="0" y2="716" stroke="#38bdf8" strokeWidth="3.4" strokeLinecap="round" />
            {/* Backpack on right with bright cyan outline */}
            <rect x="3.5" y="696" width="7.5" height="13" rx="2.5" fill="#0369a1" stroke="#67e8f9" strokeWidth="1.5" />
            <line x1="3.5" y1="702" x2="11" y2="702" stroke="#38bdf8" strokeWidth="1.2" />
            {/* Left Arm */}
            <line className="anim-campus-arm-l" x1="0" y1="698" x2="-8.5" y2="711" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
            {/* Right Arm */}
            <line className="anim-campus-arm-r" x1="0" y1="698" x2="8.5" y2="709" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
            {/* Left Leg - Ocean Blue */}
            <line className="anim-campus-leg-l" x1="0" y1="716" x2="-5.5" y2="740" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" />
            {/* Right Leg */}
            <line className="anim-campus-leg-r" x1="0" y1="716" x2="6" y2="740" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        </g>

        {/* Figure 2: Facility Technician (Warm Amber/Orange tone) */}
        <g className="anim-campus-walk-2">
          <g className="anim-campus-bob">
            {/* Head / Safety Hard Hat */}
            <circle cx="0" cy="686" r="7.5" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />
            <path d="M-8.5,684 Q0,681 8.5,684" stroke="#f59e0b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Torso - High-Vis Orange */}
            <line x1="0" y1="693.5" x2="0" y2="716" stroke="#f97316" strokeWidth="3.4" strokeLinecap="round" />
            {/* Tool / Clipboard held in forward hand */}
            <rect x="-12" y="702" width="6" height="9" rx="1.5" fill="#b45309" stroke="#fde047" strokeWidth="1.5" />
            <line x1="-10" y1="702" x2="-8" y2="702" stroke="#fef08a" strokeWidth="1.2" />
            {/* Left Arm */}
            <line className="anim-campus-arm-l" x1="0" y1="698" x2="-9.5" y2="709" stroke="#fb923c" strokeWidth="2.8" strokeLinecap="round" />
            {/* Right Arm */}
            <line className="anim-campus-arm-r" x1="0" y1="698" x2="7.5" y2="708" stroke="#fb923c" strokeWidth="2.8" strokeLinecap="round" />
            {/* Left Leg - Deep Amber/Rust */}
            <line className="anim-campus-leg-l" x1="0" y1="716" x2="-6.5" y2="740" stroke="#ea580c" strokeWidth="3.2" strokeLinecap="round" />
            {/* Right Leg */}
            <line className="anim-campus-leg-r" x1="0" y1="716" x2="5.5" y2="740" stroke="#ea580c" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        </g>

        {/* Figure 3: Scholar / Faculty (Warmer Indigo/Purple tone) */}
        <g className="anim-campus-walk-3">
          <g className="anim-campus-bob">
            {/* Head - Royal Purple */}
            <circle cx="0" cy="686" r="7.5" fill="#7c3aed" stroke="#c084fc" strokeWidth="2" />
            {/* Torso - Vibrant Purple */}
            <line x1="0" y1="693.5" x2="0" y2="716" stroke="#a855f7" strokeWidth="3.4" strokeLinecap="round" />
            {/* Messenger bag diagonal strap & satchel */}
            <line x1="-5" y1="695" x2="5" y2="714" stroke="#e879f9" strokeWidth="2" />
            <rect x="3" y="709" width="7" height="9" rx="1.5" fill="#581c87" stroke="#e879f9" strokeWidth="1.5" />
            {/* Left Arm */}
            <line className="anim-campus-arm-l" x1="0" y1="698" x2="-8.5" y2="711" stroke="#c084fc" strokeWidth="2.8" strokeLinecap="round" />
            {/* Right Arm */}
            <line className="anim-campus-arm-r" x1="0" y1="698" x2="8" y2="709" stroke="#c084fc" strokeWidth="2.8" strokeLinecap="round" />
            {/* Left Leg - Deep Violet */}
            <line className="anim-campus-leg-l" x1="0" y1="716" x2="-5.5" y2="740" stroke="#9333ea" strokeWidth="3.2" strokeLinecap="round" />
            {/* Right Leg */}
            <line className="anim-campus-leg-r" x1="0" y1="716" x2="6.5" y2="740" stroke="#9333ea" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
}
