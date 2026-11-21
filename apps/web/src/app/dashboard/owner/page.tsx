'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trees,
  Plus,
  FileCheck,
  ShoppingCart,
  TrendingUp,
  MapPin,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { EcosystemBadge } from '@/components/ui/ecosystem-badge';
import { formatBlu, formatNumber } from '@/lib/formatters';

export default function OwnerDashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.projects) {
          setProjects(data.projects);
        } else {
          setProjects([
            {
              id: '1',
              name: 'Sundarbans Delta Mangrove Conservation',
              ecosystem: 'Mangrove',
              stateCode: 'WB',
              areaHa: 1000,
              totalMintedBlu: 4000,
              totalRetiredBlu: 200,
              bufferHeldMilli: '1000000',
              status: 'Active',
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProjects([
          {
            id: '1',
            name: 'Sundarbans Delta Mangrove Conservation',
            ecosystem: 'Mangrove',
            stateCode: 'WB',
            areaHa: 1000,
            totalMintedBlu: 4000,
            totalRetiredBlu: 200,
            bufferHeldMilli: '1000000',
            status: 'Active',
          },
        ]);
        setLoading(false);
      });
  }, []);

  const totalArea = projects.reduce((sum, p) => sum + (p.areaHa || 0), 0);
  const totalMinted = projects.reduce((sum, p) => sum + (p.totalMintedBlu || 0), 0);

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
              <Trees className="w-3.5 h-3.5" />
              <span>Project Developer Portal</span>
            </div>
            <h1 className="text-3xl font-serif font-black text-ink">My Restoration Projects</h1>
            <p className="text-xs sm:text-sm text-muted">
              Manage blue carbon restoration sites, submit periodic MRV reports, and issue marketplace listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/owner/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Project</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Managed Area"
            value={formatNumber(totalArea)}
            unit="hectares"
          />
          <StatCard
            title="Credits Minted"
            value={formatNumber(totalMinted)}
            unit="tCO2e"
            variant="forest"
          />
          <StatCard
            title="Active Projects"
            value={projects.length}
            unit="sites"
            variant="leaf"
          />
          <StatCard
            title="Revenue Pool"
            value="38,200"
            unit="VARA"
            variant="teal"
          />
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-ink">Registered Sites</h2>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-xs text-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-forest" />
              <span>Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-muted/20 space-y-3">
              <Trees className="w-10 h-10 text-muted mx-auto" />
              <h3 className="font-serif font-bold text-ink">No Registered Projects</h3>
              <p className="text-xs text-muted">
                You have not registered any restoration projects under this wallet.
              </p>
              <Link
                href="/dashboard/owner/projects/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Project</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-6 rounded-2xl border border-muted/20 shadow-sm hover:border-forest/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted">#{proj.id}</span>
                      <EcosystemBadge ecosystem={proj.ecosystem} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-mist text-ink">
                        {proj.stateCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-leaf/20 text-leaf">
                        {proj.status}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-ink">{proj.name}</h3>

                    <div className="text-xs text-muted flex flex-wrap items-center gap-x-5 gap-y-1">
                      <span>
                        Area: <strong className="text-ink">{proj.areaHa} ha</strong>
                      </span>
                      <span>
                        Minted: <strong className="text-forest">{proj.totalMintedBlu} tCO2e</strong>
                      </span>
                      <span>
                        Retired:{' '}
                        <strong className="text-teal">{proj.totalRetiredBlu || 0} tCO2e</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/owner/projects/${proj.id}/submit-report`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold transition-colors"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Submit MRV Report</span>
                    </Link>

                    <Link
                      href="/dashboard/owner/listings/new"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal/10 hover:bg-teal/20 text-teal text-xs font-semibold transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>List on Market</span>
                    </Link>

                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-mist hover:bg-mist/80 text-ink text-xs font-semibold transition-colors"
                    >
                      <span>View Site</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
