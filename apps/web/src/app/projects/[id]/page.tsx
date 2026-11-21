'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Trees,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Users,
  Activity,
  Tag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { EcosystemBadge } from '@/components/ui/ecosystem-badge';
import { StatCard } from '@/components/ui/stat-card';
import { ListingCard } from '@/components/market/listing-card';
import { formatBlu, formatNumber, truncateAddress, formatDate } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';

interface ProjectDetailData {
  id: string | bigint;
  name: string;
  ecosystem: string;
  stateCode: string;
  areaHa: number | string;
  status: string;
  totalMinted: string | bigint;
  totalRetired: string | bigint;
  bufferHeld: string | bigint;
  ownerWallet: string;
  boundaryCid: string;
  createdAt: string;
  description?: string | null;
  beneficiaries: Array<{
    id: number;
    wallet: string;
    shareBps: number;
    displayName?: string | null;
  }>;
  reports: Array<{
    id: string | bigint;
    status: string;
    periodStart: string | bigint;
    periodEnd: string | bigint;
    estimatedMilli: string | bigint;
    minted: string | bigint;
    buffered: string | bigint;
    methodologyVersion: string;
    dataCid: string;
    dataHash: string;
    votes: Array<{ verifierWallet: string; approve: boolean }>;
  }>;
  listings: Array<any>;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'observations' | 'listings'>('overview');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/projects/${id}/observations`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([projData, obsData]) => {
        if (projData && !projData.error) {
          setProject(projData);
        }
        if (Array.isArray(obsData)) {
          setObservations(obsData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin mx-auto" />
        <div className="text-xs text-muted font-medium">{t.common.loading}</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-earth mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-ink">Project Not Found</h1>
        <p className="text-xs text-muted">The requested project ID #{id} was not found on the registry.</p>
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline">
          <ArrowLeft className="w-4 h-4" /> {t.common.back}
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t.common.back}
        </Link>
      </div>

      {/* Project Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-muted/20 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <EcosystemBadge ecosystem={project.ecosystem} />
            <span className="text-xs font-semibold text-muted bg-mist px-2.5 py-1 rounded-full">
              State: {project.stateCode}
            </span>
            <span className="text-xs font-semibold text-forest bg-forest/10 px-2.5 py-1 rounded-full">
              Project #{id}
            </span>
          </div>

          <div className="text-xs font-mono text-muted flex items-center gap-1 bg-mist/60 px-3 py-1 rounded-lg">
            <span>Developer:</span>
            <span className="text-ink font-semibold">{truncateAddress(project.ownerWallet, 6)}</span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
            {project.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-2 max-w-3xl leading-relaxed">
            {project.description ||
              `A high-integrity blue carbon conservation project protecting intertidal coastal wetlands in ${project.stateCode}, India. Incorporates continuous satellite MRV monitoring and community benefit distribution.`}
          </p>
        </div>

        {/* Boundary CID */}
        {project.boundaryCid && (
          <div className="flex items-center gap-2 text-xs text-muted pt-2 border-t border-muted/10">
            <span className="font-semibold text-ink">Boundary GeoJSON:</span>
            <span className="font-mono bg-mist px-2 py-0.5 rounded text-[11px] truncate max-w-xs">
              {project.boundaryCid}
            </span>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.common.area}
          value={formatNumber(project.areaHa)}
          unit="ha"
          subtitle="Protected intertidal zone"
          icon={<MapPin className="w-4 h-4 text-forest" />}
          variant="forest"
        />
        <StatCard
          title="Minted BLU"
          value={formatBlu(project.totalMinted)}
          unit="BLU"
          subtitle="Verified carbon credits"
          icon={<ShieldCheck className="w-4 h-4 text-leaf" />}
          variant="leaf"
        />
        <StatCard
          title="Retired BLU"
          value={formatBlu(project.totalRetired)}
          unit="BLU"
          subtitle="Permanently offset"
          icon={<Activity className="w-4 h-4 text-teal" />}
          variant="teal"
        />
        <StatCard
          title="Buffer Reserve"
          value={formatBlu(project.bufferHeld)}
          unit="BLU"
          subtitle="20% permanence reserve"
          icon={<Layers className="w-4 h-4 text-earth" />}
          variant="earth"
        />
      </div>

      {/* Tabbed Navigation */}
      <div className="space-y-6">
        <div className="border-b border-muted/20 flex gap-2 sm:gap-6 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'border-forest text-forest'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community Beneficiaries ({project.beneficiaries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reports'
                ? 'border-forest text-forest'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>MRV Reports ({project.reports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('observations')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'observations'
                ? 'border-forest text-forest'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Satellite Trends ({observations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'listings'
                ? 'border-forest text-forest'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Active Listings ({project.listings?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Beneficiaries */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-muted/20 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-ink">Decentralized Benefit Sharing</h3>
              <p className="text-xs text-muted mt-0.5">
                On-chain smart contract accumulator automatically directs credit sales revenue to the verified stakeholder wallets below:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-mist text-muted uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-lg font-semibold">Stakeholder / Entity</th>
                    <th className="px-4 py-2.5 font-semibold">Wallet Address</th>
                    <th className="px-4 py-2.5 rounded-r-lg font-semibold text-right">Revenue Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10 font-sans">
                  {project.beneficiaries.map((b) => (
                    <tr key={b.wallet} className="hover:bg-mist/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-ink">
                        {b.displayName || 'Coastal Stakeholder'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {truncateAddress(b.wallet, 8)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-forest text-sm">
                        {(b.shareBps / 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: MRV Reports */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-muted/20 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-ink">MRV Verification Log</h3>
              <p className="text-xs text-muted mt-0.5">
                Periodic monitoring submissions verified by certified scientific organizations before token minting.
              </p>
            </div>

            <div className="space-y-4">
              {project.reports.length > 0 ? (
                project.reports.map((report) => (
                  <div
                    key={report.id.toString()}
                    className="p-4 rounded-xl border border-muted/20 bg-mist/20 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-ink">
                          Report #{report.id.toString()}
                        </span>
                        <span className="text-[11px] font-semibold text-leaf bg-leaf/10 px-2 py-0.5 rounded-full border border-leaf/20">
                          {report.status}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted">
                        Methodology: {report.methodologyVersion}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-muted/10">
                        <span className="text-[10px] text-muted block uppercase">Estimated</span>
                        <span className="font-semibold text-ink">{formatBlu(report.estimatedMilli)} BLU</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-muted/10">
                        <span className="text-[10px] text-muted block uppercase">Approved Mint</span>
                        <span className="font-semibold text-forest">{formatBlu(report.minted)} BLU</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-muted/10">
                        <span className="text-[10px] text-muted block uppercase">Buffer Pool</span>
                        <span className="font-semibold text-earth">{formatBlu(report.buffered)} BLU</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-muted/10">
                        <span className="text-[10px] text-muted block uppercase">Verifier Votes</span>
                        <span className="font-semibold text-ink">{report.votes.length} approved</span>
                      </div>
                    </div>

                    {report.dataCid && (
                      <div className="text-[11px] text-muted flex items-center gap-1 font-mono pt-1">
                        <span>Bundle IPFS CID:</span>
                        <a
                          href={`https://ipfs.io/ipfs/${report.dataCid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-forest hover:underline truncate max-w-xs inline-flex items-center gap-1"
                        >
                          <span>{report.dataCid}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted">
                  No MRV reports submitted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Satellite Observations */}
        {activeTab === 'observations' && (
          <div className="bg-white rounded-2xl border border-muted/20 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-ink">Satellite Earth Observation Telemetry</h3>
              <p className="text-xs text-muted mt-0.5">
                Time-series optical observations from Sentinel-2 tracking canopy health, water coverage, and NDVI.
              </p>
            </div>

            {observations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-mist text-muted uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Observation Date</th>
                      <th className="px-4 py-2.5 font-semibold">Source</th>
                      <th className="px-4 py-2.5 font-semibold">NDVI Mean</th>
                      <th className="px-4 py-2.5 font-semibold">Canopy Area</th>
                      <th className="px-4 py-2.5 font-semibold">Water Area</th>
                      <th className="px-4 py-2.5 font-semibold">Cloud Cover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/10">
                    {observations.map((obs) => (
                      <tr key={obs.id} className="hover:bg-mist/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-ink">{formatDate(obs.date)}</td>
                        <td className="px-4 py-3 text-muted">{obs.source}</td>
                        <td className="px-4 py-3 font-mono text-forest font-bold">{obs.ndviMean.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono">{obs.canopyHa} ha</td>
                        <td className="px-4 py-3 font-mono">{obs.waterHa} ha</td>
                        <td className="px-4 py-3 font-mono text-muted">{obs.cloudPct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-muted">
                No satellite observations recorded yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-ink">Available Carbon Credits</h3>
              <p className="text-xs text-muted mt-0.5">
                Active pilot registry credits listed directly by project stakeholders:
              </p>
            </div>

            {project.listings && project.listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.listings.map((l) => (
                  <ListingCard key={l.id.toString()} listing={{ ...l, project }} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-muted/20 p-12 text-center text-xs text-muted">
                No active marketplace listings currently available for this project.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
