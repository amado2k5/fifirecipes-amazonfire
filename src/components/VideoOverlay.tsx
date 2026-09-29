import React, { useEffect, useRef } from 'react';
import { youtubeEmbedUrl, youtubeWatchUrl } from '../config';
import { useApp } from '../app/AppContext';
import { isPlayPauseEvent } from '../remote';
import { Focusable, FocusGroup } from './Focusable';

interface VideoOverlayProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

/**
 * Full-screen YouTube IFrame overlay. Focus is trapped inside the overlay
 * (isFocusBoundary); Back closes it. Play/pause remote keys and the on-screen
 * button talk to the player through the IFrame command API.
 */
export const VideoOverlay: React.FC<VideoOverlayProps> = ({ videoId, title, onClose }) => {
  const { s } = useApp();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const playing = useRef(true);

  const send = (func: string) => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  };
  const toggle = () => {
    send(playing.current ? 'pauseVideo' : 'playVideo');
    playing.current = !playing.current;
  };

  // MEDIA_PLAY_PAUSE (remote) toggles the embedded player too.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isPlayPauseEvent(e)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  return (
    <FocusGroup focusKey="video-overlay" isFocusBoundary className="absolute inset-0 z-50 bg-black">
      <iframe
        ref={frameRef}
        src={youtubeEmbedUrl(videoId)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-24 pb-14 pt-24">
        <p className="mb-6 line-clamp-1 text-3xl font-semibold text-shadow">{title}</p>
        <FocusGroup focusKey="video-actions" className="flex gap-5">
          <Focusable focusKey="video-toggle" onEnter={toggle} className="rounded-2xl">
            {(f) => (
              <span className={`block rounded-2xl px-10 py-4 text-2xl font-bold ${f ? 'bg-tomato text-white' : 'bg-card text-ink'}`}>
                ⏯ {s.playPause}
              </span>
            )}
          </Focusable>
          {/* window.open is a dead end inside the Android WebView wrapper —
              only offer the external link where a browser exists. */}
          {!(window as unknown as { FifiBridge?: unknown }).FifiBridge && (
            <Focusable
              focusKey="video-youtube"
              onEnter={() => window.open(youtubeWatchUrl(videoId), '_blank')}
              className="rounded-2xl"
            >
              {(f) => (
                <span className={`block rounded-2xl px-10 py-4 text-2xl font-bold ${f ? 'bg-tomato text-white' : 'bg-card text-ink'}`}>
                  ▶ {s.openInYouTube}
                </span>
              )}
            </Focusable>
          )}
          <Focusable focusKey="video-close" onEnter={onClose} className="rounded-2xl">
            {(f) => (
              <span className={`block rounded-2xl px-10 py-4 text-2xl font-bold ${f ? 'bg-tomato text-white' : 'bg-card text-ink'}`}>
                ✕ {s.close}
              </span>
            )}
          </Focusable>
        </FocusGroup>
      </div>
    </FocusGroup>
  );
};
