import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import { ContextProvider } from './contexts/ContextProvider';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
);
