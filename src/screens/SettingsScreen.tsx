import React from 'react';
import { useApp } from '../app/AppContext';
import { Focusable, FocusGroup } from '../components/Focusable';
import { TopNav } from '../components/TopNav';

export const SETTINGS_DEFAULT_FOCUS = 'set-language';

export const SettingsScreen: React.FC = () => {
  const { s, langInfo, manifest, navigate } = useApp();
  return (
    <div className="flex h-full flex-col">
      <TopNav active="settings" />
      <FocusGroup focusKey="settings" className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pb-16">
        <div className="flex max-w-4xl flex-col gap-6 py-4">
          <Focusable focusKey={SETTINGS_DEFAULT_FOCUS} onEnter={() => navigate({ name: 'language' })} className="rounded-2xl">
            {(f) => (
              <div className={`flex items-center justify-between rounded-2xl p-7 ${f ? 'bg-card-hover' : 'bg-card'}`}>
                <span className="text-3xl font-semibold">{s.language}</span>
                <span className="text-2xl text-amber">
                  {langInfo ? `${langInfo.nativeName} (${langInfo.englishName})` : ''}
                </span>
              </div>
            )}
          </Focusable>

          <Focusable focusKey="set-about" isStatic className="rounded-2xl">
            <div className="rounded-2xl bg-card p-7">
              <span className="text-3xl font-semibold">{s.about}</span>
              <p className="mt-3 text-[26px] leading-relaxed text-ink-dim">{s.aboutText}</p>
            </div>
          </Focusable>

          <Focusable focusKey="set-version" isStatic className="rounded-2xl">
            <div className="flex items-center justify-between rounded-2xl bg-card p-7">
              <span className="text-3xl font-semibold">{s.version}</span>
              <span className="text-2xl text-ink-dim">fifi.cooking · {manifest.version}</span>
            </div>
          </Focusable>
        </div>
      </FocusGroup>
    </div>
  );
};
