'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatVara, formatBlu } from '@/lib/formatters';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

export default function NewListingPage() {
  const router = useRouter();

  const [projectId, setProjectId] = useState<string>('1');
  const [amountBlu, setAmountBlu] = useState<string>('100.0');
  const [priceVaraPerTonne, setPriceVaraPerTonne] = useState<string>('25.0');

  // Tx state
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);

  const parsedAmountBlu = Math.max(0.001, parseFloat(amountBlu) || 0);
  const parsedPriceVara = Math.max(0.001, parseFloat(priceVaraPerTonne) || 0);

  // Math in milli-BLU and Planck
  const milliBlu = BigInt(Math.round(parsedAmountBlu * 1000));
  // 1 BLU = 1000 milli. Price per milli in planck = (price per tonne in planck) / 1000
  const pricePerMilliPlanck = BigInt(Math.round(parsedPriceVara * 1_000_000_000)); // 1 VARA = 10^12 planck, divided by 1000 = 10^9
  const totalValuePlanck = (milliBlu * pricePerMilliPlanck);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setTxStep('preparing');
      setTxError(null);

      await new Promise((r) => setTimeout(r, 600));
      setTxStep('signing');

      await new Promise((r) => setTimeout(r, 900));
      setTxStep('broadcasting');

      await new Promise((r) => setTimeout(r, 1200));

      const simulatedHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      setTxHash(simulatedHash);
      setTxStep('success');
    } catch (err) {
      setTxError(err);
      setTxStep('error');
    }
  };

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Marketplace Listing Creator</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-ink">List Carbon Credits for Sale</h1>
          <p className="text-xs sm:text-sm text-muted">
            Create a public order book listing on the BluToken Market program for verified BLU credits.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-muted/20 shadow-sm space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Source Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="1">#1 – Sundarbans Delta Mangrove Conservation (WB)</option>
              <option value="2">#2 – Gulf of Mannar Seagrass Restoration (TN)</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-ink">Quantity to List (BLU / tCO2e) *</label>
              <span className="text-muted">1 BLU = 1 tCO2e</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                value={amountBlu}
                onChange={(e) => setAmountBlu(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-muted uppercase">
                tCO2e
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-ink">Price Per Tonne (VARA) *</label>
              <span className="text-muted">Unit price</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={priceVaraPerTonne}
                onChange={(e) => setPriceVaraPerTonne(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-muted uppercase">
                VARA
              </span>
            </div>
          </div>

          {/* Pricing Estimation Preview */}
          <div className="bg-mist/50 p-4 rounded-xl border border-muted/20 space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Total Credit Volume:</span>
              <span className="font-mono text-ink font-semibold">{amountBlu} tCO2e</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Price per 1.000 tCO2e:</span>
              <span className="font-mono text-ink font-semibold">{priceVaraPerTonne} VARA</span>
            </div>
            <div className="pt-2 border-t border-muted/20 flex justify-between font-bold text-sm text-ink">
              <span>Estimated Gross Revenue:</span>
              <span className="font-mono text-forest font-extrabold">
                {formatVara(totalValuePlanck)} VARA
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-earth/10 border border-earth/20 rounded-xl text-xs text-ink">
            <ShieldAlert className="w-4 h-4 text-earth shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              When purchasers buy or retire credits, 98% of proceeds stream directly to project Gram Panchayat beneficiaries via pull-payment smart contract claims.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Confirm &amp; Publish Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title="Publishing Marketplace Listing"
        txHash={txHash}
        error={txError}
        actionLabel="Go to Marketplace"
        onClose={() => setTxStep('idle')}
        onSuccessDone={() => {
          setTxStep('idle');
          router.push('/market');
        }}
      />
    </main>
  );
}
