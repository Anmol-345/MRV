'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Waves,
  Trees,
  ShieldCheck,
  ArrowRight,
  MapPin,
  TrendingUp,
  Award,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { formatBlu, formatNumber } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';

interface StatsData {
  totalAreaHa: number;
  totalMintedBlu: number;
  totalRetiredBlu: number;
  activeProjectsCount: number;
  bufferHeldMilli: string;
  activeListingsCount: number;
}

export default function HomePage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<StatsData>({
    totalAreaHa: 1000,
    totalMintedBlu: 4000,
    totalRetiredBlu: 200,
    activeProjectsCount: 1,
    bufferHeldMilli: '1000000',
    activeListingsCount: 1,
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setStats(data);
        }
      })
      .catch(() => {
        // Fallback to default initial stats
      });
  }, []);

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-deep-green text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/80 border border-leaf/30 text-lime text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            {t.hero.title}
          </h1>

          <p className="text-base sm:text-lg text-mist/85 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-leaf hover:bg-leaf/90 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm"
            >
              <span>{t.hero.explore}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/market"
              className="inline-flex items-center gap-2 bg-forest hover:bg-forest/80 border border-leaf/40 text-mist font-medium px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              <span>{t.nav.market}</span>
            </Link>

            <Link
              href="/audit"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              <span>{t.nav.audit}</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-leaf/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Live Stats Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 w-full relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t.stats.totalArea}
            value={formatNumber(stats.totalAreaHa)}
            unit="ha"
            subtitle="Monitored coastal habitats"
            icon={<MapPin className="w-4 h-4 text-forest" />}
            variant="forest"
          />
          <StatCard
            title={t.stats.totalMinted}
            value={formatNumber(stats.totalMintedBlu)}
            unit="tCO2e"
            subtitle="1 BLU = 1 tonne CO2e"
            icon={<TrendingUp className="w-4 h-4 text-leaf" />}
            variant="leaf"
          />
          <StatCard
            title={t.stats.totalRetired}
            value={formatNumber(stats.totalRetiredBlu)}
            unit="tCO2e"
            subtitle="Permanent carbon offsets"
            icon={<Award className="w-4 h-4 text-teal" />}
            variant="teal"
          />
          <StatCard
            title={t.stats.activeProjects}
            value={stats.activeProjectsCount}
            subtitle="Verified coastal sites"
            icon={<Layers className="w-4 h-4 text-earth" />}
            variant="earth"
          />
        </div>
      </section>

      {/* Ecosystem Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-forest">
            India Coastal Habitats
          </div>
          <h2 className="text-3xl font-serif font-bold text-ink">{t.hero.targetEcosystems}</h2>
          <p className="text-sm text-muted">
            India hosts over 7,500 km of coastline with rich blue carbon ecosystems sequestering carbon up to 10x faster than terrestrial tropical rainforests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-muted/20 shadow-sm space-y-4 hover:border-forest/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">{t.ecosystem.Mangrove}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Sundarbans, Andaman &amp; Nicobar, Gujarat, and Pichavaram. Dense root matrices capture organic sediment and store biomass carbon in deep, anoxic soil layers for millennia.
              </p>
            </div>
            <div className="text-xs text-forest font-semibold pt-2 border-t border-muted/10">
              Avg. Carbon Density: ~400–1,000 tCO2e / ha
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-muted/20 shadow-sm space-y-4 hover:border-teal/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">{t.ecosystem.Seagrass}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Gulf of Mannar, Palk Bay, Lakshadweep, and Chilika. Submerged flowering plants creating sediment traps with continuous carbon burial and low decomposition rates.
              </p>
            </div>
            <div className="text-xs text-teal font-semibold pt-2 border-t border-muted/10">
              Avg. Carbon Density: ~150–500 tCO2e / ha
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-muted/20 shadow-sm space-y-4 hover:border-leaf/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center text-leaf">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">{t.ecosystem.SaltMarsh}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Gulf of Kutch, Khambhat, and estuarine intertidal marshes. Highly productive halophytic vegetation buffering shorelines from storms and rising sea levels.
              </p>
            </div>
            <div className="text-xs text-leaf font-semibold pt-2 border-t border-muted/10">
              Avg. Carbon Density: ~200–600 tCO2e / ha
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Architecture */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-muted/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-forest">Architecture</div>
            <h2 className="text-3xl font-serif font-bold text-ink">Built for Trust, Speed &amp; Integrity</h2>
            <p className="text-sm text-muted">
              Decentralized infrastructure connecting satellite telemetry directly to transparent, community-governed smart contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-2">
              <div className="font-serif font-bold text-lg text-ink">1. Vara Network &amp; Sails</div>
              <p className="text-xs text-muted leading-relaxed">
                Sub-second WASM program execution on Vara Network with formal state transition rules and integer-only financial and carbon accounting.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-serif font-bold text-lg text-ink">2. Decentralized MRV</div>
              <p className="text-xs text-muted leading-relaxed">
                Sentinel-2 earth observation composites, cloud-masking, and NDVI classification verified independently by certified scientific organizations before credit minting.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-serif font-bold text-lg text-ink">3. Pull-Payment Revenue Sharing</div>
              <p className="text-xs text-muted leading-relaxed">
                Accumulator-based smart contract revenue split guarantees transparent, pull-based revenue distribution directly to coastal community Gram Panchayats.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
