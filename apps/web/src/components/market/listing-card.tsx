'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, ShoppingCart, Award } from 'lucide-react';
import { EcosystemBadge } from '@/components/ui/ecosystem-badge';
import { formatBlu, formatVara, truncateAddress } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';

export interface ListingCardData {
  id: string | bigint;
  projectId: string | bigint;
  seller: string;
  remaining: string | bigint;
  pricePerMilli: string | bigint;
  active: boolean;
  project?: {
    id: string | bigint;
    name: string;
    ecosystem: string;
    stateCode: string;
  } | null;
}

export function ListingCard({
  listing,
  onBuy,
  onRetire,
}: {
  listing: ListingCardData;
  onBuy?: (listing: ListingCardData) => void;
  onRetire?: (listing: ListingCardData) => void;
}) {
  const { t } = useI18n();

  // pricePerMilli is planck per milli-BLU. 1 BLU = 1000 milli.
  // Price per 1 BLU (1 tonne) = pricePerMilli * 1000 planck
  const pricePerMilliBig = BigInt(listing.pricePerMilli || 0);
  const pricePerTonnePlanck = pricePerMilliBig * 1000n;

  return (
    <div className="bg-white rounded-2xl border border-muted/20 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          {listing.project && <EcosystemBadge ecosystem={listing.project.ecosystem} size="sm" />}
          <div className="text-[11px] font-mono text-muted bg-mist px-2 py-0.5 rounded-full">
            Seller: {truncateAddress(listing.seller, 5)}
          </div>
        </div>

        {/* Project Name */}
        <div>
          {listing.project ? (
            <Link
              href={`/projects/${listing.project.id}`}
              className="font-serif font-bold text-lg text-ink hover:text-forest transition-colors line-clamp-1"
            >
              {listing.project.name}
            </Link>
          ) : (
            <div className="font-serif font-bold text-lg text-ink">
              Project #{listing.projectId.toString()}
            </div>
          )}
          <div className="text-xs text-muted mt-0.5">
            Verified Blue Carbon Pilot Registry Credits
          </div>
        </div>

        {/* Price & Balance */}
        <div className="bg-mist/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-muted block uppercase font-medium">Available</span>
            <span className="font-semibold text-forest text-sm">
              {formatBlu(listing.remaining)} BLU
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted block uppercase font-medium">Price / Tonne</span>
            <span className="font-semibold text-ink text-sm">
              {formatVara(pricePerTonnePlanck)} VARA
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onBuy?.(listing)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-forest hover:bg-forest/90 text-white font-medium px-3 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t.common.buy}</span>
        </button>

        <button
          type="button"
          onClick={() => onRetire?.(listing)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-leaf/15 hover:bg-leaf/25 border border-leaf/40 text-leaf font-medium px-3 py-2 rounded-xl text-xs transition-colors"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t.common.retire}</span>
        </button>
      </div>
    </div>
  );
}
