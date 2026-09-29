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
});
installKeyMap();

createRoot(document.getElementById('root')!).render(<App />);
