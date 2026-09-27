'use client';

import React, { useEffect } from 'react';

// Single source of truth for build timestamp
export const BUILD_TIMESTAMP = '2026-09-27T00:45:00.000Z';

export function BuildTimestamp() {
  useEffect(() => {
    console.log(
      `%c[GRIVO BUILD TIMESTAMP] ${BUILD_TIMESTAMP}`,
      'background: #1F2937; color: #A78BFA; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
    );
    console.log('BUILD:', BUILD_TIMESTAMP);
  }, []);

  return (
    <div
      id="build-timestamp"
      className="fixed bottom-2 right-2 z-50 pointer-events-none opacity-60 hover:opacity-100 transition-opacity"
    >
      <span className="text-[10px] font-mono bg-charcoal text-slate-300 px-2 py-0.5 rounded border border-slate-700 shadow-sm">
        BUILD: {BUILD_TIMESTAMP.replace('.000Z', 'Z')}
      </span>
    </div>
  );
}
