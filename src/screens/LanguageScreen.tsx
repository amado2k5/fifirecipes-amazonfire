import React from 'react';
import { useApp } from '../app/AppContext';
import { Focusable, FocusGroup } from '../components/Focusable';

export const LanguageScreen: React.FC = () => {
  const { s, manifest, lang, setLanguage } = useApp();
  return (
    <div className="flex h-full flex-col items-center justify-center pb-10">
      <h1 className="mb-3 text-5xl font-extrabold text-amber">{s.appName}</h1>
      <p className="mb-10 text-3xl text-ink-dim">{s.chooseLanguage}</p>
      <FocusGroup focusKey="lang-picker" className="hide-scrollbar max-h-[720px] w-full overflow-y-auto px-2">
        <div className="mx-auto grid w-fit grid-cols-4 gap-6 py-2">
          {manifest.languages.map((l) => (
            <Focusable
              key={l.code}
              focusKey={`lang-${l.code}`}
              onEnter={() => setLanguage(l.code)}
              className="rounded-2xl"
            >
              {(focused) => (
                <div
                  className={`flex h-[110px] w-[380px] flex-col items-center justify-center rounded-2xl border-2 ${
                    l.code === lang
                      ? 'border-amber bg-amber/15'
                      : focused
                        ? 'border-transparent bg-card-hover'
                        : 'border-transparent bg-card'
                  }`}
                >
                  <span className="text-3xl font-bold">{l.nativeName}</span>
                  {l.englishName !== l.nativeName && (
                    <span className="mt-1 text-xl text-ink-dim">{l.englishName}</span>
                  )}
                </div>
              )}
            </Focusable>
          ))}
        </div>
      </FocusGroup>
    </div>
  );
};
