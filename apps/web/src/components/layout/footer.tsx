'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { truncateAddress } from '@/lib/formatters';

export function Footer() {
  const programId =
    process.env.NEXT_PUBLIC_PROGRAM_ID ||
    '0x562a96cc072e97bc223e48d75e384654978682501b2b8eb29a94189a67026f6a';
  const explorerUrl =
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    'https://idea.gear-tech.io/programs';

  return (
    <footer className="bg-surface-card border-t border-outline-variant/60 py-6 mt-auto text-on-surface">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
        {/* Main Clean Row: Brand + Links + Live Network Pill */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-deep-canopy flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M14 5V15M14 15C14 19 9 21 6 24M14 15C14 19 19 21 22 24M14 15V24"
                  stroke="#8FB855"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="5" r="2.5" fill="#8FB855" />
                <circle cx="6" cy="24" r="1.8" fill="#FFFFFF" />
                <circle cx="14" cy="24" r="1.8" fill="#FFFFFF" />
                <circle cx="22" cy="24" r="1.8" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-base text-deep-canopy font-bold tracking-tight">
                BluToken
              </span>
              <span className="font-label text-[11px] text-botanical-muted hidden sm:inline">
                National Blue Carbon Registry
              </span>
            </div>
          </Link>

          {/* Clean Horizontal Navigation */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-botanical-muted">
            <Link href="/projects" className="hover:text-primary transition-colors">
              Projects
            </Link>
            <span>•</span>
            <Link href="/market" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <span>•</span>
            <Link href="/report-threat" className="hover:text-primary transition-colors">
              Citizen PWA
            </Link>
            <span>•</span>
            <Link href="/audit" className="hover:text-primary transition-colors">
              Audit Trail
            </Link>
            <span>•</span>
            <Link href="/dashboard/gov" className="hover:text-primary transition-colors">
              Governance
            </Link>
          </nav>

          {/* Live Mainnet Contract Badge */}
          <a
            href={`${explorerUrl}/${programId}?node=wss%3A%2F%2Frpc.vara.network`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-primary hover:underline bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/60 shadow-xs whitespace-nowrap shrink-0"
            title="View on Gear Idea explorer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-living-leaf animate-pulse" />
            <span>Vara Mainnet: {truncateAddress(programId, 6)}</span>
            <ExternalLink className="w-3 h-3 text-botanical-muted" />
          </a>
        </div>

        {/* Bottom Minimal Legal Row */}
        <div className="pt-3 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-botanical-muted gap-2">
          <div>
            &copy; {new Date().getFullYear()} BluToken • Powered by Vara Network &amp; Sentinel-2 MRV
          </div>
          <div>
            Pilot registry tokens for voluntary conservation; not government-certified credits.
          </div>
        </div>
      </div>
    </footer>
  );
}
