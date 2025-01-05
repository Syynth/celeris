import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';

import App from './App';
import { Provider } from '~/components/ui/provider';

const defaultClient = new QueryClient();

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
