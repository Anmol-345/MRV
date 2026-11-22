'use client';

import React from 'react';
import { Award, Printer, ExternalLink, ShieldCheck, Waves, Trees } from 'lucide-react';
import { formatBlu, formatDate, truncateAddress } from '@/lib/formatters';

export interface RetirementCertificateData {
  id: string | number;
  projectId: string | number;
  projectName: string;
  ecosystem: 'Mangrove' | 'Seagrass' | 'SaltMarsh';
  state: string;
  retiree: string;
  beneficiaryName: string;
  reason: string;
  amountMilli: bigint | string;
  timestamp: string | number;
  blockNumber: number;
  txHash: string;
}

interface CertificateViewProps {
  data: RetirementCertificateData;
}

export function CertificateView({ data }: CertificateViewProps) {
  const explorerUrl =
    'https://idea.gear-tech.io/programs/0x562a96cc072e97bc223e48d75e384654978682501b2b8eb29a94189a67026f6a?node=wss%3A%2F%2Frpc.vara.network';
  const amountFormatted = formatBlu(BigInt(data.amountMilli || '0'));

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="text-xs text-muted">
          Official on-chain retirement record on Vara Network.
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print or Save as PDF</span>
        </button>
      </div>

      {/* Certificate Frame */}
      <div className="relative bg-white border-8 border-deep-green/90 p-8 sm:p-12 rounded-3xl shadow-xl space-y-8 print:border-4 print:p-8 print:shadow-none print:m-0">
        {/* Subtle Decorative Background Nature Watermark */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.04] pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1618245318763-a15176d00133?auto=format&fit=crop&w=1200&q=80"
            alt="Mangrove delta watermark seal"
            className="w-full h-full object-cover filter grayscale contrast-150"
          />
        </div>

        {/* Certificate Top Header */}
        <div className="text-center space-y-3 relative z-10 border-b-2 border-forest/20 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold tracking-wider uppercase">
            <Award className="w-4 h-4" />
            <span>Official Blue Carbon Retirement Certificate</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink tracking-tight">
            Certificate of Carbon Offset
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
            This certifies the permanent retirement and on-chain burning of verified blue carbon
            credits from Indian coastal restoration ecosystems.
          </p>
        </div>

        {/* Main Certificate Body */}
        <div className="space-y-6 relative z-10 text-center">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-muted font-bold">Awarded to</div>
            <div className="text-2xl sm:text-3xl font-serif font-extrabold text-forest">
              {data.beneficiaryName || data.retiree}
            </div>
            {data.retiree && data.beneficiaryName && (
              <div className="text-xs text-muted font-mono">
                Wallet: {truncateAddress(data.retiree)}
              </div>
            )}
          </div>

          {/* Tonnes Retired Highlight */}
          <div className="bg-mist/70 border border-muted/20 rounded-2xl py-6 px-4 max-w-md mx-auto space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Amount Permanently Retired</div>
            <div className="text-4xl sm:text-5xl font-mono font-black text-forest">
              {amountFormatted}{' '}
              <span className="text-xl sm:text-2xl font-serif font-normal text-ink">tCO2e</span>
            </div>
            <div className="text-xs text-teal font-semibold">
              1 BLU Token = 1 Metric Tonne CO2 Equivalent
            </div>
          </div>

          {/* Project & Purpose Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto text-xs bg-white p-4 rounded-xl border border-muted/20">
            <div className="space-y-1">
              <span className="text-muted font-medium">Restoration Project:</span>
              <div className="font-serif font-bold text-ink text-sm">{data.projectName}</div>
              <div className="text-muted flex items-center gap-1.5 pt-0.5">
                <Trees className="w-3.5 h-3.5 text-leaf" />
                <span>{data.ecosystem} · {data.state}, India</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted font-medium">Retirement Purpose:</span>
              <div className="font-semibold text-ink text-sm">{data.reason || 'Voluntary Blue Carbon Climate Action'}</div>
              <div className="text-muted pt-0.5">
                Date: {formatDate(typeof data.timestamp === 'number' ? new Date(data.timestamp) : data.timestamp)}
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Blockchain Footer */}
        <div className="pt-6 border-t border-muted/20 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center relative z-10 text-xs">
          {/* QR Code Simulation */}
          <div className="flex sm:justify-start justify-center">
            <div className="w-24 h-24 bg-mist border border-muted/30 rounded-xl p-2 flex flex-col items-center justify-center text-center">
              {/* SVG QR Code icon representation */}
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-deep-green" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v3h-2v-3zm3 3h3v5h-2v-3h-1v-2zm-5 2h2v4h-2v-4zm2 2h3v2h-3v-2z" />
              </svg>
              <span className="text-[9px] font-mono font-bold text-muted mt-1">SCAN TO VERIFY</span>
            </div>
          </div>

          {/* Cryptographic Ledger Details */}
          <div className="space-y-1 font-mono text-[11px] text-ink sm:col-span-2">
            <div className="flex items-center gap-1 text-forest font-bold">
              <ShieldCheck className="w-4 h-4 text-leaf" />
              <span>Immutable On-Chain Verification</span>
            </div>
            <div>
              <span className="text-muted">Certificate Serial: </span>
              <span className="font-bold">BLU-CERT-{data.id.toString().padStart(6, '0')}</span>
            </div>
            <div>
              <span className="text-muted">Block Number: </span>
              <span>#{data.blockNumber}</span>
            </div>
            <div className="truncate">
              <span className="text-muted">Transaction: </span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest hover:underline"
              >
                {data.txHash}
              </a>
            </div>
          </div>
        </div>

        {/* Mandatory Pilot Registry Disclaimer Note */}
        <div className="text-center pt-4 border-t border-muted/20 text-[11px] text-muted">
          <strong>Pilot Registry Notice:</strong> BluTokens are pilot registry tokens, not government-certified credits.
          Issued and verified pursuant to the open-source BluToken MRV Specification on Vara Network.
        </div>
      </div>
    </div>
  );
}
