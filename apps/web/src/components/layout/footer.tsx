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
    <footer className="bg-surface-card border-t border-outline-variant/60 py-gutter-lg mt-auto text-on-surface">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-gutter-md">
          {/* Mandatory Pilot Trust Badge from Stitch */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-on-primary-container border border-primary/15">
            <span className="font-label text-label-md">
              🌿 Pilot Blue Carbon Registry — Powered by Vara Network &amp; Sentinel-2 Satellite MRV
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-gutter-lg text-botanical-muted text-body-md font-body">
            <a
              href={`${explorerUrl}/${programId}?node=wss%3A%2F%2Frpc.vara.network`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-mono-sm text-primary hover:underline bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/50"
            >
              <span>Vara Mainnet: {truncateAddress(programId, 6)}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <span className="font-mono text-mono-sm">NCCR • WII • NCSCM Multi-Org Quorum</span>
          </div>
        </div>

        {/* Links row */}
        <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between text-body-md text-botanical-muted gap-3">
          <div>&copy; {new Date().getFullYear()} BluToken — India Coastal Blue Carbon Initiative.</div>
          <div className="flex items-center gap-4 text-label-sm font-label">
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
