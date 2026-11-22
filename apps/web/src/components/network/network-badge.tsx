'use client';

import React from 'react';
import { useApi } from '@gear-js/react-hooks';

export function NetworkBadge() {
  const { isApiReady } = useApi();
  const endpoint = process.env.NEXT_PUBLIC_VARA_WS || 'wss://rpc.vara.network';
  const isMainnet = endpoint.includes('rpc.vara.network');
  const label = isMainnet ? 'Vara Mainnet' : 'Vara Testnet';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
        isApiReady
          ? 'bg-living-leaf-container text-on-living-leaf-container border border-living-leaf/30'
          : 'bg-surface-container-low text-botanical-muted border border-outline-variant/60'
      }`}
      title={isApiReady ? `Connected to ${label}` : `Connecting to ${label}...`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isApiReady ? 'bg-living-leaf animate-pulse' : 'bg-outline'
        }`}
      />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
