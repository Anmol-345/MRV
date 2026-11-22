'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sliderPos, setSliderPos] = useState<number>(52);
  const [copied, setCopied] = useState(false);

  const copyCid = () => {
    navigator.clipboard?.writeText('bafybeigdyrzt5sfp7udm7hu9k3v6x2p8n4q1r7s5m9y0z');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main id="telemetry" className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Breadcrumb from Stitch */}
      <div className="flex items-center gap-2 text-botanical-muted">
        <Link href="/projects" className="hover:text-primary transition-colors font-label text-label-md">
          National Registry
        </Link>
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          chevron_right
        </span>
        <span className="font-mono text-mono-md text-on-surface">
          /projects/{id === '1' ? 'sundarbans' : id}
        </span>
      </div>

      {/* Project Header Card with Nature Backdrop */}
      <section className="relative rounded-2xl overflow-hidden bg-surface-card border border-outline-variant/60 shadow-[0_4px_20px_rgba(27,56,43,0.04)]">
        {/* Subtle Mangrove Nature Accent Banner */}
        <div className="relative h-32 sm:h-40 overflow-hidden bg-deep-canopy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1600&q=80"
            alt="Sundarbans mangrove coastal canopy"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-deep-canopy/40 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-tidal-teal-container text-on-tidal-teal-container border border-tidal-teal/20 font-label text-label-sm font-semibold">
                  Mangrove - Rhizophora &amp; Avicennia
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/60 font-label text-label-sm font-semibold">
                  State: WB
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container border border-living-leaf/25 font-label text-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-living-leaf" aria-hidden="true" />
                  <span>Status: Active</span>
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-botanical-muted border border-outline-variant/60 font-mono text-mono-sm">
                  ID: #{id === '1' ? '1042' : id}
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface text-balance">
                Sundarbans Delta Zone A-4 Mangrove Restoration Project
              </h1>
            </div>

            <Link
              href="/market"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary hover:bg-deep-canopy transition-all shrink-0 font-label text-label-lg shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                eco
              </span>
              <span>Retire Zone A-4 Credits</span>
            </Link>
          </div>

          {/* Beneficiary Distribution Strip */}
          <div className="pt-4 border-t border-outline-variant/50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label text-label-md font-semibold text-on-surface">On-Chain Panchayat &amp; Co-op Revenue Split</span>
              <span className="font-mono text-mono-sm text-botanical-muted">Automated Smart Contract Split (100%)</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 bg-surface-container">
              <div className="h-full bg-primary w-[45%]" title="Mouli Honey Collector Co-op (45%)" />
              <div className="h-full bg-tidal-teal w-[35%]" title="Gosaba Forest Protection Samiti (35%)" />
              <div className="h-full bg-rhizome-earth w-[20%]" title="Community Buffer Reserve (20%)" />
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" aria-hidden="true" />
                <span className="font-body text-on-surface font-medium">Mouli Honey Collector Co-op (45%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tidal-teal" aria-hidden="true" />
                <span className="font-body text-on-surface font-medium">Gosaba Forest Protection Samiti (35%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rhizome-earth" aria-hidden="true" />
                <span className="font-body text-on-surface font-medium">Community Buffer Reserve (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Main Telemetry Grid: Left 60% (7 cols), Right 40% (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Satellite & Telemetry Console */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Before/After Multispectral Slider from Stitch */}
          <article className="bg-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">Multispectral Canopy Comparison</h2>
                <p className="font-body text-xs sm:text-sm text-botanical-muted">Baseline Landsat-8 (2020) vs Sentinel-2 L2A (Q3 2026)</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  compare
                </span>
                <span className="font-label text-label-sm font-semibold">+142% Canopy Density</span>
              </span>
            </div>

            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-outline-variant/70 select-none bg-deep-canopy">
              {/* After Image (2026 Sentinel-2) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1200&q=80"
                alt="Sentinel-2 2026 restored dense mangrove canopy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Before Image (2020 Landsat) clipped */}
              <div
                id="before-layer"
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                  alt="Landsat 2020 baseline degraded mudflat"
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90"
                />
              </div>
              {/* Vertical Divider Line */}
              <div
                id="slider-divider"
                className="absolute top-0 bottom-0 w-0.5 bg-surface-card shadow-md pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-card text-deep-canopy shadow-lg flex items-center justify-center border border-outline-variant">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    drag_indicator
                  </span>
                </div>
              </div>
              {/* Overlay Labels */}
              <span className="font-mono text-mono-sm absolute top-3 left-3 px-2.5 py-1 rounded-full bg-deep-canopy/85 backdrop-blur-md text-on-deep-canopy border border-on-deep-canopy/20">
                Landsat Baseline • 2020
              </span>
              <span className="font-mono text-mono-sm absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-md text-on-primary border border-on-primary/20">
                Sentinel-2 • Q3 2026
              </span>

              <input
                id="multispectral-range"
                type="range"
                min="10"
                max="90"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="Compare 2020 baseline and 2026 Sentinel-2 satellite imagery"
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          </article>

          {/* Interactive NDVI & Soil Salinity Chart */}
          <article className="bg-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col gap-gutter-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-headline text-headline-md text-on-surface">NDVI &amp; Tidal Soil Salinity (24 Months)</h2>
                <p className="font-body text-body-md text-botanical-muted">Dual-axis telemetry from Sentinel-2 NIR band &amp; IoT piezometers</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-living-leaf" aria-hidden="true" />
                  <span className="font-label text-label-sm text-on-surface">NDVI (0.78)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-tidal-teal" aria-hidden="true" />
                  <span className="font-label text-label-sm text-on-surface">Salinity (24.2 ppt)</span>
                </span>
              </div>
            </div>

            {/* Clean Dual-Axis SVG Chart from Stitch */}
            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/50">
              <svg viewBox="0 0 640 200" className="w-full h-48 overflow-visible" aria-label="24-month NDVI and Soil Salinity chart">
                <line x1="40" y1="30" x2="600" y2="30" stroke="#D5DFD8" strokeDasharray="4 4" />
                <line x1="40" y1="80" x2="600" y2="80" stroke="#D5DFD8" strokeDasharray="4 4" />
                <line x1="40" y1="130" x2="600" y2="130" stroke="#D5DFD8" strokeDasharray="4 4" />
                <line x1="40" y1="170" x2="600" y2="170" stroke="#8B9B91" />

                <text x="8" y="34" fill="#5D9344" fontFamily="JetBrains Mono" fontSize="10">0.85</text>
                <text x="8" y="84" fill="#5D9344" fontFamily="JetBrains Mono" fontSize="10">0.60</text>
                <text x="8" y="134" fill="#5D9344" fontFamily="JetBrains Mono" fontSize="10">0.35</text>

                <text x="606" y="34" fill="#1F6F78" fontFamily="JetBrains Mono" fontSize="10">32 ppt</text>
                <text x="606" y="84" fill="#1F6F78" fontFamily="JetBrains Mono" fontSize="10">24 ppt</text>
                <text x="606" y="134" fill="#1F6F78" fontFamily="JetBrains Mono" fontSize="10">16 ppt</text>

                <path
                  d="M40 142 C120 130, 180 118, 260 95 C340 72, 420 62, 500 48 C540 42, 575 38, 600 36 L600 170 L40 170 Z"
                  fill="rgba(93, 147, 68, 0.14)"
                />
                <path
                  d="M40 142 C120 130, 180 118, 260 95 C340 72, 420 62, 500 48 C540 42, 575 38, 600 36"
                  fill="none"
                  stroke="#5D9344"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M40 72 C120 96, 200 110, 280 82 C360 56, 440 105, 520 88 C560 80, 580 76, 600 78"
                  fill="none"
                  stroke="#1F6F78"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />

                <circle cx="600" cy="36" r="5" fill="#5D9344" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="600" cy="78" r="4.5" fill="#1F6F78" stroke="#FFFFFF" strokeWidth="2" />

                <text x="40" y="190" fill="#586B60" fontFamily="JetBrains Mono" fontSize="10">Jul 2024</text>
                <text x="210" y="190" fill="#586B60" fontFamily="JetBrains Mono" fontSize="10">Jan 2025</text>
                <text x="390" y="190" fill="#586B60" fontFamily="JetBrains Mono" fontSize="10">Jan 2026</text>
                <text x="555" y="190" fill="#586B60" fontFamily="JetBrains Mono" fontSize="10">Jun 2026</text>
              </svg>
            </div>
          </article>

          {/* Multi-Pool Carbon Accounting */}
          <article className="bg-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col gap-gutter-md">
            <div>
              <h2 className="font-headline text-headline-md text-on-surface">Multi-Pool Carbon Accounting</h2>
              <p className="font-body text-body-md text-botanical-muted">Verified sequestration distribution across coastal biomass &amp; sediment</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter-md">
              <div className="bg-surface-container-low rounded-lg p-gutter-md border border-outline-variant/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label text-label-sm text-primary">AGB</span>
                  <span className="font-headline text-headline-md text-on-surface tabular-nums">42%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary w-[42%] rounded-full" />
                </div>
                <span className="font-body text-body-md text-botanical-muted">Above-Ground Biomass</span>
              </div>

              <div className="bg-surface-container-low rounded-lg p-gutter-md border border-outline-variant/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label text-label-sm text-tidal-teal">BGB</span>
                  <span className="font-headline text-headline-md text-on-surface tabular-nums">28%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-tidal-teal w-[28%] rounded-full" />
                </div>
                <span className="font-body text-body-md text-botanical-muted">Below-Ground Biomass (Roots)</span>
              </div>

              <div className="bg-surface-container-low rounded-lg p-gutter-md border border-outline-variant/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label text-label-sm text-rhizome-earth">SOC</span>
                  <span className="font-headline text-headline-md text-on-surface tabular-nums">30%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-rhizome-earth w-[30%] rounded-full" />
                </div>
                <span className="font-body text-body-md text-botanical-muted">Soil Organic Carbon (0–100cm)</span>
              </div>
            </div>
          </article>

          {/* Field MRV & Drone Orthomosaic Gallery */}
          <article className="bg-surface-card rounded-2xl border border-outline-variant/60 p-6 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface">Field MRV &amp; Drone Orthomosaic Plots</h2>
                <p className="font-body text-xs text-botanical-muted">High-resolution ground truth validation images from Sundarbans Sector A-4</p>
              </div>
              <span className="font-mono text-xs text-primary font-semibold px-2.5 py-1 rounded-full bg-primary-container">
                3 Field Stations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="group rounded-xl overflow-hidden border border-outline-variant/60 bg-deep-canopy flex flex-col">
                <div className="relative h-28 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1618245318763-a15176d00133?auto=format&fit=crop&w=600&q=80"
                    alt="Rhizophora prop root density plot"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-deep-canopy/80 backdrop-blur-md text-[10px] font-semibold text-shoot-lime">
                    Plot A-4.1
                  </span>
                </div>
                <div className="p-2.5 bg-surface-card flex-1">
                  <span className="font-title text-xs font-semibold text-on-surface block">Stilt Root Density</span>
                  <span className="font-mono text-[11px] text-botanical-muted block">8.4 roots / m²</span>
                </div>
              </div>

              <div className="group rounded-xl overflow-hidden border border-outline-variant/60 bg-deep-canopy flex flex-col">
                <div className="relative h-28 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=600&q=80"
                    alt="Tidal creek hydrology channel"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-deep-canopy/80 backdrop-blur-md text-[10px] font-semibold text-tidal-teal">
                    Plot A-4.2
                  </span>
                </div>
                <div className="p-2.5 bg-surface-card flex-1">
                  <span className="font-title text-xs font-semibold text-on-surface block">Intertidal Creek Flow</span>
                  <span className="font-mono text-[11px] text-botanical-muted block">24.2 ppt Salinity</span>
                </div>
              </div>

              <div className="group rounded-xl overflow-hidden border border-outline-variant/60 bg-deep-canopy flex flex-col">
                <div className="relative h-28 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"
                    alt="Sentinel-2 L2A orbital multispectral frame"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-deep-canopy/80 backdrop-blur-md text-[10px] font-semibold text-shoot-lime">
                    Sentinel-2 L2A
                  </span>
                </div>
                <div className="p-2.5 bg-surface-card flex-1">
                  <span className="font-title text-xs font-semibold text-on-surface block">NIR &amp; RedEdge Band</span>
                  <span className="font-mono text-[11px] text-botanical-muted block">10m Ground Resolution</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Right Column: On-Chain MRV Verification Queue */}
        <aside id="quorum" className="lg:col-span-5 flex flex-col gap-gutter-lg">
          <article className="bg-surface-card rounded-xl border border-outline-variant/60 p-gutter-lg shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col gap-gutter-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-label text-label-sm text-tidal-teal uppercase tracking-wider">Latest MRV Report</span>
                <h2 className="font-headline text-headline-md text-on-surface">Period Jan 2026 – Jun 2026</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container font-label text-label-sm">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  verified
                </span>
                <span>Finalized</span>
              </span>
            </div>

            {/* Cryptographic Data CID */}
            <div className="bg-surface-container-low rounded-lg p-gutter-md border border-outline-variant/60 flex flex-col gap-2">
              <span className="font-label text-label-sm text-botanical-muted">Cryptographic Data CID (IPFS / Filecoin)</span>
              <div className="flex items-center justify-between gap-2 bg-surface-card rounded-md px-3 py-2 border border-outline-variant/60">
                <code className="font-mono text-mono-md text-tidal-teal truncate">
                  bafybeigdyrzt5sfp7udm7hu9k3v6x2p8n4q1r7s5m9y0z
                </code>
                <button
                  type="button"
                  onClick={copyCid}
                  aria-label="Copy IPFS CID"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-container-low hover:bg-primary-container text-on-surface transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    content_copy
                  </span>
                  <span className="font-label text-label-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Multi-Org Verifier Quorum Meter */}
            <div className="flex flex-col gap-gutter-md">
              <div className="flex items-center justify-between">
                <h3 className="font-title text-title-md text-on-surface">Multi-Org Verifier Quorum Meter</h3>
                <span className="font-mono text-mono-md text-primary tabular-nums">2 / 2 Signatures</span>
              </div>

              {/* Quorum Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden flex">
                <div className="h-full bg-living-leaf w-full rounded-full" />
              </div>

              {/* Verifier 1 */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      science
                    </span>
                  </div>
                  <div>
                    <p className="font-title text-title-md text-on-surface">Wildlife Institute of India (Org 1)</p>
                    <p className="font-mono text-mono-sm text-botanical-muted">Signed 14 Jun 2026 • 0x91a...3f8c</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container shrink-0 font-label text-label-sm">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    check_circle
                  </span>
                  <span>Approved</span>
                </span>
              </div>

              {/* Verifier 2 */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tidal-teal-container text-on-tidal-teal-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      waves
                    </span>
                  </div>
                  <div>
                    <p className="font-title text-title-md text-on-surface">
                      National Centre for Sustainable Coastal Management (Org 2)
                    </p>
                    <p className="font-mono text-mono-sm text-botanical-muted">Signed 16 Jun 2026 • 0x44c...9d12</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-living-leaf-container text-on-living-leaf-container shrink-0 font-label text-label-sm">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    check_circle
                  </span>
                  <span>Approved</span>
                </span>
              </div>
            </div>

            {/* Quorum Status Summary Banner */}
            <div className="rounded-lg bg-deep-canopy text-on-deep-canopy p-gutter-md flex items-start gap-3">
              <span className="material-symbols-outlined text-[22px] text-shoot-lime shrink-0 mt-0.5" aria-hidden="true">
                token
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-label text-label-md text-shoot-lime">Quorum Status</span>
                <p className="font-body text-body-md text-on-deep-canopy tabular-nums">
                  2/2 Verified • 1,250 BLU Minted to Registry • 250 BLU into Permanence Buffer
                </p>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </main>
  );
}
