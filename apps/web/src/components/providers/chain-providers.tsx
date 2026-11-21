'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicVaraProviders = dynamic(
  () => import('./vara-providers').then((mod) => mod.VaraProviders),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-mist text-muted text-sm">
        Connecting to Vara Network...
      </div>
    ),
  }
);

export function ChainProviders({ children }: { children: React.ReactNode }) {
  return <DynamicVaraProviders>{children}</DynamicVaraProviders>;
}
