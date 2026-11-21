'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, ShoppingCart, Award, Plus } from 'lucide-react';
import { ListingCard, type ListingCardData } from '@/components/market/listing-card';
import { StatCard } from '@/components/ui/stat-card';
import { formatBlu, formatVara } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';
import { PurchaseModal } from '@/components/market/purchase-modal';

export default function MarketPage() {
  const { t } = useI18n();

  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ListingCardData | null>(null);
  const [modalMode, setModalMode] = useState<'buy' | 'retire'>('retire');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/listings?active=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setListings(data.items);
        } else {
          // Default initial listings for demo
          setListings([
            {
              id: '1',
              projectId: '1',
              seller: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              remaining: '4000000', // 4,000 BLU
              pricePerMilli: '25000000', // 25 VARA per BLU (25 * 10^12 / 1000 = 25 * 10^9)
              active: true,
              project: {
                id: '1',
                name: 'Sundarbans Delta Mangrove Conservation',
                ecosystem: 'Mangrove',
                stateCode: 'WB',
              },
            },
          ]);
        }
      })
      .catch(() => {
        setListings([
          {
            id: '1',
            projectId: '1',
            seller: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            remaining: '4000000',
            pricePerMilli: '25000000',
            active: true,
            project: {
              id: '1',
              name: 'Sundarbans Delta Mangrove Conservation',
              ecosystem: 'Mangrove',
              stateCode: 'WB',
            },
          },
        ]);
      })
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
    setIsModalOpen(true);
  };

  const handleOpenRetire = (l: ListingCardData) => {
    setSelectedListing(l);
    setModalMode('retire');
    setIsModalOpen(true);
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
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

        <div>
          <Link
            href="/dashboard/owner/listings/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Listing</span>
          </Link>
        </div>
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

      {/* Feature-complete Purchase & Retirement Modal */}
      {selectedListing && (
        <PurchaseModal
          isOpen={isModalOpen}
          initialMode={modalMode}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedListing(null);
          }}
          listing={{
            id: selectedListing.id,
            projectId: selectedListing.projectId,
            projectName: selectedListing.project?.name,
            seller: selectedListing.seller,
            remainingMilliBlu: selectedListing.remaining,
            pricePerMilliPlanck: selectedListing.pricePerMilli,
          }}
        />
      )}
    </main>
  );
}
