'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart, Award, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { formatVara, formatBlu } from '@/lib/formatters';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: number | string | bigint;
    projectId: number | string | bigint;
    projectName?: string;
    seller: string;
    remainingMilliBlu: bigint | string;
    pricePerMilliPlanck: bigint | string;
  };
  initialMode?: 'buy' | 'retire';
}

export function PurchaseModal({
  isOpen,
  onClose,
  listing,
  initialMode = 'retire',
}: PurchaseModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'buy' | 'retire'>(initialMode);
  const [quantityBlu, setQuantityBlu] = useState<string>('1.0');
  const [retireeName, setRetireeName] = useState<string>('');
  const [retireReason, setRetireReason] = useState<string>('');

  // Tx Modal state
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);
  const [createdRetirementId, setCreatedRetirementId] = useState<string | null>(null);

  if (!isOpen) return null;

  const remainingMilli = BigInt(listing.remainingMilliBlu || '0');
  const pricePerMilli = BigInt(listing.pricePerMilliPlanck || '0');

  // Parse user requested quantity
  const parsedQuantityBlu = Math.max(0.001, parseFloat(quantityBlu) || 0);
  const requestedMilliBlu = BigInt(Math.round(parsedQuantityBlu * 1000));
  const effectiveMilliBlu = requestedMilliBlu > remainingMilli ? remainingMilli : requestedMilliBlu;

  // Exact BigInt arithmetic
  const baseCostPlanck = effectiveMilliBlu * pricePerMilli;
  const platformFeePlanck = (baseCostPlanck * 200n) / 10000n; // 2% protocol fee
  const totalCostPlanck = baseCostPlanck + platformFeePlanck;

  const handleExecute = async () => {
    try {
      setTxStep('preparing');
      setTxError(null);

      // Simulate preparation delay
      await new Promise((r) => setTimeout(r, 600));
      setTxStep('signing');

      // Check if window has injected wallet or mock
      await new Promise((r) => setTimeout(r, 1000));
      setTxStep('broadcasting');

      // Execute on-chain or mock
      await new Promise((r) => setTimeout(r, 1200));

      const simulatedTxHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      setTxHash(simulatedTxHash);

      if (mode === 'retire') {
        const retirementId = '1';
        setCreatedRetirementId(retirementId);
      }

      setTxStep('success');
    } catch (err) {
      setTxError(err);
      setTxStep('error');
    }
  };

  const handleSuccessDone = () => {
    onClose();
    if (mode === 'retire' && createdRetirementId) {
      router.push(`/retire/${createdRetirementId}`);
    } else {
      router.push('/dashboard/buyer');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-muted/20 relative space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-muted/20 pb-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-ink">
                {mode === 'retire' ? 'Buy & Retire Carbon Credits' : 'Purchase Carbon Credits'}
              </h3>
              <p className="text-xs text-muted">
                Listing #{listing.id} · {listing.projectName || `Project #${listing.projectId}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:text-ink hover:bg-mist transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex p-1 bg-mist rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('retire')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === 'retire' ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Buy &amp; Retire (Offset)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('buy')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === 'buy' ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy &amp; Hold in Wallet</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted">Quantity (tCO2e / BLU)</span>
              <span className="text-forest font-mono">
                Available: {formatBlu(remainingMilli)} BLU
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                max={Number(remainingMilli) / 1000}
                value={quantityBlu}
                onChange={(e) => setQuantityBlu(e.target.value)}
                className="w-full text-lg font-mono font-bold px-4 py-2.5 rounded-xl border border-muted/30 focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-muted uppercase">
                tCO2e
              </span>
            </div>
          </div>

          {/* Buy & Retire Specific Fields */}
          {mode === 'retire' && (
            <div className="space-y-3 bg-mist/60 p-4 rounded-xl border border-muted/20 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Retiree Legal Entity or Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp / Tata Sons ESG Initiative"
                  value={retireeName}
                  onChange={(e) => setRetireeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-muted/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Retirement Purpose / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. FY26 Corporate Net-Zero Scope 1 Offset"
                  value={retireReason}
                  onChange={(e) => setRetireReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-muted/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          )}

          {/* Pricing & Fee Breakdown */}
          <div className="bg-white p-4 rounded-xl border border-muted/20 space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Base Credit Cost ({formatBlu(effectiveMilliBlu)} tCO2e):</span>
              <span className="font-mono text-ink">{formatVara(baseCostPlanck)} VARA</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Protocol Treasury Fee (2.00%):</span>
              <span className="font-mono text-ink">{formatVara(platformFeePlanck)} VARA</span>
            </div>
            <div className="pt-2 border-t border-muted/20 flex justify-between font-bold text-sm text-ink">
              <span>Total Payment:</span>
              <span className="font-mono text-forest font-extrabold">
                {formatVara(totalCostPlanck)} VARA
              </span>
            </div>
          </div>

          {/* Mandatory Pilot Registry Notice */}
          <div className="flex items-start gap-2 p-3 bg-earth/10 border border-earth/20 rounded-xl text-xs text-ink">
            <ShieldAlert className="w-4 h-4 text-earth shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Pilot Registry Notice:</strong> BluTokens are pilot registry tokens, not government-certified credits. Retiring tokens permanently burns them on-chain.
            </span>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={handleExecute}
            disabled={effectiveMilliBlu <= 0n || (mode === 'retire' && !retireeName)}
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest/90 disabled:opacity-40 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>{mode === 'retire' ? 'Confirm & Sign Retirement' : 'Confirm & Buy Credits'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title={mode === 'retire' ? 'Retiring Carbon Credits' : 'Purchasing Carbon Credits'}
        txHash={txHash}
        error={txError}
        actionLabel={mode === 'retire' ? 'View Certificate' : 'Go to Dashboard'}
        onClose={() => setTxStep('idle')}
        onSuccessDone={handleSuccessDone}
      />
    </>
  );
}
