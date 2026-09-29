import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { KidsRecipeDetail } from '../api/types';
import { useApp } from '../app/AppContext';
import { ErrorScreen } from '../components/ErrorScreen';
import { Focusable, FocusGroup } from '../components/Focusable';
import { KidsCardView } from '../components/Cards';
import { KidsArt } from '../components/KidsArt';
import { TopNav } from '../components/TopNav';

export const KIDS_DEFAULT_FOCUS = 'kid-0';

export const KidsScreen: React.FC = () => {
  const { s, data, navigate } = useApp();
  const cards = [...data.kids.values()];
  return (
    <div className="flex h-full flex-col">
      <TopNav active="kids" />
      <FocusGroup focusKey="kids-grid" className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pb-16">
        <div className="grid grid-cols-5 gap-7 py-4">
          {cards.map((card, i) => (
            <KidsCardView
              key={card.id}
              focusKey={`kid-${i}`}
              card={card}
              minutesLabel={s.minutesShort}
              onEnter={() => navigate({ name: 'kidsRecipe', id: card.id })}
            />
          ))}
        </div>
      </FocusGroup>
    </div>
  );
};

export const KidsRecipeScreen: React.FC<{ id: string }> = ({ id }) => {
  const { s, lang, ensureFocus } = useApp();
  const [recipe, setRecipe] = useState<KidsRecipeDetail | null>(null);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    setRecipe(null);
    api
      .kidsRecipe(lang, id)
      .then(setRecipe)
      .catch(() => setError(true));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [id, lang]);
  useEffect(() => {
    if (recipe) ensureFocus('kids-hero');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe]);

  if (error) {
    return <ErrorScreen title={s.errorTitle} body={s.errorBody} retryLabel={s.retry} onRetry={load} />;
  }
  if (!recipe) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-4xl text-ink-dim">{s.loading}</p>
      </div>
    );
  }

  return (
    <FocusGroup focusKey={`kids-recipe-${id}`} className="hide-scrollbar h-full overflow-y-auto pb-24">
      <Focusable focusKey="kids-hero" isStatic className="rounded-3xl">
        <div className="flex items-center gap-10 rounded-3xl bg-[#fff6e6] p-10 text-[#4a3426]">
          <div className="rounded-full bg-white p-8 shadow-inner">
            <KidsArt id={recipe.cover} size={220} />
          </div>
          <div className="min-w-0">
            <h1 className="text-6xl font-extrabold leading-tight">{recipe.title}</h1>
            {recipe.intro && <p className="mt-4 text-3xl leading-snug text-[#7a5c3e]">{recipe.intro}</p>}
            <div className="mt-6 flex flex-wrap gap-3 text-2xl font-semibold">
              <span className="rounded-full bg-[#ffd93b] px-5 py-2">{s.ages} {recipe.ages}</span>
              <span className="rounded-full bg-[#ffd93b] px-5 py-2">
                {recipe.minutes} {s.minutesShort}
              </span>
              {recipe.noCook && <span className="rounded-full bg-[#b3e5fc] px-5 py-2">❄ {s.noCook}</span>}
            </div>
          </div>
        </div>
      </Focusable>

      <div className="mt-10 grid grid-cols-3 gap-10">
        <section>
          <h2 className="mb-4 text-4xl font-bold">{s.ingredients}</h2>
          <div className="rounded-2xl bg-card p-5">
            {recipe.ingredients.map((ing, i) => (
              <Focusable key={i} focusKey={`king-${i}`} isStatic className="rounded-xl">
                <div className={`flex items-center gap-4 py-3 ${i ? 'border-t border-white/5' : ''}`}>
                  <KidsArt id={ing.art} size={56} />
                  <span className="text-[24px] leading-snug">{ing.text}</span>
                </div>
              </Focusable>
            ))}
          </div>
          {recipe.tools && recipe.tools.length > 0 && (
            <div className="mt-6 rounded-2xl bg-card p-5">
              <h3 className="mb-3 text-2xl font-semibold text-ink-dim">{s.tools}</h3>
              <div className="flex flex-wrap gap-4">
                {recipe.tools.map((t) => (
                  <KidsArt key={t} id={t} size={64} />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="col-span-2">
          <h2 className="mb-4 text-4xl font-bold">{s.steps}</h2>
          <div className="flex flex-col gap-4">
            {recipe.steps.map((st, i) => (
              <Focusable key={i} focusKey={`kstep-${i}`} isStatic className="rounded-2xl">
                <div className="flex gap-5 rounded-2xl bg-card p-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber text-3xl font-extrabold text-night">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[26px] leading-relaxed">{st.text}</p>
                    <div className="mt-2 flex items-center gap-4">
                      {st.adult && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-[#ff8a80]/20 px-4 py-1.5 text-xl font-semibold text-[#ffab91]">
                          <KidsArt id="grown-up" size={30} crayon={false} /> {s.grownUp}
                        </span>
                      )}
                      {st.items?.slice(0, 5).map((it) => <KidsArt key={it} id={it} size={40} crayon={false} />)}
                    </div>
                  </div>
                </div>
              </Focusable>
            ))}
          </div>
          {recipe.tip && (
            <Focusable focusKey="ktip" isStatic className="mt-6 rounded-2xl">
              <p className="rounded-2xl bg-[#fff3c4] p-6 text-[26px] font-semibold leading-relaxed text-[#5d4317]">
                ⭐ {s.tip}: {recipe.tip}
              </p>
            </Focusable>
          )}
        </section>
      </div>
    </FocusGroup>
  );
};
