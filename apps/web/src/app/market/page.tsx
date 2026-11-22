'use client';

import React, { useState } from 'react';

interface ListingItem {
  id: string;
  name: string;
  eco: string;
  ecoCategory: 'mangrove' | 'seagrass' | 'saltmarsh';
  state: string;
  vintage: string;
  available: string;
  unitPrice: number;
  imageUrl: string;
}

const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: '1',
    name: 'Sundarbans Delta Zone A-4',
    eco: 'Mangrove • West Bengal',
    ecoCategory: 'mangrove',
    state: 'West Bengal',
    vintage: 'Vintage 2026',
    available: '450.000 BLU',
    unitPrice: 42.5,
    imageUrl:
      'https://images.unsplash.com/photo-1618245318763-a15176d00133?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Pichavaram Rhizophora Zone',
    eco: 'Mangrove • Tamil Nadu',
    ecoCategory: 'mangrove',
    state: 'Tamil Nadu',
    vintage: 'Vintage 2026',
    available: '320.000 BLU',
    unitPrice: 39.0,
    imageUrl:
      'https://images.unsplash.com/photo-1618245318763-a15176d00133?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Gulf of Mannar Cymodocea',
    eco: 'Seagrass • Tamil Nadu',
    ecoCategory: 'seagrass',
    state: 'Tamil Nadu',
    vintage: 'Vintage 2025',
    available: '615.000 BLU',
    unitPrice: 44.0,
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Bhitarkanika Sanctuary',
    eco: 'Salt Marsh • Odisha',
    ecoCategory: 'saltmarsh',
    state: 'Odisha',
    vintage: 'Vintage 2026',
    available: '280.000 BLU',
    unitPrice: 37.5,
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
];

