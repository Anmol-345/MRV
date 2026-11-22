'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Filter, ShieldCheck, History, Database, Cpu } from 'lucide-react';
import { AuditTable, AuditEventItem } from '@/components/audit/audit-table';
import { truncateAddress } from '@/lib/formatters';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [total, setTotal] = useState(0);

  const services = ['ALL', 'Registry', 'Market', 'Bluvft', 'Admin'];
  const programId =
    process.env.NEXT_PUBLIC_PROGRAM_ID ||
    '0x562a96cc072e97bc223e48d75e384654978682501b2b8eb29a94189a67026f6a';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedService !== 'ALL') params.set('service', selectedService);
    params.set('limit', '50');

    fetch(`/api/audit?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items) {
          setEvents(data.items);
          setTotal(data.total || data.items.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedService]);

  return (
    <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex flex-col gap-8">
      {/* Nature Banner Header */}
      <section className="relative rounded-2xl overflow-hidden bg-deep-canopy text-on-deep-canopy p-6 sm:p-10 shadow-lg border border-outline-variant/60">
        {/* Background Nature Imagery - Estuary & Coastal Mangrove */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1600&q=80"
          alt="Mangrove estuary tidal creeks in Sundarbans"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-canopy/95 via-deep-canopy/80 to-deep-canopy/60" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20 text-xs font-semibold text-shoot-lime">
              <History className="w-3.5 h-3.5" />
              <span>PUBLIC TRANSPARENCY &amp; IMMUTABLE EVENT STREAM</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-deep-canopy tracking-tight">
              On-chain Audit Trail
            </h1>
            <p className="font-body text-sm sm:text-base text-on-deep-canopy/85 leading-relaxed">
              Cryptographic event log streamed directly from finalized blocks on the Vara Network blockchain.
              Every project registration, satellite report verification, token mint, market trade, and carbon retirement is permanently traceable.
            </p>
          </div>

          <a
            href={`https://idea.gear-tech.io/programs/${programId}?node=wss%3A%2F%2Frpc.vara.network`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-surface-card text-on-surface hover:bg-primary hover:text-on-primary text-xs font-semibold px-4 py-2.5 rounded-full shadow-md transition-all duration-state-change shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-living-leaf" />
            <span>Explorer: {truncateAddress(programId, 6)}</span>
            <ExternalLink className="w-3.5 h-3.5 text-botanical-muted" />
          </a>
        </div>
      </section>

      {/* Audit Stats Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card rounded-xl border border-outline-variant/60 p-4 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-on-surface">{total} Events</div>
            <div className="font-body text-xs text-botanical-muted">Total Indexed Chain Events</div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl border border-outline-variant/60 p-4 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tidal-teal-container text-on-tidal-teal-container flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-on-surface">4 Services</div>
            <div className="font-body text-xs text-botanical-muted">Registry, Market, Bluvft, Admin</div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl border border-outline-variant/60 p-4 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-living-leaf-container text-on-living-leaf-container flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-on-surface">100% Finalized</div>
            <div className="font-body text-xs text-botanical-muted">Sub-second WASM Consensus</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-card p-4 rounded-xl border border-outline-variant/60 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-botanical-muted font-semibold shrink-0 flex items-center gap-1.5 font-label">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filter Service:</span>
          </span>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {services.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => setSelectedService(svc)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-state-change whitespace-nowrap ${
                  selectedService === svc
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-card'
                }`}
              >
                {svc}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-botanical-muted font-mono">
          Showing {events.length} of {total} events
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <div className="text-xs text-botanical-muted font-medium font-body">Loading blockchain event log...</div>
        </div>
      ) : (
        <AuditTable events={events} />
      )}
    </main>
  );
}
