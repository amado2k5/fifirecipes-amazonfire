import React from 'react';
import { Focusable, FocusGroup } from './Focusable';

interface ErrorScreenProps {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ title, body, retryLabel, onRetry }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-night text-center px-40">
    <svg viewBox="0 0 24 24" width={120} height={120} fill="none" stroke="#f2a33c" strokeWidth={1.6} className="mb-8">
      <path d="M12 8v5m0 3.5v.5M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <h1 className="text-5xl font-bold mb-5">{title}</h1>
    <p className="text-3xl text-ink-dim leading-relaxed mb-12 max-w-4xl">{body}</p>
    <FocusGroup focusKey="error-actions" className="flex gap-6">
      <Focusable focusKey="error-retry" onEnter={onRetry} className="rounded-2xl">
        <span className="block rounded-2xl bg-amber px-12 py-5 text-3xl font-bold text-night">{retryLabel}</span>
      </Focusable>
    </FocusGroup>
  </div>
);
