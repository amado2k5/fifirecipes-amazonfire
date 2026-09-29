import { setKeyMap } from '@noriginmedia/norigin-spatial-navigation';

/**
 * Remote-control key handling.
 *
 * The spatial engine already maps Arrow keys + Enter. Android/Fire OS
 * keycodes (KEYCODE_DPAD_* 19-22, CENTER 23, ENTER 66, NUMPAD_ENTER 160)
 * are folded into the same map so a packaged app behaves like the laptop
 * arrow-key setup.
 */
export function installKeyMap() {
  setKeyMap({
    left: [37, 'ArrowLeft', 21],
    up: [38, 'ArrowUp', 19],
    right: [39, 'ArrowRight', 22],
    down: [40, 'ArrowDown', 20],
    enter: [13, 'Enter', 23, 66, 160],
  });
}

export type BackHandler = () => void;

const BACK_KEYS = new Set(['Escape', 'Backspace', 'BrowserBack', 'GoBack']);
const BACK_CODES = new Set([4, 8, 27, 461, 10009]); // Android BACK, Backspace, Esc, LG back, Tizen back

/** Global back key. Returns an uninstall function. */
export function installBackHandler(onBack: BackHandler) {
  const handler = (e: KeyboardEvent) => {
    const code = e.keyCode || e.which || 0;
    if (BACK_KEYS.has(e.key) || BACK_CODES.has(code)) {
      e.preventDefault();
      onBack();
    }
  };
  window.addEventListener('keydown', handler, true);
  return () => window.removeEventListener('keydown', handler, true);
}

/** True for media play/pause events (Android KEYCODE_MEDIA_PLAY_PAUSE=85). */
export const isPlayPauseEvent = (e: KeyboardEvent) =>
  (e.keyCode || e.which) === 85 || e.key === 'MediaPlayPause' || e.code === 'MediaPlayPause';
