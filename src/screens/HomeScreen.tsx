import React, { useMemo, useState } from 'react';
import { useApp } from '../app/AppContext';
import { assetUrl } from '../api/client';
import { Img, KidsCardView, RecipeCardView } from '../components/Cards';
import { FocusGroup } from '../components/Focusable';
import { Rail } from '../components/Rail';
import { TopNav } from '../components/TopNav';

export const HOME_DEFAULT_FOCUS = 'rk-featured-0';

export const HomeScreen: React.FC = () => {
  const { s, data, navigate } = useApp();
  const [heroIdx, setHeroIdx] = useState(0);

  const featured = useMemo(
    () => data.feed.rows.find((r) => r.key === 'featured')?.items ?? [],
    [data.feed],
  );
  const heroCard = data.index.get(featured[Math.min(heroIdx, featured.length - 1)] ?? '');

  return (
    <div className="flex h-full flex-col">
      <TopNav active="home" />
      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pb-16">
        {heroCard && (
          <header className="relative mb-8 overflow-hidden rounded-3xl" style={{ height: 430 }}>
            <Img src={assetUrl(heroCard.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10">
              <p className="mb-2 text-2xl font-semibold tracking-wide text-amber">{s.tagline}</p>
              <h1 className="text-shadow text-6xl font-extrabold leading-tight">{heroCard.title}</h1>
              <p className="mt-3 text-2xl text-ink-dim">
                {[heroCard.prepTime, heroCard.cookTime, heroCard.servings].filter(Boolean).join('  ·  ')}
              </p>
            </div>
          </header>
        )}

        {data.feed.rows.map((row) => {
          if (row.items.length === 0) return null;
          if (row.key === 'kids') {
            return (
              <Rail
                key={row.key}
                focusKey={`rail-${row.key}`}
                title={row.title}
                count={row.items.length}
                renderItem={(i, markFocus) => {
                  const card = data.kids.get(row.items[i]);
                  if (!card) return <div key={i} style={{ width: 300 }} />;
                  return (
                    <KidsCardView
                      focusKey={`rk-${row.key}-${i}`}
                      card={card}
                      minutesLabel={s.minutesShort}
                      onEnter={() => navigate({ name: 'kidsRecipe', id: card.id })}
                      onFocusItem={markFocus}
                    />
                  );
                }}
              />
            );
          }
          return (
            <Rail
              key={row.key}
              focusKey={`rail-${row.key}`}
              title={row.title}
              count={row.items.length}
              renderItem={(i, markFocus) => {
                const card = data.index.get(row.items[i]);
                if (!card) return <div key={i} style={{ width: 320 }} />;
                return (
                  <RecipeCardView
                    focusKey={`rk-${row.key}-${i}`}
                    card={card}
                    onEnter={() => navigate({ name: 'recipe', id: card.id })}
                    onFocusItem={() => {
                      markFocus();
                      if (row.key === 'featured') setHeroIdx(i);
                    }}
                  />
                );
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
