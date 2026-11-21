'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Coins, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { formatVara, formatBlu } from '@/lib/formatters';
import { StatCard } from '@/components/ui/stat-card';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

interface CommunityShareItem {
  projectId: string | number;
  projectName: string;
  shareBps: number;
  totalAccruedPlanck: bigint;
  claimedPlanck: bigint;
  claimablePlanck: bigint;
}

export default function CommunityDashboardPage() {
  const [shares, setShares] = useState<CommunityShareItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Claim Tx state
  const [activeProjectId, setActiveProjectId] = useState<string | number | null>(null);
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);

  useEffect(() => {
    // In demo / MVP, load community share allocations
    setTimeout(() => {
      setShares([
        {
          projectId: '1',
          projectName: 'Sundarbans Delta Mangrove Conservation',
          shareBps: 10000, // 100%
          totalAccruedPlanck: 45_000_000_000_000n, // 45 VARA
          claimedPlanck: 20_000_000_000_000n,    // 20 VARA
          claimablePlanck: 25_000_000_000_000n,  // 25 VARA
        },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const totalClaimablePlanck = shares.reduce((sum, s) => sum + s.claimablePlanck, 0n);
  const totalClaimedPlanck = shares.reduce((sum, s) => sum + s.claimedPlanck, 0n);

  const handleClaim = async (projId: string | number) => {
    setActiveProjectId(projId);

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

      // Optimistically update claimed balance
      setShares((prev) =>
        prev.map((s) =>
          s.projectId === projId
            ? {
                ...s,
                claimedPlanck: s.claimedPlanck + s.claimablePlanck,
                claimablePlanck: 0n,
              }
            : s
        )
      );

      setTxStep('success');
    } catch (err) {
      setTxError(err);
      setTxStep('error');
    }
  };

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Coastal Community Gram Panchayat Portal</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-ink">Community Revenue Distributions</h1>
          <p className="text-xs sm:text-sm text-muted">
            Direct, pull-payment revenue distribution to coastal panchayats from marketplace carbon credit sales.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Claimable Balance"
            value={formatVara(totalClaimablePlanck)}
            unit="VARA"
            variant="forest"
          />
          <StatCard
            title="Total Claimed to Date"
            value={formatVara(totalClaimedPlanck)}
            unit="VARA"
          />
          <StatCard
            title="Active Partnerships"
            value={shares.length}
            unit="sites"
            variant="teal"
          />
        </div>

        {/* Shares Table */}
        <div className="bg-white rounded-3xl border border-muted/20 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-muted/20 pb-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-ink">Project Allocations &amp; Balances</h2>
              <p className="text-xs text-muted">
                Revenue streams directly accumulate in smart contract accumulators on every marketplace trade.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-leaf/20 text-leaf text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pull-Payment Architecture (Gas Protected)</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-forest" />
              <span>Loading revenue shares...</span>
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted">
              No active community beneficiary allocations linked to this wallet.
            </div>
          ) : (
            <div className="space-y-4">
              {shares.map((share) => (
                <div
                  key={share.projectId}
                  className="p-5 rounded-2xl bg-mist/40 border border-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted">
                        Project #{share.projectId}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-forest/10 text-forest">
                        {(share.shareBps / 100).toFixed(1)}% Share
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-ink">{share.projectName}</h3>
                    <div className="text-xs text-muted flex gap-4">
                      <span>Total Accrued: <strong className="text-ink">{formatVara(share.totalAccruedPlanck)} VARA</strong></span>
                      <span>Claimed: <strong className="text-teal">{formatVara(share.claimedPlanck)} VARA</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-muted font-medium">Claimable Revenue</div>
                      <div className="text-xl font-mono font-black text-forest">
                        {formatVara(share.claimablePlanck)} VARA
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={share.claimablePlanck <= 0n}
                      onClick={() => handleClaim(share.projectId)}
                      className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest/90 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Claim to Wallet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title="Claiming Community Revenue"
        txHash={txHash}
        error={txError}
        actionLabel="Done"
        onClose={() => setTxStep('idle')}
        onSuccessDone={() => setTxStep('idle')}
      />
    </main>
  );
}
