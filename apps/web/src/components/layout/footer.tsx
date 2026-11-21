import React from 'react';
import Link from 'next/link';
import { Waves, ExternalLink, ShieldAlert } from 'lucide-react';
import { truncateAddress } from '@/lib/formatters';

export function Footer() {
  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID || '0xd43593c715fdd31c6d514527da2d9d6b3e8f57b5d155fb3e5fb286dce6755a1c';
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://idea.gear-tech.io/programs';

  return (
    <footer className="bg-deep-green text-mist/90 border-t border-forest pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-lime">
                <Waves className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">BluToken</span>
            </div>
            <p className="text-xs text-mist/70 leading-relaxed max-w-sm">
              Blockchain-based Blue Carbon Registry &amp; MRV platform for India&apos;s coastal ecosystems (mangroves, seagrass, salt marsh). Powered by Vara Network and the Sails smart contract framework.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-lime uppercase tracking-wider">Registry &amp; Trade</div>
            <ul className="space-y-1.5 text-xs text-mist/80">
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-white transition-colors">
                  Carbon Marketplace
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-white transition-colors">
                  On-chain Audit Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Smart Contract Info */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-lime uppercase tracking-wider">Vara Program</div>
            <p className="text-xs text-mist/70">Deployed Smart Contract:</p>
            <a
              href={`${explorerUrl}/${programId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-lime hover:underline bg-forest/60 px-2.5 py-1.5 rounded-md border border-leaf/30"
            >
              <span>{truncateAddress(programId, 8)}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-forest/50 border border-leaf/30 rounded-xl p-4 flex items-start gap-3 text-xs text-mist/80">
          <ShieldAlert className="w-5 h-5 text-lime shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Pilot Registry Notice:</span> BluTokens are pilot registry tokens, not government-certified credits. BluToken demonstrates transparent MRV methodologies, immutable cryptographic provenance, and decentralized revenue sharing for coastal communities under pilot standards.
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-forest/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-mist/60 gap-2">
          <div>&copy; {new Date().getFullYear()} BluToken Platform. Open source under Apache-2.0.</div>
          <div className="flex gap-4">
            <span>India Coastal Blue Carbon Initiative</span>
            <span>·</span>
            <span>Vara Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
