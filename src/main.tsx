import { NextUIProvider } from '@nextui-org/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

const defaultClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <NextUIProvider>
      <QueryClientProvider client={defaultClient}>
        <App />
      </QueryClientProvider>
    </NextUIProvider>
  </StrictMode>,
);
