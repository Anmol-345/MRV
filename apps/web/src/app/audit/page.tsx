'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Filter, Search, ShieldCheck } from 'lucide-react';
import { AuditTable, AuditEventItem } from '@/components/audit/audit-table';
import { truncateAddress } from '@/lib/formatters';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [total, setTotal] = useState(0);

  const services = ['ALL', 'Registry', 'Market', 'Bluvft', 'Admin'];
  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID || '0xd43593c715fdd31c6d514527da2d9d6b3e8f57b5d155fb3e5fb286dce6755a1c';

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
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-forest">
            Public Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
            On-chain Audit Trail
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            Immutable chain event stream recorded directly from finalized blocks on the Vara Network blockchain registry.
          </p>
        </div>

        <a
          href={`https://idea.gear-tech.io/programs/${programId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 bg-white border border-muted/20 hover:border-forest/40 text-forest text-xs font-medium px-3.5 py-2 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-leaf" />
          <span>Vara Explorer: {truncateAddress(programId, 6)}</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted" />
        </a>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-muted/20 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-muted font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Service:</span>
          </span>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {services.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => setSelectedService(svc)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedService === svc
                    ? 'bg-forest text-white shadow-sm'
                    : 'bg-mist text-muted hover:text-ink hover:bg-mist/80'
                }`}
              >
                {svc}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted font-mono">
          {events.length} of {total} events
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin mx-auto" />
          <div className="text-xs text-muted font-medium">Loading blockchain event log...</div>
        </div>
      ) : (
        <AuditTable events={events} />
      )}
    </main>
  );
}
