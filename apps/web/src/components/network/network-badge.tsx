'use client';

import React from 'react';
import { useApi } from '@gear-js/react-hooks';
import { Activity } from 'lucide-react';

export function NetworkBadge() {
  const { isApiReady } = useApi();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        isApiReady
          ? 'bg-leaf/15 text-leaf border border-leaf/30'
          : 'bg-earth/15 text-earth border border-earth/30'
      }`}
      title={isApiReady ? 'Connected to Vara Testnet' : 'Connecting to Vara Testnet...'}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isApiReady ? 'bg-leaf animate-pulse' : 'bg-earth'
        }`}
      />
      <span className="hidden sm:inline">Vara Testnet</span>
    </div>
  );
}
