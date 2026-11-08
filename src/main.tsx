import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initErrorWatchdog } from './lib/errorTracker';

// Initialize automatic silent crash & error watchdog
initErrorWatchdog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
