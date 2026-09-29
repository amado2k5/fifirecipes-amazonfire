import React from 'react';
import { useApp, type Screen } from '../app/AppContext';
import { Focusable, FocusGroup } from './Focusable';

const TABS: { id: string; labelKey: 'home' | 'chapters' | 'search' | 'kids' | 'settings'; screen: Screen }[] = [
  { id: 'home', labelKey: 'home', screen: { name: 'home' } },
  { id: 'chapters', labelKey: 'chapters', screen: { name: 'chapters' } },
  { id: 'search', labelKey: 'search', screen: { name: 'search' } },
  { id: 'kids', labelKey: 'kids', screen: { name: 'kids' } },
  { id: 'settings', labelKey: 'settings', screen: { name: 'settings' } },
];

interface TopNavProps {
  active: string;
}

export const TopNav: React.FC<TopNavProps> = ({ active }) => {
  const { s, goTab, data } = useApp();
  const tabs = TABS.filter((t) => t.id !== 'kids' || data.kids.size > 0);
  return (
    <FocusGroup focusKey={`topnav-${active}`} className="flex items-center gap-3 mb-6" saveLastFocusedChild={false}>
      <span className="me-6 text-3xl font-extrabold text-amber">{s.appName}</span>
      {tabs.map((t) => (
        <Focusable
          key={t.id}
          focusKey={`nav-${t.id}`}
          onEnter={() => goTab(t.screen)}
          scroll={false}
          className="rounded-full"
        >
          {(focused) => (
            <span
              className={`block rounded-full px-8 py-3 text-[26px] font-semibold transition-colors ${
                active === t.id ? 'bg-amber text-night' : focused ? 'bg-card-hover text-ink' : 'bg-card text-ink-dim'
              }`}
            >
              {s[t.labelKey]}
            </span>
          )}
        </Focusable>
      ))}
    </FocusGroup>
  );
};