export default function MarketPage() {
  const [filterEco, setFilterEco] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('Sundarbans Delta Zone A-4');
  const [unitPrice, setUnitPrice] = useState<number>(42.5);
  const [retireQty, setRetireQty] = useState<string>('25.000');
  const [beneficiary, setBeneficiary] = useState<string>(
    'In honor of Sundarbans Coastal Mangrove Guardians'
  );
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const filteredListings = INITIAL_LISTINGS.filter((l) => {
    if (filterEco === 'all' || filterEco === 'vintage') return true;
    return l.ecoCategory === filterEco;
  });

  const qty = parseFloat(retireQty) || 0;
  const basePrice = qty * unitPrice;
  const protocolFee = basePrice * 0.025;
  const gasEstimate = 0.001;
  const totalSettlement = basePrice + protocolFee + gasEstimate;

  const handleSelectListing = (name: string, price: number) => {
    setSelectedProject(name);
    setUnitPrice(price);
    const flowSection = document.getElementById('retirement-flow');
    if (flowSection) {
      flowSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main id="marketplace" className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-12">
      {/* Nature Banner Header */}
      <section className="relative rounded-2xl overflow-hidden bg-deep-canopy text-on-deep-canopy p-6 sm:p-10 shadow-lg border border-outline-variant/60">
        {/* Background Nature Imagery - Underwater Seagrass & Coastal Mangroves */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80"
          alt="Sunlit coastal blue carbon ecosystem waters"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-canopy/95 via-deep-canopy/80 to-deep-canopy/65" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20 text-xs font-semibold text-shoot-lime">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>VERIFIED OFFSETS • INSTANT ON-CHAIN RETIREMENT</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-deep-canopy tracking-tight">
              Blue Carbon Credit Marketplace
            </h1>
            <p className="font-body text-sm sm:text-base text-on-deep-canopy/85 leading-relaxed">
              Purchase and permanently retire Sentinel-2 verified BLU credits on Vara Network. Direct algorithmic revenue distribution to coastal Gram Panchayats.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {[
              { id: 'all', label: 'All Ecosystems' },
              { id: 'mangrove', label: 'Mangroves' },
              { id: 'seagrass', label: 'Seagrass' },
              { id: 'saltmarsh', label: 'Salt Marsh' },
              { id: 'vintage', label: 'Vintage 2026' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilterEco(btn.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md ${
                  filterEco === btn.id
                    ? 'bg-shoot-lime text-on-shoot-lime shadow-sm'
                    : 'bg-surface-card/15 text-on-deep-canopy border border-on-deep-canopy/25 hover:bg-surface-card/25'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="flex flex-col gap-6">
        {/* Marketplace Listing Grid (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {filteredListings.map((item) => (
            <article
              key={item.id}
              className="market-card bg-surface-card rounded-xl border border-outline-variant/60 overflow-hidden shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col justify-between h-full"
            >
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <span className="font-label text-label-sm absolute top-3 left-3 px-2.5 py-1 rounded-full bg-deep-canopy/85 backdrop-blur-md text-on-deep-canopy">
                  {item.vintage}
                </span>
              </div>
              <div className="p-gutter-md flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <span className="font-label text-label-sm text-tidal-teal">{item.eco}</span>
                  <h2 className="font-title text-title-md text-on-surface mt-0.5">{item.name}</h2>
                </div>
                <div className="bg-surface-container-low rounded-md p-2.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-label-sm text-botanical-muted">Available</span>
                    <span className="font-mono text-mono-md text-on-surface tabular-nums">{item.available}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-label text-label-sm text-botanical-muted">Unit Price</span>
                    <span className="font-mono text-mono-md text-primary tabular-nums">
                      {item.unitPrice.toFixed(1)} VARA / tCO2e
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectListing(item.name, item.unitPrice)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-living-leaf text-on-living-leaf hover:bg-primary hover:text-on-primary transition-colors duration-state-change font-label text-label-lg"
                >
                  <span>Buy &amp; Retire Credits</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Retirement Modal & Digital Certificate Preview Split Studio from Stitch */}
      <section
        id="retirement-flow"
        className="bg-surface-container-low rounded-xl border border-outline-variant p-gutter-lg sm:p-gutter-xl shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl items-stretch"
      >
        {/* Left: Retirement Modal Form */}
        <div className="lg:col-span-5 bg-surface-card rounded-xl border border-outline-variant/70 p-gutter-lg flex flex-col justify-between gap-gutter-md shadow-sm">
          <div className="flex items-start justify-between gap-2 pb-gutter-sm border-b border-outline-variant/50">
            <div>
              <span className="font-label text-label-sm text-primary uppercase tracking-wider">
                On-Chain Retirement
              </span>
              <h2 className="font-headline text-headline-md text-on-surface">{selectedProject}</h2>
            </div>
            <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">
              verified
            </span>
          </div>

          <div className="flex flex-col gap-gutter-md">
            {/* Tonnes Input */}
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label-md text-on-surface">Tonnes to Retire (tCO2e)</span>
              <div className="relative flex items-center">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-primary absolute left-3.5">
                  eco
                </span>
                <input
                  type="text"
                  value={retireQty}
                  onChange={(e) => setRetireQty(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-md border border-outline-variant bg-surface-card pl-10 pr-16 py-2.5 font-mono text-mono-md text-on-surface tabular-nums focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <span className="font-mono text-mono-sm text-botanical-muted absolute right-3.5">tCO2e</span>
              </div>
            </label>

            {/* Beneficiary Input */}
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label-md text-on-surface">Beneficiary / Dedication Name</span>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="w-full rounded-md border border-outline-variant bg-surface-card px-3.5 py-2.5 font-body text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </label>

            {/* Price Summary Breakdown */}
            <div className="bg-surface-container-low rounded-lg p-gutter-md flex flex-col gap-2 border border-outline-variant/50">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-md text-botanical-muted">
                  Base Price ({qty.toFixed(3)} × {unitPrice.toFixed(1)} VARA)
                </span>
                <span className="font-mono text-mono-md text-on-surface tabular-nums">
                  {basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VARA
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-body-md text-botanical-muted">Protocol Treasury Fee (2.5%)</span>
                <span className="font-mono text-mono-md text-on-surface tabular-nums">
                  {protocolFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VARA
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-body-md text-botanical-muted">Vara Network Gas</span>
                <span className="font-mono text-mono-md text-on-surface tabular-nums">0.001 VARA</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between">
                <span className="font-title text-title-md text-on-surface">Total Settlement</span>
                <span className="font-title text-title-lg text-primary tabular-nums">
                  {totalSettlement.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} VARA
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded-md bg-primary text-on-primary hover:bg-deep-canopy transition-colors duration-state-change font-label text-label-lg shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              lock
            </span>
            <span>{confirmed ? 'Retirement Confirmed on Vara' : 'Confirm Retirement'}</span>
          </button>
        </div>

        {/* Right: Digital Retirement Certificate Preview Pane from Stitch */}
        <div className="lg:col-span-7 bg-surface-card rounded-xl p-6 border-2 border-primary/25 relative overflow-hidden flex flex-col justify-between shadow-sm">
          {/* Botanical Mangrove Root Filigree Corners */}
          <svg
            className="absolute top-0 left-0 w-24 h-24 text-primary/15 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 8C35 8 50 25 60 55M8 8C8 35 25 50 55 60M20 8C20 28 32 40 48 48"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="absolute bottom-0 right-0 w-24 h-24 text-primary/15 rotate-180 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 8C35 8 50 25 60 55M8 8C8 35 25 50 55 60M20 8C20 28 32 40 48 48"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative border border-primary/20 rounded-lg p-gutter-lg flex flex-col justify-between gap-gutter-lg h-full bg-morning-mist/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-label text-label-sm text-tidal-teal uppercase tracking-wider">
                  Digital Certificate Preview
                </span>
                <h3 className="font-display text-headline-md text-deep-canopy mt-1">
                  Official Certificate of Blue Carbon Sequestration
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container shrink-0 font-label text-label-sm">
                <span className="w-2 h-2 rounded-full bg-living-leaf" aria-hidden="true" />
                <span>Vara Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-md py-gutter-md border-y border-outline-variant/60">
              <div>
                <span className="font-label text-label-sm text-botanical-muted block">Dedicated To / Retiree</span>
                <p className="font-title text-title-md text-on-surface mt-0.5">{beneficiary || 'Anonymous Steward'}</p>
              </div>
              <div>
                <span className="font-label text-label-sm text-botanical-muted block">Retired Quantity</span>
                <p className="font-headline text-headline-lg text-primary tabular-nums">{qty.toFixed(3)} tCO2e</p>
              </div>
              <div>
                <span className="font-label text-label-sm text-botanical-muted block">Retirement ID</span>
                <p className="font-mono text-mono-md text-on-surface">RET-VARA-2026-0894</p>
              </div>
              <div>
                <span className="font-label text-label-sm text-botanical-muted block">Timestamp</span>
                <p className="font-mono text-mono-md text-on-surface tabular-nums">22 Nov 2026 • 07:15 IST</p>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-gutter-md">
              {/* QR Code pointing to live Vara Network Tx Hash */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 p-1.5 bg-surface-card rounded-md border border-outline-variant flex items-center justify-center">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-full h-full text-deep-canopy"
                    fill="currentColor"
                    aria-label="QR Code to Vara Network transaction"
                  >
                    <rect x="2" y="2" width="10" height="10" rx="1" />
                    <rect x="4" y="4" width="6" height="6" fill="#FFFFFF" />
                    <rect x="5.5" y="5.5" width="3" height="3" />
                    <rect x="24" y="2" width="10" height="10" rx="1" />
                    <rect x="26" y="4" width="6" height="6" fill="#FFFFFF" />
                    <rect x="27.5" y="5.5" width="3" height="3" />
                    <rect x="2" y="24" width="10" height="10" rx="1" />
                    <rect x="4" y="26" width="6" height="6" fill="#FFFFFF" />
                    <rect x="5.5" y="27.5" width="3" height="3" />
                    <rect x="15" y="4" width="3" height="3" />
                    <rect x="15" y="10" width="6" height="3" />
                    <rect x="14" y="16" width="8" height="4" />
                    <rect x="24" y="16" width="4" height="6" />
                    <rect x="16" y="24" width="6" height="4" />
                    <rect x="26" y="26" width="6" height="6" />
                  </svg>
                </div>
                <div>
                  <span className="font-label text-label-sm text-botanical-muted block">Vara Tx Hash</span>
                  <span className="font-mono text-mono-sm text-tidal-teal">0xdf04...7928</span>
                </div>
              </div>

              {/* Official Pilot Seal */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rhizome-earth-container text-on-rhizome-earth-container border border-rhizome-earth/25">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  workspace_premium
                </span>
                <span className="font-label text-label-sm">Official BluToken Pilot Seal</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
