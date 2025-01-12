import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DOMAdapter } from 'pixi.js';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Provider } from '~/components/ui/provider';

import { TauriAdapter } from '~/lib/TauriAdapter';

import App from './App';

const defaultClient = new QueryClient();
DOMAdapter.set(new TauriAdapter());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={defaultClient}>
      <HotkeysProvider>
        <Provider>
          <App />
        </Provider>
      </HotkeysProvider>
    </QueryClientProvider>
  </StrictMode>,
);
