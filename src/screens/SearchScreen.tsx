import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../app/AppContext';
import { OnScreenKeyboard } from '../components/Keyboard';
import { RecipeCardView } from '../components/Cards';
import { FocusGroup } from '../components/Focusable';
import { TopNav } from '../components/TopNav';

const MAX_RESULTS = 48;

export const SEARCH_DEFAULT_FOCUS = 'osk-1-auto';

export const SearchScreen: React.FC = () => {
  const { s, lang, data, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [haystack, setHaystack] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .search(lang)
      .then((h) => alive && setHaystack(h))
      .catch(() => alive && setHaystack({}));
    return () => {
      alive = false;
    };
  }, [lang]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !haystack) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    const out: string[] = [];
    for (const [id, text] of Object.entries(haystack)) {
      if (terms.every((t) => text.includes(t)) && data.index.has(id)) {
        out.push(id);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }, [query, haystack, data.index]);

  return (
    <div className="flex h-full flex-col">
      <TopNav active="search" />
      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pb-16">
        <div className="mb-6 rounded-2xl bg-card px-8 py-5">
          <p className="text-xl text-ink-dim">{s.searchHint}</p>
          <p className="mt-1 min-h-[52px] text-4xl font-bold tracking-wide">
            {query || <span className="text-ink-dim/60">{s.searchTitle}…</span>}
            <span className="ms-1 inline-block h-9 w-1 animate-pulse bg-amber align-middle" />
          </p>
        </div>

        <OnScreenKeyboard
          lang={lang}
          onChar={(ch) => setQuery((q) => q + ch)}
          onBackspace={() => setQuery((q) => [...q].slice(0, -1).join(''))}
          onSpace={() => setQuery((q) => (q.endsWith(' ') || !q ? q : q + ' '))}
          onClear={() => setQuery('')}
        />

        <FocusGroup focusKey="search-results" className="mt-10">
          {query.trim() && (
            <h2 className="mb-4 px-1 text-3xl font-bold">
              {results.length > 0 ? `${s.resultsFor} “${query.trim()}”` : s.noResults}
            </h2>
          )}
          <div className="grid grid-cols-5 gap-6 py-2">
            {results.map((id, i) => {
              const card = data.index.get(id)!;
              return (
                <RecipeCardView
                  key={id}
                  focusKey={`sr-${i}`}
                  card={card}
                  onEnter={() => navigate({ name: 'recipe', id })}
                />
              );
            })}
          </div>
        </FocusGroup>
      </div>
    </div>
  );
};
