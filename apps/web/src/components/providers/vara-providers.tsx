'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ApiProvider,
  AccountProvider,
  AlertProvider,
  type AlertTemplateProps,
} from '@gear-js/react-hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
});

const DEFAULT_VARA_WS = process.env.NEXT_PUBLIC_VARA_WS || 'wss://testnet.vara.network';

function CustomAlertTemplate({ alert, close }: AlertTemplateProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-muted/20 rounded-lg p-3 shadow-lg flex items-center gap-3 text-sm max-w-sm">
      <div className="flex-1 text-ink">{alert.content}</div>
      <button
        type="button"
        onClick={close}
        className="text-xs text-muted hover:text-ink transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

export function VaraProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider initialArgs={{ endpoint: DEFAULT_VARA_WS }}>
        <AccountProvider appName="BluToken">
          <AlertProvider template={CustomAlertTemplate}>
            {children}
          </AlertProvider>
        </AccountProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
