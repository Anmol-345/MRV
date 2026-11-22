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
    <main id="top" className="flex-1">
      {/* Hero Section from Stitch */}
      <section className="relative bg-deep-canopy text-on-deep-canopy overflow-hidden">
        {/* Aerial View of Sundarbans Mangrove Canals */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida/ALJJyrDcMxFTZrx9jRQJYtEOIa04dKI69lE9xY9LUe2fcR3MFRbeJCHetbnRRMWpHK719l7OTJnklygZviRxhhWSf_zj-_eBYlvZDlN-tdGeYs34r_XuuJFKvFgGv_dgnE0d2OqY4ukxFrK1a0DfgAR4xa7PHGpeJy5RXNDRmSa4ZGrEjBITfhO9TOSE1GnZ6UB73AHsIMrewt8QtUQ3yuoX26kdA40x_fl0zxIaCg1JF2rcb-eynmuDonCF9H2z7tA2jBg"
          alt="Aerial view of Sundarbans mangrove forest canals winding through brackish estuary water"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-deep-canopy/70" aria-hidden="true" />

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

        <div className="relative max-w-[1280px] mx-auto px-gutter-md sm:px-gutter-xl pt-section pb-24">
          <div className="max-w-3xl flex flex-col gap-gutter-lg">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20">
              <span className="material-symbols-outlined text-[16px] text-shoot-lime" aria-hidden="true">
                satellite_alt
              </span>
              <span className="font-label text-label-md text-on-deep-canopy">
                Sentinel-2 L2A &amp; Vara Network Telemetry Live
              </span>
            </div>

            <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-deep-canopy text-balance">
              Verifiable Blue Carbon from India&apos;s Tidal Frontiers.
            </h1>

            <p className="font-body text-body-lg text-on-deep-canopy/85 text-pretty max-w-2xl">
              High-resolution Sentinel-2 satellite MRV and multi-pool carbon accounting on Vara Network.
              Empowering coastal panchayats from the Sundarbans to Pichavaram.
            </p>

            <div className="flex flex-wrap items-center gap-gutter-md pt-gutter-xs">
              <Link
                href="/projects/1"
                className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded-md bg-shoot-lime text-on-shoot-lime hover:bg-living-leaf-container transition-colors duration-state-change font-label text-label-lg shadow-sm"
              >
                <span>Explore Sundarbans MRV</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/market"
                className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded-md bg-surface-card/10 backdrop-blur-md text-on-deep-canopy border border-on-deep-canopy/25 hover:bg-surface-card/20 transition-colors duration-state-change font-label text-label-lg"
              >
                <span>Retire Blue Carbon Credits</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live KPI Stat Strip (4 Floating Pebble Cards) */}
      <section id="projects" className="max-w-[1280px] mx-auto px-gutter-md sm:px-gutter-xl -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg items-stretch">
          {/* KPI 1 */}
          <article className="bg-surface-card text-on-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col justify-between gap-gutter-sm h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">
                forest
              </span>
              <span className="font-label text-label-sm px-2.5 py-0.5 rounded-full bg-living-leaf-container text-on-living-leaf-container">
                +12.4% YoY
              </span>
            </div>
            <div>
              <p className="font-headline text-headline-lg text-on-surface tabular-nums">
                {stats.totalAreaHa.toLocaleString()} ha
              </p>
              <p className="font-body text-body-md text-botanical-muted">Mangrove &amp; Seagrass Conserved</p>
            </div>
          </article>

          {/* KPI 2 */}
          <article className="bg-surface-card text-on-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col justify-between gap-gutter-sm h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[22px] text-tidal-teal" aria-hidden="true">
                co2
              </span>
              <span className="font-label text-label-sm px-2.5 py-0.5 rounded-full bg-tidal-teal-container text-on-tidal-teal-container">
                3-Pool Verified
              </span>
            </div>
            <div>
              <p className="font-headline text-headline-lg text-on-surface tabular-nums">
                {stats.totalMintedBlu.toLocaleString()}
              </p>
              <p className="font-body text-body-md text-botanical-muted">tCO2e Net Carbon Sequestered</p>
            </div>
          </article>

          {/* KPI 3 */}
          <article className="bg-surface-card text-on-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col justify-between gap-gutter-sm h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[22px] text-rhizome-earth" aria-hidden="true">
                diversity_3
              </span>
              <span className="font-label text-label-sm px-2.5 py-0.5 rounded-full bg-rhizome-earth-container text-on-rhizome-earth-container">
                42 Panchayats
              </span>
            </div>
            <div>
              <p className="font-headline text-headline-lg text-on-surface tabular-nums">
                ₹{stats.communityRevenueCr} Cr
              </p>
              <p className="font-body text-body-md text-botanical-muted">Revenue to Coastal Communities</p>
            </div>
          </article>

          {/* KPI 4 */}
          <article className="bg-surface-card text-on-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col justify-between gap-gutter-sm h-full">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-[22px] text-living-leaf" aria-hidden="true">
                verified_user
              </span>
              <span className="font-label text-label-sm px-2.5 py-0.5 rounded-full bg-living-leaf-container text-on-living-leaf-container">
                Vara Quorum
              </span>
            </div>
            <div>
              <p className="font-headline text-headline-lg text-on-surface tabular-nums">{stats.quorumRate}</p>
              <p className="font-body text-body-md text-botanical-muted">Multi-Org Verifier Consensus Rate</p>
            </div>
          </article>
        </div>
      </section>

      {/* Interactive Coastal Map View from Stitch */}
      <section id="satellite-map" className="max-w-[1280px] mx-auto px-gutter-md sm:px-gutter-xl py-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter-md mb-gutter-lg">
          <div>
            <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface mb-gutter-xs">
              National Coastal Blue Carbon Registry
            </h2>
            <p className="font-body text-body-md text-botanical-muted max-w-2xl">
              Click any active estuarine polygon on the bathymetry layer to inspect Sentinel-2 canopy health,
              minted BLU supply, and permanence buffer locks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card border border-outline-variant/60">
              <span className="w-2.5 h-2.5 rounded-full bg-shoot-lime" aria-hidden="true" />
              <span className="font-label text-label-sm text-on-surface">Mangrove Canopy</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card border border-outline-variant/60">
              <span className="w-2.5 h-2.5 rounded-full bg-tidal-teal" aria-hidden="true" />
              <span className="font-label text-label-sm text-on-surface">Seagrass Meadow</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card border border-outline-variant/60">
              <span className="w-2.5 h-2.5 rounded-full bg-rhizome-earth" aria-hidden="true" />
              <span className="font-label text-label-sm text-on-surface">Salt Marsh</span>
            </span>
          </div>
        </div>

        {/* Full-Width Interactive Map Module */}
        <div className="relative rounded-xl overflow-hidden border border-outline-variant/80 shadow-[0_4px_20px_rgba(27,56,43,0.06)] bg-deep-canopy min-h-[540px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida/ALJJyrDnp2wXEHhsEqEIgkdVRShjtdR2_wc7SqYfj3RnyfppBEUvqjPVtlz9jdZaIhhqAhVGOd8Ltx5Q4RZJ6jtidwuR5VA6VNJh1VzFv2SmKOBX_qpnD93MglZzXCXJh-HWyu_Bskt2ZB_MWBAudm6gcB2BczKFnT9PmvLDuPfjvaXXTqLpntVyZKvY9Fv-o6BO-sKxhdtlH8Zc70auIMCS-929llYjMTrh1dcAvxU7AZQm6Mx4Kc1PL-PQoaFyg7csn7-BeBI"
            alt="Satellite bathymetry map of India's eastern and southern coastline"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-deep-canopy/25" aria-hidden="true" />

          {/* SVG Polygon Overlays & Interactive Site Pins */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice">
            {/* Sundarbans Polygon (West Bengal - Top Right) */}
            <polygon
              points="790,110 855,98 882,135 832,162 782,144"
              fill="rgba(143, 184, 85, 0.35)"
              stroke="#8FB855"
              strokeWidth="2.5"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('sundarbans')}
            />
            {/* Bhitarkanika Polygon (Odisha - Mid Right) */}
            <polygon
              points="712,205 748,195 762,228 725,242"
              fill="rgba(130, 98, 68, 0.4)"
              stroke="#F3ECE5"
              strokeWidth="2"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('bhitarkanika')}
            />
            {/* Pichavaram Polygon (Tamil Nadu - Lower Center) */}
            <polygon
              points="548,362 580,354 592,385 556,396"
              fill="rgba(93, 147, 68, 0.4)"
              stroke="#8FB855"
              strokeWidth="2"
              className="cursor-pointer hover:fill-opacity-50 transition-all"
              onClick={() => setSelectedSiteKey('pichavaram')}
            />
            {/* Gulf of Mannar Seagrass Polygon (Tamil Nadu South) */}
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
            className={`absolute z-10 top-[19%] left-[67%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors duration-state-change ${
              selectedSiteKey === 'sundarbans'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-shoot-lime" aria-hidden="true" />
            <span className="font-label text-label-sm">Sundarbans (WB)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSiteKey('bhitarkanika')}
            className={`absolute z-10 top-[37%] left-[59%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors duration-state-change ${
              selectedSiteKey === 'bhitarkanika'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rhizome-earth" aria-hidden="true" />
            <span className="font-label text-label-sm">Bhitarkanika (OD)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSiteKey('pichavaram')}
            className={`absolute z-10 top-[66%] left-[46%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors duration-state-change ${
              selectedSiteKey === 'pichavaram'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-living-leaf" aria-hidden="true" />
            <span className="font-label text-label-sm">Pichavaram (TN)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSiteKey('mannar')}
            className={`absolute z-10 top-[81%] left-[42%] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-colors duration-state-change ${
              selectedSiteKey === 'mannar'
                ? 'bg-deep-canopy text-on-deep-canopy border-shoot-lime ring-2 ring-shoot-lime/40'
                : 'bg-surface-card text-on-surface border-outline-variant hover:bg-primary-container'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-tidal-teal" aria-hidden="true" />
            <span className="font-label text-label-sm">Gulf of Mannar (TN)</span>
          </button>

          {/* Left Site Selector List */}
          <div className="hidden md:flex z-20 flex-col gap-2 absolute top-6 left-6 w-72 bg-surface-card/95 backdrop-blur-md rounded-xl p-4 border border-outline-variant/70 shadow-lg">
            <span className="font-label text-label-sm text-botanical-muted uppercase tracking-wider">
              Registered Sanctuaries (4)
            </span>
            {Object.entries(SITES).map(([key, site]) => {
              const isActive = selectedSiteKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSiteKey(key)}
                  className={`text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="font-label text-label-md truncate pr-2">{site.name}</span>
                  <span className="font-mono text-mono-sm text-botanical-muted">{site.state.split(' • ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Hover / Telemetry Card */}
          <aside className="relative z-20 m-4 mt-72 md:m-0 md:absolute md:bottom-6 md:right-6 w-auto md:w-full max-w-sm bg-surface-card rounded-xl border border-outline-variant p-gutter-lg shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-gutter-md">
              <div>
                <span className="font-label text-label-sm text-tidal-teal">{currentSite.state}</span>
                <h3 className="font-title text-title-lg text-on-surface leading-tight mt-0.5">{currentSite.name}</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container shrink-0">
                <span className="w-2 h-2 rounded-full bg-living-leaf" aria-hidden="true" />
                <span className="font-label text-label-sm">Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-gutter-md">
              <div className="bg-surface-container-low rounded-md p-2.5">
                <span className="font-label text-label-sm text-botanical-muted block">Area</span>
                <span className="font-title text-title-md text-on-surface tabular-nums">{currentSite.area}</span>
              </div>
              <div className="bg-surface-container-low rounded-md p-2.5">
                <span className="font-label text-label-sm text-botanical-muted block">Canopy Health</span>
                <span className="font-title text-title-md text-primary tabular-nums">{currentSite.ndvi}</span>
              </div>
              <div className="col-span-2 bg-surface-container-low rounded-md p-2.5">
                <span className="font-label text-label-sm text-botanical-muted block">Ecosystem</span>
                <span className="font-body text-body-md text-on-surface">{currentSite.eco}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-body-md py-2 border-t border-outline-variant/60 mb-gutter-md">
              <div>
                <span className="font-label text-label-sm text-botanical-muted block">Total BLU Minted</span>
                <span className="font-mono text-mono-md text-on-surface tabular-nums">{currentSite.blu}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rhizome-earth-container text-on-rhizome-earth-container shrink-0">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  lock
                </span>
                <span className="font-label text-label-sm">20% Buffer</span>
              </span>
            </div>

            <Link
              href={`/projects/${currentSite.projectId}`}
              className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded-md bg-primary text-on-primary hover:bg-deep-canopy transition-colors duration-state-change font-label text-label-lg"
            >
              <span>Open MRV Telemetry</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                open_in_new
              </span>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
