/** Origin that serves the static JSON API and image assets. */
export const API_ORIGIN = 'https://fifi.cooking';

/** Design canvas the whole UI is laid out against, then scaled to the viewport. */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export const LANG_STORAGE_KEY = 'fifi-tv:language';

export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`;

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const youtubeThumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
