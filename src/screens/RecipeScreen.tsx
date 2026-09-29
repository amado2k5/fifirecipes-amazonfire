import React, { useEffect, useMemo, useState } from 'react';
import { api, assetUrl } from '../api/client';
import type { RecipeFile, VideoItem } from '../api/types';
import { useApp } from '../app/AppContext';
import { ErrorScreen } from '../components/ErrorScreen';
import { Img, VideoCardView } from '../components/Cards';
import { Focusable, FocusGroup } from '../components/Focusable';
import { Rail } from '../components/Rail';
import { youtubeThumbUrl } from '../config';

export const RECIPE_DEFAULT_FOCUS = 'recipe-hero';

interface Props {
  id: string;
}

interface Localized {
  title: string;
  subtitle?: string;
  chapter?: string;
  category?: string;
  cookingMethod?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  culturalNotes?: string;
  ingredients: { name: string; amount?: string }[];
  steps: { n: number; text: string; phase?: string; alternative?: string; tip?: boolean }[];
}

function localize(file: RecipeFile, lang: string): Localized {
  const r = file.recipe;
  const t = file.translations[lang] ?? {};
  const en = file.translations.en ?? {};
  const pick = (k: 'title' | 'chapter' | 'category' | 'cookingMethod' | 'prepTime' | 'cookTime' | 'servings') =>
    t[k] ?? en[k] ?? r[k];

  const trIng = t.ingredients ?? en.ingredients ?? {};
  const trIns = t.instructions ?? en.instructions ?? {};

  return {
    title: (pick('title') as string) ?? r.title,
    subtitle: r.titleEn !== (pick('title') as string) ? r.titleEn : undefined,
    chapter: (pick('chapter') as string) ?? r.chapter,
    category: (pick('category') as string) ?? r.category,
    cookingMethod: (pick('cookingMethod') as string) ?? r.cookingMethod,
    prepTime: (pick('prepTime') as string) ?? r.prepTime,
    cookTime: (pick('cookTime') as string) ?? r.cookTime,
    servings: (pick('servings') as string) ?? r.servings,
    culturalNotes: t.culturalNotes ?? en.culturalNotes,
    ingredients: r.masterIngredients.map((mi) => ({
      name: trIng[mi.id]?.name ?? mi.name,
      amount: trIng[mi.id]?.standardAmount ?? mi.standardAmount,
    })),
    steps: r.uniqueInstructions.map((ui) => ({
      n: ui.stepNumber,
      text: trIns[String(ui.stepNumber)] ?? ui.textEn ?? ui.text,
      phase: ui.phase,
      alternative: ui.isAlternative ? ui.alternativeLabel ?? 'alternative' : undefined,
      tip: ui.importance === 'tip',
    })),
  };
}

const Chip: React.FC<{ label?: string; value?: string }> = ({ label, value }) =>
  value ? (
    <span className="rounded-xl bg-card px-5 py-2.5 text-2xl text-ink">
      {label && <span className="me-2 text-ink-dim">{label}</span>}
      {value}
    </span>
  ) : null;

