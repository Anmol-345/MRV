'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SiteData {
  state: string;
  name: string;
  area: string;
  ndvi: string;
  eco: string;
  blu: string;
  projectId: number;
}

const SITES: Record<string, SiteData> = {
  sundarbans: {
    state: 'West Bengal • ID #1042',
    name: 'Sundarbans Tiger Reserve Mangrove Belt',
    area: '4,200 ha',
    ndvi: 'NDVI: 0.78',
    eco: 'Mangrove - Avicennia marina',
    blu: '142,800.000 BLU',
    projectId: 1,
  },
  pichavaram: {
    state: 'Tamil Nadu • ID #1045',
    name: 'Pichavaram Rhizophora Restoration Zone',
    area: '1,450 ha',
    ndvi: 'NDVI: 0.74',
    eco: 'Mangrove - Rhizophora apiculata',
    blu: '48,620.000 BLU',
    projectId: 2,
  },
  mannar: {
    state: 'Tamil Nadu • ID #1049',
    name: 'Gulf of Mannar Cymodocea Seagrass Beds',
    area: '5,890 ha',
    ndvi: 'NDVI: 0.69',
    eco: 'Seagrass - Cymodocea serrulata',
    blu: '112,400.000 BLU',
    projectId: 3,
  },
  bhitarkanika: {
    state: 'Odisha • ID #1053',
    name: 'Bhitarkanika Estuarine Sanctuary',
    area: '3,280 ha',
    ndvi: 'NDVI: 0.76',
    eco: 'Salt Marsh & Heritiera fomes',
    blu: '80,300.000 BLU',
    projectId: 4,
  },
};

