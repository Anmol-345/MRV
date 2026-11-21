'use client';

import React, { useState } from 'react';
import { ExternalLink, Code2, X } from 'lucide-react';
import { truncateAddress, formatDate } from '@/lib/formatters';

export interface AuditEventItem {
  id: string | bigint;
  blockNumber: string | bigint;
  eventIndex: number;
  service: string;
  name: string;
  payload: Record<string, any>;
  txHash: string;
  ts: string;
}

export function AuditTable({ events }: { events: AuditEventItem[] }) {
  const [selectedPayload, setSelectedPayload] = useState<Record<string, any> | null>(null);

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'Registry':
        return 'bg-forest/15 text-forest border-forest/30';
      case 'Market':
        return 'bg-teal/15 text-teal border-teal/30';
      case 'Bluvft':
        return 'bg-leaf/15 text-leaf border-leaf/30';
      case 'Admin':
        return 'bg-earth/15 text-earth border-earth/30';
      default:
        return 'bg-muted/15 text-muted border-muted/30';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-muted/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-mist/70 border-b border-muted/20 text-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Block</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Tx Hash</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10 font-mono">
              {events.length > 0 ? (
                events.map((ev) => (
                  <tr key={`${ev.blockNumber}-${ev.eventIndex}`} className="hover:bg-mist/40 transition-colors">
                    <td className="px-4 py-3 text-ink font-semibold">
                      #{ev.blockNumber.toString()}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getServiceBadge(
                          ev.service
                        )}`}
                      >
                        {ev.service}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink font-sans font-medium">{ev.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://idea.gear-tech.io/explorer?tx=${ev.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest hover:underline inline-flex items-center gap-1"
                      >
                        <span>{truncateAddress(ev.txHash, 6)}</span>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted font-sans">{formatDate(ev.ts)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayload(ev.payload)}
                        className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-forest hover:text-forest/80 bg-forest/10 hover:bg-forest/20 px-2 py-1 rounded-md transition-colors"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>JSON</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted font-sans text-xs">
                    No chain events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-muted/20 shadow-2xl max-w-lg w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-muted/10">
              <span className="font-serif font-bold text-sm text-ink">Event Payload Inspector</span>
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="text-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="bg-mist p-3 rounded-xl text-xs font-mono text-ink overflow-x-auto max-h-80">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