export const RecipeScreen: React.FC<Props> = ({ id }) => {
  const { s, lang, openVideo, ensureFocus, data } = useApp();
  const [file, setFile] = useState<RecipeFile | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [fullImage, setFullImage] = useState<string | undefined>();
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    setFile(null);
    api
      .recipe(id)
      .then(setFile)
      .catch(() => setError(true));
    api
      .images()
      .then((m) => setFullImage(m[id]?.full))
      .catch(() => undefined);
    api
      .videos(id)
      .then((vf) => setVideos(vf[lang] ?? vf.ar ?? vf.en ?? []))
      .catch(() => setVideos([]));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [id, lang]);

  const loc = useMemo(() => (file ? localize(file, lang) : null), [file, lang]);

  useEffect(() => {
    if (loc) ensureFocus(RECIPE_DEFAULT_FOCUS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc]);

  if (error) {
    return <ErrorScreen title={s.errorTitle} body={s.errorBody} retryLabel={s.retry} onRetry={load} />;
  }
  if (!file || !loc) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-4xl text-ink-dim">{s.loading}</p>
      </div>
    );
  }

  const coreSteps = loc.steps.filter((st) => !st.alternative);
  const altGroups = new Map<string, typeof loc.steps>();
  for (const st of loc.steps) {
    if (st.alternative) {
      const g = altGroups.get(st.alternative) ?? [];
      g.push(st);
      altGroups.set(st.alternative, g);
    }
  }
  const tips = loc.steps.filter((st) => st.tip);
  const indexCard = data.index.get(id);
  const heroImg = fullImage ?? indexCard?.image;
  const est = file.estimate;

  return (
    <FocusGroup focusKey={`recipe-${id}`} className="hide-scrollbar h-full overflow-y-auto pb-24">
      <Focusable focusKey={RECIPE_DEFAULT_FOCUS} isStatic className="rounded-3xl">
        <div className="flex gap-10 rounded-3xl bg-night-soft p-8">
          <Img
            src={assetUrl(heroImg)}
            alt={loc.title}
            className="h-[440px] w-[640px] shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0 py-2">
            {loc.chapter && <p className="mb-3 text-2xl font-semibold text-amber">{loc.chapter}</p>}
            <h1 className="text-5xl font-extrabold leading-tight">{loc.title}</h1>
            {loc.subtitle && <p className="mt-3 text-2xl italic text-ink-dim">{loc.subtitle}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Chip label={s.prep} value={loc.prepTime} />
              <Chip label={s.cook} value={loc.cookTime} />
              <Chip label={s.servings} value={loc.servings} />
              <Chip value={loc.category} />
              <Chip value={loc.cookingMethod} />
            </div>
            {est && (est.kcal || est.protein || est.carbs || est.fat) && (
              <div className="mt-4 flex flex-wrap gap-3 text-xl text-ink-dim">
                {est.kcal != null && <span>{est.kcal} {s.kcal}</span>}
                {est.protein != null && <span>· {est.protein}g {s.protein}</span>}
                {est.carbs != null && <span>· {est.carbs}g {s.carbs}</span>}
                {est.fat != null && <span>· {est.fat}g {s.fat}</span>}
              </div>
            )}
            {loc.culturalNotes && (
              <div className="mt-6 border-s-4 border-amber ps-5">
                <p className="text-xl font-semibold text-amber">{s.culturalNotes}</p>
                <p className="mt-2 text-[26px] leading-relaxed text-ink-dim">{loc.culturalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </Focusable>

      <div className="mt-10 grid grid-cols-3 gap-10">
        <section>
          <h2 className="mb-4 text-4xl font-bold">{s.ingredients}</h2>
          <div className="rounded-2xl bg-card p-6">
            {loc.ingredients.map((ing, i) => (
              <Focusable key={i} focusKey={`ing-${i}`} isStatic className="rounded-lg">
                <div className={`flex gap-3 py-3 text-[24px] leading-snug ${i ? 'border-t border-white/5' : ''}`}>
                  <span className="min-w-0 flex-1 font-medium">{ing.name}</span>
                  {ing.amount && <span className="shrink-0 text-amber">{ing.amount}</span>}
                </div>
              </Focusable>
            ))}
          </div>
        </section>

        <section className="col-span-2">
          <h2 className="mb-4 text-4xl font-bold">{s.steps}</h2>
          <div className="flex flex-col gap-4">
            {coreSteps.map((st) => (
              <Focusable key={st.n} focusKey={`step-${st.n}`} isStatic className="rounded-2xl">
                <div className="flex gap-5 rounded-2xl bg-card p-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber text-3xl font-extrabold text-night">
                    {st.n}
                  </span>
                  <p className="text-[26px] leading-relaxed">{st.text}</p>
                </div>
              </Focusable>
            ))}
          </div>
        </section>
      </div>

      {altGroups.size > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-4xl font-bold">{s.alternativeMethods}</h2>
          <div className="flex flex-col gap-4">
            {[...altGroups.entries()].map(([label, steps], gi) =>
              steps.map((st) => (
                <Focusable key={`${gi}-${st.n}`} focusKey={`alt-${gi}-${st.n}`} isStatic className="rounded-2xl">
                  <div className="rounded-2xl border border-amber/30 bg-card p-6">
                    <span className="mb-2 inline-block rounded-lg bg-amber/20 px-4 py-1 text-xl font-semibold text-amber">
                      {label}
                    </span>
                    <p className="text-[26px] leading-relaxed">{st.text}</p>
                  </div>
                </Focusable>
              )),
            )}
          </div>
        </section>
      )}

      {tips.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-4xl font-bold">{s.tips}</h2>
          {tips.map((st, i) => (
            <Focusable key={st.n} focusKey={`tip-${i}`} isStatic className="rounded-2xl">
              <p className="rounded-2xl bg-card p-6 text-[26px] leading-relaxed text-ink-dim">💡 {st.text}</p>
            </Focusable>
          ))}
        </section>
      )}

      {videos.length > 0 && (
        <section className="mt-12">
          <Rail
            focusKey="videos-rail"
            title={s.videos}
            count={videos.length}
            renderItem={(i, mark) => (
              <VideoCardView
                focusKey={`vid-${i}`}
                title={videos[i].title}
                channel={videos[i].channel}
                duration={videos[i].duration}
                thumb={youtubeThumbUrl(videos[i].id)}
                onEnter={() => openVideo(videos[i].id, videos[i].title)}
                onFocusItem={mark}
              />
            )}
          />
        </section>
      )}
    </FocusGroup>
  );
};
