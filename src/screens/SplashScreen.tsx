import React from 'react';
import type { UIStrings } from '../i18n/strings';

export const SplashScreen: React.FC<{ s: UIStrings }> = ({ s }) => (
  <div className="flex h-full flex-col items-center justify-center">
    <svg viewBox="0 0 24 24" width={160} height={160} fill="none" stroke="#f2a33c" strokeWidth={1.4} className="splash-logo">
      <path d="M6 19V9l6-5 6 5v10M4 19h16M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3c0 0 2.5-1 2.5-2.5" strokeLinecap="round" opacity={0.6} />
    </svg>
    <h1 className="mt-8 text-6xl font-extrabold text-ink">{s.appName}</h1>
    <p className="mt-4 text-2xl text-ink-dim">{s.tagline}</p>
    <p className="mt-12 animate-pulse text-2xl text-amber">{s.loading}</p>
  </div>
);
