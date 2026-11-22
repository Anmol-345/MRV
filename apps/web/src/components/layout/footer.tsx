'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, Waves, Trees, Cpu, Radio, Github } from 'lucide-react';
import { truncateAddress } from '@/lib/formatters';

export function Footer() {
  const programId =
    process.env.NEXT_PUBLIC_PROGRAM_ID ||
    '0x562a96cc072e97bc223e48d75e384654978682501b2b8eb29a94189a67026f6a';
  const explorerUrl =
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    'https://idea.gear-tech.io/programs';

  return (
    <footer className="bg-surface-card border-t border-outline-variant/60 pt-12 pb-8 mt-auto text-on-surface">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Main Grid: Brand + 3 Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Mission Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0 group self-start">
              <div className="w-10 h-10 rounded-xl bg-deep-canopy flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
              <div className="flex flex-col">
                <span className="font-headline text-lg text-deep-canopy font-bold leading-none tracking-tight">
                  BluToken
                </span>
                <span className="font-label text-[11px] text-botanical-muted font-medium mt-0.5">
                  National Blue Carbon Registry
                </span>
              </div>
            </Link>

            <p className="font-body text-xs sm:text-sm text-botanical-muted leading-relaxed max-w-md">
              Decentralized registry and satellite MRV platform for India&apos;s blue carbon ecosystems (mangroves, seagrass meadows, and salt marshes). Powered by Vara Network smart contracts and Sentinel-2 optical imagery.
            </p>

            {/* Pilot Disclaimer Pill (Properly contained without wrapping single words) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary-container/80 text-on-primary-container border border-primary/20 text-xs self-start">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="font-label text-[11px] font-semibold leading-snug">
                Pilot Registry: Pilot tokens for voluntary conservation; not government-certified credits.
              </span>
            </div>
          </div>

          {/* Column 1: Registry & Sanctuaries */}
          <div className="flex flex-col gap-3">
            <span className="font-label text-xs font-semibold text-on-surface uppercase tracking-wider">
              Registry &amp; MRV
            </span>
            <ul className="flex flex-col gap-2 text-xs text-botanical-muted font-body">
              <li>
                <Link href="/projects" className="hover:text-primary transition-colors">
                  All Coastal Projects
                </Link>
              </li>
              <li>
                <Link href="/projects/1" className="hover:text-primary transition-colors">
                  Sundarbans Delta (WB)
                </Link>
              </li>
              <li>
                <Link href="/projects/2" className="hover:text-primary transition-colors">
                  Pichavaram Mangroves (TN)
                </Link>
              </li>
              <li>
                <Link href="/projects/3" className="hover:text-primary transition-colors">
                  Gulf of Mannar Seagrass (TN)
                </Link>
              </li>
              <li>
                <Link href="/projects/4" className="hover:text-primary transition-colors">
                  Bhitarkanika Sanctuary (OD)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Marketplace & Citizens */}
          <div className="flex flex-col gap-3">
            <span className="font-label text-xs font-semibold text-on-surface uppercase tracking-wider">
              Market &amp; Citizens
            </span>
            <ul className="flex flex-col gap-2 text-xs text-botanical-muted font-body">
              <li>
                <Link href="/market" className="hover:text-primary transition-colors">
                  Blue Carbon Credit Market
                </Link>
              </li>
              <li>
                <Link href="/report-threat" className="hover:text-primary transition-colors">
                  Citizen Threat Reporter PWA
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-primary transition-colors">
                  Retire &amp; Burn Credits
                </Link>
              </li>
              <li>
                <Link href="/report-threat" className="hover:text-primary transition-colors">
                  Offline IndexedDB Queue
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-primary transition-colors">
                  Panchayat Revenue Streams
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Transparency & Platform */}
          <div className="flex flex-col gap-3">
            <span className="font-label text-xs font-semibold text-on-surface uppercase tracking-wider">
              Transparency &amp; Governance
            </span>
            <ul className="flex flex-col gap-2 text-xs text-botanical-muted font-body">
              <li>
                <Link href="/audit" className="hover:text-primary transition-colors">
                  On-chain Audit Trail
                </Link>
              </li>
              <li>
                <Link href="/dashboard/gov" className="hover:text-primary transition-colors">
                  Government Oversight Console
                </Link>
              </li>
              <li>
                <a
                  href={`${explorerUrl}/${programId}?node=wss%3A%2F%2Frpc.vara.network`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>Gear Idea Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Anmol-345/MRV"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Network & Multi-Org Consensus Strip */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Program ID Badge */}
            <a
              href={`${explorerUrl}/${programId}?node=wss%3A%2F%2Frpc.vara.network`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-primary hover:underline bg-surface-card px-3.5 py-1.5 rounded-full border border-outline-variant/60 shadow-xs whitespace-nowrap"
              title="Inspect BluToken program on Vara Mainnet"
            >
              <span className="w-2 h-2 rounded-full bg-living-leaf animate-pulse" />
              <span>Vara Mainnet: {truncateAddress(programId, 6)}</span>
              <ExternalLink className="w-3 h-3 text-botanical-muted" />
            </a>

            <span className="inline-flex items-center gap-1.5 text-xs text-botanical-muted font-mono whitespace-nowrap">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Sails Framework • WASM Program</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-botanical-muted whitespace-nowrap">
            <Radio className="w-3.5 h-3.5 text-shoot-lime" />
            <span>NCCR • WII • NCSCM • MoEFCC Multi-Org Quorum</span>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-2 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between text-xs text-botanical-muted gap-3">
          <div>
            &copy; {new Date().getFullYear()} BluToken — India Coastal Blue Carbon Registry. All rights reserved.
          </div>
          <div className="flex items-center gap-4 font-label">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
