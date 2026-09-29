import { createRoot } from 'react-dom/client';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import App from './App';
import { installKeyMap } from './remote';
import './index.css';

init({
  debug: false,
  visualDebug: false,
  shouldFocusDOMNode: true,
  domNodeFocusOptions: { preventScroll: true },
  // Fire OS remotes can emit hardware key-repeat or a duplicated key dispatch
  // within one perceived press; collapse repeats into ~100ms steps so a single
  // click never jumps two cards. Hold-to-scroll still works at that cadence.
  throttle: 100,
  throttleKeypresses: true,
});
installKeyMap();

createRoot(document.getElementById('root')!).render(<App />);
