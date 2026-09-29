import React, { useCallback, useState } from 'react';
import { FocusGroup } from './Focusable';

const LOOK_BACK = 5;
const LOOK_AHEAD = 20;

/** Per-rail anchor memory so a rail resumes where it was after screen round-trips. */
const railAnchors = new Map<string, number>();

interface RailProps {
  focusKey: string;
  title?: React.ReactNode;
  count: number;
  renderItem: (index: number, onFocusItem: () => void) => React.ReactNode;
}

/**
 * A horizontal rail of cards. Only a window of DOM nodes around the focused
 * card is rendered, which keeps memory and layout cost flat even for rails
 * with 300+ items (a Fire TV Stick is a 1GB device).
 */
export const Rail: React.FC<RailProps> = ({ focusKey, title, count, renderItem }) => {
  const [anchor, setAnchor] = useState(() => railAnchors.get(focusKey) ?? 0);
  const markAnchor = useCallback(
    (i: number) => {
      railAnchors.set(focusKey, i);
      setAnchor(i);
    },
    [focusKey],
  );
  const start = Math.max(0, Math.min(anchor - LOOK_BACK, count - (LOOK_BACK + LOOK_AHEAD)));
  const end = Math.min(count, Math.max(anchor + LOOK_AHEAD, LOOK_BACK + LOOK_AHEAD));
  const items = [];
  for (let i = start; i < end; i++) {
    const idx = i;
    items.push(
      <React.Fragment key={idx}>{renderItem(idx, () => markAnchor(idx))}</React.Fragment>,
    );
  }
  return (
    <FocusGroup focusKey={focusKey} className="mb-2">
      {title != null && <h2 className="text-4xl font-bold text-ink mb-3 px-2">{title}</h2>}
      <div className="flex gap-6 overflow-hidden p-5 -m-5" style={{ width: 'calc(100% + 40px)' }}>
        {items}
      </div>
    </FocusGroup>
  );
};
