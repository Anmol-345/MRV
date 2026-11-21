'use client';

import React, { useState, useEffect } from 'react';
import { Tag, ShoppingCart, Award, X, Check, ShieldAlert } from 'lucide-react';
import { ListingCard, ListingCardData } from '@/components/market/listing-card';
import { StatCard } from '@/components/ui/stat-card';
import { formatBlu, formatVara, formatNumber } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';
import { useAccount } from '@gear-js/react-hooks';

export default function MarketPage() {
  const { t } = useI18n();
  const { account } = useAccount();

  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ListingCardData | null>(null);
  const [modalMode, setModalMode] = useState<'buy' | 'retire' | null>(null);
  const [buyAmountMilli, setBuyAmountMilli] = useState<string>('100000'); // default 100 BLU
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [retireReason, setRetireReason] = useState<string>('Scope 3 Offset');
  const [txSuccess, setTxSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/listings?active=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items) {
          setListings(data.items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAvailableMilli = listings.reduce((acc, l) => acc + BigInt(l.remaining || 0), 0n);
  const minPricePerMilli = listings.length > 0
    ? listings.reduce((min, l) => {
        const p = BigInt(l.pricePerMilli || 0);
        return p < min ? p : min;
      }, BigInt(listings[0].pricePerMilli || 0))
    : 0n;

  const handleOpenBuy = (l: ListingCardData) => {
    setSelectedListing(l);
    setModalMode('buy');
    setTxSuccess(false);
  };

  const handleOpenRetire = (l: ListingCardData) => {
    setSelectedListing(l);
    setModalMode('retire');
    setTxSuccess(false);
  };

  const handleCloseModal = () => {
    setSelectedListing(null);
    setModalMode(null);
    setTxSuccess(false);
  };

  const calculateCost = () => {
    if (!selectedListing) return 0n;
    const amountMilli = BigInt(buyAmountMilli || 0);
    const priceMilli = BigInt(selectedListing.pricePerMilli || 0);
    return amountMilli * priceMilli;
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-forest">
          Carbon Marketplace
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
          Verified Blue Carbon Credits
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          Purchase and retire verified pilot registry blue carbon credits directly from coastal restoration projects with on-chain revenue sharing.
        </p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Carbon Credits"
          value={formatBlu(totalAvailableMilli)}
          unit="BLU"
          subtitle="1 BLU = 1 tCO2e"
          icon={<Tag className="w-4 h-4 text-forest" />}
          variant="forest"
        />
        <StatCard
          title="Active Listings"
          value={listings.length}
          subtitle="From verified projects"
          icon={<ShoppingCart className="w-4 h-4 text-leaf" />}
          variant="leaf"
        />
        <StatCard
          title="Floor Price"
          value={formatVara(minPricePerMilli * 1000n)}
          unit="VARA / tonne"
          subtitle="Fixed transparent pricing"
          icon={<Award className="w-4 h-4 text-teal" />}
          variant="teal"
        />
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin mx-auto" />
          <div className="text-xs text-muted font-medium">{t.common.loading}</div>
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-6">
          <div className="text-xs text-muted font-medium">
            Showing {listings.length} active listings
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard
                key={l.id.toString()}
                listing={l}
                onBuy={handleOpenBuy}
                onRetire={handleOpenRetire}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-muted/20 p-12 text-center space-y-3">
          <Tag className="w-10 h-10 text-muted mx-auto" />
          <div className="font-serif font-bold text-lg text-ink">No Active Listings Found</div>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Check back soon as verified project developers submit new MRV reports and issue additional credits.
          </p>
        </div>
      )}

      {/* Purchase / Retirement Modal */}
      {modalMode && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-muted/20 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-muted/10">
              <span className="font-serif font-bold text-lg text-ink">
                {modalMode === 'buy' ? 'Buy Carbon Credits' : 'Buy & Retire Carbon Credits'}
              </span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-mist/60 p-3.5 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-ink">{selectedListing.project?.name || `Project #${selectedListing.projectId}`}</div>
              <div className="text-muted">Available: {formatBlu(selectedListing.remaining)} BLU</div>
              <div className="text-forest font-semibold">
                Price: {formatVara(BigInt(selectedListing.pricePerMilli) * 1000n)} VARA / tCO2e
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink block">Amount (in milli-tCO2e)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={buyAmountMilli}
                onChange={(e) => setBuyAmountMilli(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-muted/20 text-xs font-mono focus:ring-1 focus:ring-forest text-ink"
              />
              <div className="text-[11px] text-muted">
                = {(Number(buyAmountMilli) / 1000).toFixed(3)} BLU (tCO2e)
              </div>
            </div>

            {/* Retire-specific inputs */}
            {modalMode === 'retire' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">Beneficiary Entity Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp ESG Program"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-muted/20 text-xs text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">Retirement Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Corporate Scope 3 Carbon Neutrality 2026"
                    value={retireReason}
                    onChange={(e) => setRetireReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-muted/20 text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* Cost calculation */}
            <div className="bg-forest/10 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-muted font-medium">Total Cost:</span>
              <span className="font-bold text-forest text-sm font-mono">
                {formatVara(calculateCost())} VARA
              </span>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 bg-earth/10 p-2.5 rounded-lg text-[11px] text-earth">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                BluTokens are pilot registry credits. On-chain purchases transfer VARA directly to project community stakeholder accounts.
              </span>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTxSuccess(true)}
                className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {account ? (modalMode === 'buy' ? 'Confirm Purchase' : 'Confirm & Generate Certificate') : 'Connect Wallet to Transact'}
              </button>
            </div>

            {txSuccess && (
              <div className="p-3 bg-leaf/15 border border-leaf/30 rounded-xl text-leaf text-xs font-medium text-center">
                Ready for on-chain signature in Phase 6!
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