export default function HomePage() {
  const [selectedSiteKey, setSelectedSiteKey] = useState<string>('sundarbans');
  const currentSite = SITES[selectedSiteKey] || SITES.sundarbans;

  const [stats, setStats] = useState({
    totalAreaHa: 14820,
    totalMintedBlu: 384120,
    communityRevenueCr: '4.82',
    quorumRate: '99.4%',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setStats((prev) => ({
            ...prev,
            totalAreaHa: data.totalAreaHa || prev.totalAreaHa,
            totalMintedBlu: data.totalMintedBlu || prev.totalMintedBlu,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main id="top" className="flex-1 flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section from Stitch */}
      <section className="relative bg-deep-canopy text-on-deep-canopy overflow-hidden">
        {/* Aerial View of Sundarbans Mangrove Canals */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1800&q=80"
          alt="Aerial view of Sundarbans mangrove forest canals winding through brackish estuary water"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-canopy/80 via-deep-canopy/70 to-deep-canopy/90" aria-hidden="true" />

        {/* Delicate Tidal Contour SVG Overlay */}
        <svg
          className="absolute right-0 top-0 h-full w-1/2 opacity-15 pointer-events-none"
          viewBox="0 0 600 480"
          fill="none"
          aria-hidden="true"
        >
          <path d="M50 80C180 40 240 160 390 120C510 88 560 180 620 150" stroke="#8FB855" strokeWidth="1.5" />
          <path d="M20 150C160 110 260 220 410 180C530 148 570 240 620 210" stroke="#8FB855" strokeWidth="1.2" />
          <path d="M0 230C150 190 280 300 430 250C540 215 580 300 620 270" stroke="#1F6F78" strokeWidth="1.5" />
        </svg>

        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-28 md:pb-36">
          <div className="max-w-3xl flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20">
              <span className="material-symbols-outlined text-[16px] text-shoot-lime" aria-hidden="true">
                satellite_alt
              </span>
              <span className="font-label text-xs sm:text-sm font-semibold text-on-deep-canopy tracking-wide">
                Sentinel-2 L2A &amp; Vara Mainnet Live
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-on-deep-canopy text-balance leading-tight">
              Verifiable Blue Carbon from India&apos;s Tidal Frontiers.
            </h1>

            <p className="font-body text-base sm:text-lg text-on-deep-canopy/85 text-pretty max-w-2xl leading-relaxed">
              High-resolution Sentinel-2 satellite MRV and multi-pool carbon accounting on Vara Network.
              Empowering coastal panchayats from the Sundarbans to Pichavaram with transparent, pull-based revenue sharing.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/projects/1"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-shoot-lime text-on-shoot-lime hover:bg-living-leaf-container transition-all font-semibold text-sm shadow-md"
              >
                <span>Explore Sundarbans MRV</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/market"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-card/10 backdrop-blur-md text-on-deep-canopy border border-on-deep-canopy/25 hover:bg-surface-card/20 transition-all font-semibold text-sm"
              >
                <span>Retire Blue Carbon Credits</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live KPI Stat Strip (4 Floating Pebble Cards) */}
      <section id="projects" className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {/* KPI 1 */}
          <article className="bg-surface-card text-on-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-md flex flex-col justify-between gap-3 h-full hover:shadow-lg transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[24px] text-primary" aria-hidden="true">
                forest
              </span>
              <span className="font-label text-xs font-semibold px-2.5 py-0.5 rounded-full bg-living-leaf-container text-on-living-leaf-container">
                +12.4% YoY
              </span>
            </div>
            <div>
              <p className="font-headline text-3xl font-bold text-on-surface tabular-nums">
                {stats.totalAreaHa.toLocaleString()} ha
              </p>
              <p className="font-body text-xs sm:text-sm text-botanical-muted mt-0.5">Mangrove &amp; Seagrass Conserved</p>
            </div>
          </article>

          {/* KPI 2 */}
          <article className="bg-surface-card text-on-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-md flex flex-col justify-between gap-3 h-full hover:shadow-lg transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[24px] text-tidal-teal" aria-hidden="true">
                co2
              </span>
              <span className="font-label text-xs font-semibold px-2.5 py-0.5 rounded-full bg-tidal-teal-container text-on-tidal-teal-container">
                3-Pool Verified
              </span>
            </div>
            <div>
              <p className="font-headline text-3xl font-bold text-on-surface tabular-nums">
                {stats.totalMintedBlu.toLocaleString()}
              </p>
              <p className="font-body text-xs sm:text-sm text-botanical-muted mt-0.5">tCO2e Net Carbon Sequestered</p>
            </div>
          </article>

          {/* KPI 3 */}
          <article className="bg-surface-card text-on-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-md flex flex-col justify-between gap-3 h-full hover:shadow-lg transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[24px] text-rhizome-earth" aria-hidden="true">
                diversity_3
              </span>
              <span className="font-label text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rhizome-earth-container text-on-rhizome-earth-container">
                42 Panchayats
              </span>
            </div>
            <div>
              <p className="font-headline text-3xl font-bold text-on-surface tabular-nums">
                ₹{stats.communityRevenueCr} Cr
              </p>
              <p className="font-body text-xs sm:text-sm text-botanical-muted mt-0.5">Distributed to Coastal Stewards</p>
            </div>
          </article>

          {/* KPI 4 */}
          <article className="bg-surface-card text-on-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-md flex flex-col justify-between gap-3 h-full hover:shadow-lg transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[24px] text-living-leaf" aria-hidden="true">
                verified_user
              </span>
              <span className="font-label text-xs font-semibold px-2.5 py-0.5 rounded-full bg-living-leaf-container text-on-living-leaf-container">
                Vara Quorum
              </span>
            </div>
            <div>
              <p className="font-headline text-3xl font-bold text-on-surface tabular-nums">{stats.quorumRate}</p>
              <p className="font-body text-xs sm:text-sm text-botanical-muted mt-0.5">Multi-Org Consensus Verification</p>
            </div>
          </article>
        </div>
      </section>

      {/* Interactive Coastal Map View from Stitch */}
      <section id="satellite-map" className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-tidal-teal mb-1">
              <span>BATHYMETRY &amp; MULTISPECTRAL LAYER</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface">
              National Coastal Blue Carbon Registry
            </h2>
            <p className="font-body text-sm sm:text-base text-botanical-muted max-w-2xl mt-1">
              Select any active estuarine sanctuary along India&apos;s coastline to inspect Sentinel-2 canopy health index,
              verified BLU supply, and locked permanence buffers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-card border border-outline-variant/60 shadow-sm text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-shoot-lime" aria-hidden="true" />
              <span>Mangrove Canopy</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-card border border-outline-variant/60 shadow-sm text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-tidal-teal" aria-hidden="true" />
              <span>Seagrass Meadow</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-card border border-outline-variant/60 shadow-sm text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rhizome-earth" aria-hidden="true" />
              <span>Salt Marsh</span>
            </span>
          </div>
        </div>

        {/* Full-Width Interactive Map Module */}
        <div className="relative rounded-2xl overflow-hidden border border-outline-variant/80 shadow-lg bg-deep-canopy min-h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida/ALJJyrDnp2wXEHhsEqEIgkdVRShjtdR2_wc7SqYfj3RnyfppBEUvqjPVtlz9jdZaIhhqAhVGOd8Ltx5Q4RZJ6jtidwuR5VA6VNJh1VzFv2SmKOBX_qpnD93MglZzXCXJh-HWyu_Bskt2ZB_MWBAudm6gcB2BczKFnT9PmvLDuPfjvaXXTqLpntVyZKvY9Fv-o6BO-sKxhdtlH8Zc70auIMCS-929llYjMTrh1dcAvxU7AZQm6Mx4Kc1PL-PQoaFyg7csn7-BeBI"
            alt="Satellite bathymetry map of India's eastern and southern coastline"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-deep-canopy/25" aria-hidden="true" />

          {/* SVG Polygon Overlays */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice">
            <polygon
              points="790,110 855,98 882,135 832,162 782,144"
              fill="rgba(143, 184, 85, 0.35)"
              stroke="#8FB855"
              strokeWidth="2.5"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('sundarbans')}
            />
            <polygon
              points="712,205 748,195 762,228 725,242"
              fill="rgba(130, 98, 68, 0.4)"
              stroke="#F3ECE5"
              strokeWidth="2"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('bhitarkanika')}
            />
            <polygon
              points="548,362 580,354 592,385 556,396"
              fill="rgba(93, 147, 68, 0.4)"
              stroke="#8FB855"
              strokeWidth="2"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('pichavaram')}
            />
            <polygon
              points="502,438 545,428 558,458 510,468"
              fill="rgba(31, 111, 120, 0.45)"
              stroke="#E0F0F2"
              strokeWidth="2"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('mannar')}
            />
          </svg>

          {/* Clickable Map Site Pins */}
          <button
            type="button"
            onClick={() => setSelectedSiteKey('sundarbans')}
            className={`absolute z-10 top-[19%] left-[67%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors ${
              selectedSiteKey === 'sundarbans'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-shoot-lime" aria-hidden="true" />
            <span className="font-label text-xs font-semibold">Sundarbans (WB)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSiteKey('bhitarkanika')}
            className={`absolute z-10 top-[37%] left-[59%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors ${
              selectedSiteKey === 'bhitarkanika'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rhizome-earth" aria-hidden="true" />
            <span className="font-label text-xs font-semibold">Bhitarkanika (OD)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSiteKey('pichavaram')}
            className={`absolute z-10 top-[66%] left-[46%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors ${
              selectedSiteKey === 'pichavaram'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-living-leaf" aria-hidden="true" />
            <span className="font-label text-xs font-semibold">Pichavaram (TN)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSiteKey('mannar')}
            className={`absolute z-10 top-[81%] left-[42%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors ${
              selectedSiteKey === 'mannar'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-tidal-teal" aria-hidden="true" />
            <span className="font-label text-xs font-semibold">Gulf of Mannar (TN)</span>
          </button>

          {/* Left Site Selector List */}
          <div className="hidden md:flex z-20 flex-col gap-2 absolute top-6 left-6 w-72 bg-surface-card/95 backdrop-blur-md rounded-xl p-4 border border-outline-variant/70 shadow-lg">
            <span className="font-label text-xs font-semibold text-botanical-muted uppercase tracking-wider">
              Registered Sanctuaries (4)
            </span>
            {Object.entries(SITES).map(([key, site]) => {
              const isActive = selectedSiteKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSiteKey(key)}
                  className={`text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="font-label text-xs truncate pr-2">{site.name}</span>
                  <span className="font-mono text-xs text-botanical-muted">{site.state.split(' • ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Hover / Telemetry Card */}
          <aside className="relative z-20 m-4 mt-72 md:m-0 md:absolute md:bottom-6 md:right-6 w-auto md:w-full max-w-sm bg-surface-card rounded-2xl border border-outline-variant p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="font-label text-xs font-semibold text-tidal-teal">{currentSite.state}</span>
                <h3 className="font-title text-base sm:text-lg font-bold text-on-surface leading-snug mt-0.5">{currentSite.name}</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container shrink-0 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-living-leaf" aria-hidden="true" />
                <span>Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-surface-container-low rounded-xl p-2.5">
                <span className="font-label text-[11px] text-botanical-muted block">Area</span>
                <span className="font-title text-sm font-bold text-on-surface tabular-nums">{currentSite.area}</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-2.5">
                <span className="font-label text-[11px] text-botanical-muted block">Canopy Health</span>
                <span className="font-title text-sm font-bold text-primary tabular-nums">{currentSite.ndvi}</span>
              </div>
              <div className="col-span-2 bg-surface-container-low rounded-xl p-2.5">
                <span className="font-label text-[11px] text-botanical-muted block">Ecosystem</span>
                <span className="font-body text-xs font-medium text-on-surface">{currentSite.eco}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs py-2 border-t border-outline-variant/60 mb-4">
              <div>
                <span className="font-label text-[11px] text-botanical-muted block">Total BLU Minted</span>
                <span className="font-mono text-xs font-semibold text-on-surface tabular-nums">{currentSite.blu}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rhizome-earth-container text-on-rhizome-earth-container shrink-0 text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  lock
                </span>
                <span>20% Buffer</span>
              </span>
            </div>

            <Link
              href={`/projects/${currentSite.projectId}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-deep-canopy transition-all font-semibold text-xs shadow-sm"
            >
              <span>Open MRV Telemetry</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                open_in_new
              </span>
            </Link>
          </aside>
        </div>
      </section>

      {/* Nature & Mangrove Ecosystem Showcase Section */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <span>COASTAL HABITAT RESTORATION</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface">
            India&apos;s High-Yield Blue Carbon Sinks
          </h2>
          <p className="font-body text-sm sm:text-base text-botanical-muted">
            Mangroves, seagrasses, and salt marshes sequester carbon up to 10x faster than tropical rainforests,
            storing biomass in deep anaerobic sediments for centuries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mangroves */}
          <div className="bg-surface-card rounded-2xl border border-outline-variant/60 overflow-hidden shadow-[0_4px_20px_rgba(27,56,43,0.04)] hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="relative h-48 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1618245318763-a15176d00133?auto=format&fit=crop&w=800&q=80"
                alt="Mangrove forest stilt roots in tidal waters"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-deep-canopy/90 backdrop-blur-md text-on-deep-canopy text-xs font-semibold">
                Estuarine Mangroves
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Rhizophora &amp; Avicennia Canopies</h3>
                <p className="font-body text-xs sm:text-sm text-botanical-muted mt-2 leading-relaxed">
                  Sundarbans (WB) and Pichavaram (TN). Dense prop and stilt root architectures trap organic runoff,
                  building immense subterranean carbon stocks across active intertidal zones.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs">
                <span className="font-label text-botanical-muted">Density</span>
                <span className="font-semibold text-primary">~400–1,000 tCO2e / ha</span>
              </div>
            </div>
          </div>

          {/* Card 2: Seagrass */}
          <div className="bg-surface-card rounded-2xl border border-outline-variant/60 overflow-hidden shadow-[0_4px_20px_rgba(27,56,43,0.04)] hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="relative h-48 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
                alt="Underwater sunlit seagrass meadows"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-tidal-teal/90 backdrop-blur-md text-on-tidal-teal text-xs font-semibold">
                Submerged Meadows
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Cymodocea &amp; Halophila Beds</h3>
                <p className="font-body text-xs sm:text-sm text-botanical-muted mt-2 leading-relaxed">
                  Gulf of Mannar and Palk Bay (TN). Marine flowering plants creating underwater prairies that continuously
                  bind particulate organic carbon with negligible decomposition rates.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs">
                <span className="font-label text-botanical-muted">Density</span>
                <span className="font-semibold text-tidal-teal">~150–500 tCO2e / ha</span>
              </div>
            </div>
          </div>

          {/* Card 3: Salt Marsh */}
          <div className="bg-surface-card rounded-2xl border border-outline-variant/60 overflow-hidden shadow-[0_4px_20px_rgba(27,56,43,0.04)] hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="relative h-48 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                alt="Coastal intertidal salt marsh wetland"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rhizome-earth/90 backdrop-blur-md text-on-rhizome-earth text-xs font-semibold">
                Intertidal Wetlands
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Bhitarkanika &amp; Kutch Marshes</h3>
                <p className="font-body text-xs sm:text-sm text-botanical-muted mt-2 leading-relaxed">
                  Odisha and Gujarat estuaries. Halophytic flora buffering coastal shorelines against cyclone surges,
                  accreting soil carbon layers synchronously with sea-level rises.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs">
                <span className="font-label text-botanical-muted">Density</span>
                <span className="font-semibold text-rhizome-earth">~200–600 tCO2e / ha</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
