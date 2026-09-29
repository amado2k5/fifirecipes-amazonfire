import React, { useState } from 'react';
import { assetUrl } from '../api/client';
import type { KidsCard, RecipeCard } from '../api/types';
import { Focusable } from './Focusable';
import { KidsArt } from './KidsArt';

export const CARD_W = 316;
export const CARD_H = 178;

interface ImgProps {
  src?: string;
  alt: string;
  className?: string;
}

/** Remote image with async decode and a warm poster placeholder. */
export const Img: React.FC<ImgProps> = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`bg-card flex items-center justify-center ${className ?? ''}`} aria-label={alt}>
        <svg viewBox="0 0 24 24" width={56} height={56} fill="none" stroke="#8a6f52" strokeWidth={1.5}>
          <path d="M4 19h16M6 19V9l6-5 6 5v10M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
};

interface RecipeCardViewProps {
  focusKey: string;
  card: RecipeCard;
  onEnter: () => void;
  onFocusItem?: () => void;
  /** Render only the focusable shell — used to window big grids on low-RAM devices. */
  lite?: boolean;
}

export const RecipeCardView: React.FC<RecipeCardViewProps> = ({ focusKey, card, onEnter, onFocusItem, lite }) => (
  <Focusable focusKey={focusKey} onEnter={onEnter} onFocus={onFocusItem} className="shrink-0">
    {(focused) =>
      lite ? (
        <div
          className="rounded-2xl bg-card/60 border-2"
          style={{ width: CARD_W, height: CARD_H + 56, borderColor: focused ? '#ffd166' : 'transparent' }}
        />
      ) : (
      <div
        className="rounded-2xl overflow-hidden bg-card border-2"
        style={{ width: CARD_W, borderColor: focused ? '#ffd166' : 'transparent' }}
      >
        <div className="relative" style={{ height: CARD_H }}>
          <Img src={assetUrl(card.image)} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[26px] font-semibold leading-snug text-shadow line-clamp-2">{card.title}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[20px] text-ink-dim">
          <span className="truncate">{card.cookingMethod ?? card.category ?? ''}</span>
          {card.hasVideo && (
            <svg viewBox="0 0 24 24" width={26} height={26} fill="#ffd166" className="shrink-0 ms-2">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          )}
        </div>
      </div>
    )}
  </Focusable>
);

interface KidsCardViewProps {
  focusKey: string;
  card: KidsCard;
  minutesLabel: string;
  onEnter: () => void;
  onFocusItem?: () => void;
}

export const KidsCardView: React.FC<KidsCardViewProps> = ({ focusKey, card, minutesLabel, onEnter, onFocusItem }) => (
  <Focusable focusKey={focusKey} onEnter={onEnter} onFocus={onFocusItem} className="shrink-0">
    {(focused) => (
      <div
        className="rounded-3xl border-4 bg-[#fff6e6] text-[#4a3426] flex flex-col items-center pt-6"
        style={{ width: 300, height: 330, borderColor: focused ? '#ff8a3d' : '#f3cf93' }}
      >
        <div className="rounded-full bg-white p-4 shadow-inner">
          <KidsArt id={card.cover} size={130} />
        </div>
        <p className="mt-4 px-3 text-center text-[26px] font-bold leading-tight line-clamp-2">{card.title}</p>
        <p className="mt-auto mb-4 text-[20px] font-semibold text-[#8a6f52]">
          {card.ages} · {card.minutes} {minutesLabel}
          {card.noCook ? ' · ❄' : ''}
        </p>
      </div>
    )}
  </Focusable>
);

interface ChapterCardViewProps {
  focusKey: string;
  name: string;
  recipeCount: number;
  coverImage?: string;
  onEnter: () => void;
  onFocusItem?: () => void;
}

export const ChapterCardView: React.FC<ChapterCardViewProps> = ({ focusKey, name, recipeCount, coverImage, onEnter, onFocusItem }) => (
  <Focusable focusKey={focusKey} onEnter={onEnter} onFocus={onFocusItem} className="shrink-0">
    {(focused) => (
      <div
        className="rounded-2xl overflow-hidden bg-card border-2 relative"
        style={{ width: 540, height: 300, borderColor: focused ? '#ffd166' : 'transparent' }}
      >
        <Img src={assetUrl(coverImage)} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-4xl font-bold text-shadow leading-tight">{name}</p>
          <p className="text-2xl text-ink-dim mt-2">{recipeCount}</p>
        </div>
      </div>
    )}
  </Focusable>
);

interface VideoCardViewProps {
  focusKey: string;
  title: string;
  channel?: string;
  duration?: string;
  thumb: string;
  onEnter: () => void;
  onFocusItem?: () => void;
}

export const VideoCardView: React.FC<VideoCardViewProps> = ({ focusKey, title, channel, duration, thumb, onEnter, onFocusItem }) => (
  <Focusable focusKey={focusKey} onEnter={onEnter} onFocus={onFocusItem} className="shrink-0">
    {(focused) => (
      <div
        className="rounded-2xl overflow-hidden bg-card border-2"
        style={{ width: 440, borderColor: focused ? '#ffd166' : 'transparent' }}
      >
        <div className="relative" style={{ height: 248 }}>
          <Img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/60 p-4">
              <svg viewBox="0 0 24 24" width={40} height={40} fill="#ffd166">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </div>
          </div>
          {duration && (
            <span className="absolute bottom-3 end-3 rounded bg-black/75 px-3 py-1 text-[18px]">{duration}</span>
          )}
        </div>
        <div className="px-4 py-3">
          <p className="text-[24px] leading-snug line-clamp-2">{title}</p>
          {channel && <p className="text-[19px] text-ink-dim mt-1 truncate">{channel}</p>}
        </div>
      </div>
    )}
  </Focusable>
);
