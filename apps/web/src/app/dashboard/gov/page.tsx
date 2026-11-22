'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  Download,
  AlertTriangle,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Trees,
  Filter,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { formatNumber } from '@/lib/formatters';

interface StateRow {
  stateCode: string;
  stateName: string;
  ecosystem: string;
  areaHa: number;
  mintedBlu: number;
  retiredBlu: number;
  revenueVara: number;
  activeSites: number;
}

export default function GovDashboardPage() {
  const [filterEcosystem, setFilterEcosystem] = useState<string>('all');

  const stateData: StateRow[] = [
    { stateCode: 'WB', stateName: 'West Bengal (Sundarbans)', ecosystem: 'Mangrove', areaHa: 4200, mintedBlu: 18400, retiredBlu: 2800, revenueVara: 460000, activeSites: 3 },
    { stateCode: 'TN', stateName: 'Tamil Nadu (Palk Bay / Mannar)', ecosystem: 'Seagrass', areaHa: 2800, mintedBlu: 9800, retiredBlu: 1200, revenueVara: 245000, activeSites: 2 },
    { stateCode: 'GJ', stateName: 'Gujarat (Gulf of Kutch)', ecosystem: 'SaltMarsh', areaHa: 2100, mintedBlu: 7500, retiredBlu: 900, revenueVara: 187500, activeSites: 1 },
    { stateCode: 'OD', stateName: 'Odisha (Bhitarkanika / Chilika)', ecosystem: 'Mangrove', areaHa: 1400, mintedBlu: 5600, retiredBlu: 650, revenueVara: 140000, activeSites: 1 },
    { stateCode: 'KL', stateName: 'Kerala (Vembanad Estuary)', ecosystem: 'Mangrove', areaHa: 850, mintedBlu: 3100, retiredBlu: 400, revenueVara: 77500, activeSites: 1 },
    { stateCode: 'AP', stateName: 'Andhra Pradesh (Coringa)', ecosystem: 'Mangrove', areaHa: 600, mintedBlu: 2100, retiredBlu: 250, revenueVara: 52500, activeSites: 0 },
    { stateCode: 'KA', stateName: 'Karnataka (Aghanashini)', ecosystem: 'Mangrove', areaHa: 250, mintedBlu: 900, retiredBlu: 100, revenueVara: 22500, activeSites: 0 },
    { stateCode: 'GA', stateName: 'Goa (Zuari Estuary)', ecosystem: 'Mangrove', areaHa: 150, mintedBlu: 500, retiredBlu: 60, revenueVara: 12500, activeSites: 0 },
    { stateCode: 'MH', stateName: 'Maharashtra (Thane Creek)', ecosystem: 'Mangrove', areaHa: 80, mintedBlu: 200, retiredBlu: 30, revenueVara: 5000, activeSites: 0 },
    { stateCode: 'AN', stateName: 'Andaman & Nicobar Islands', ecosystem: 'Seagrass', areaHa: 20, mintedBlu: 100, retiredBlu: 10, revenueVara: 2500, activeSites: 0 },
  ];

  const filteredStates = filterEcosystem === 'all'
    ? stateData
    : stateData.filter((s) => s.ecosystem.toLowerCase() === filterEcosystem.toLowerCase());

  const totalArea = stateData.reduce((acc, s) => acc + s.areaHa, 0);
  const totalMinted = stateData.reduce((acc, s) => acc + s.mintedBlu, 0);
  const totalRetired = stateData.reduce((acc, s) => acc + s.retiredBlu, 0);
  const totalRevenue = stateData.reduce((acc, s) => acc + s.revenueVara, 0);

  const handleDownloadCsv = () => {
    const headers = ['State Code', 'State Name', 'Primary Ecosystem', 'Area (ha)', 'Minted (tCO2e)', 'Retired (tCO2e)', 'Community Revenue (VARA)', 'Active Sites'];
    const rows = stateData.map((s) => [
      s.stateCode,
      `"${s.stateName}"`,
      s.ecosystem,
      s.areaHa,
      s.mintedBlu,
      s.retiredBlu,
      s.revenueVara,
      s.activeSites,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'blutoken_registry_gov_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex flex-col gap-8">
      {/* Nature Banner Header */}
      <section className="relative rounded-2xl overflow-hidden bg-deep-canopy text-on-deep-canopy p-6 sm:p-10 shadow-lg border border-outline-variant/60">
        {/* Background Nature Imagery - Coastal Wetlands & Intertidal Zone */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=80"
          alt="Coastal wetlands and mangrove delta"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-canopy/95 via-deep-canopy/80 to-deep-canopy/65" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20 text-xs font-semibold text-shoot-lime">
              <Building2 className="w-3.5 h-3.5" />
              <span>MoEFCC &amp; SCZMA COMPLIANCE PORTAL</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-deep-canopy tracking-tight">
              Government Oversight &amp; Audit Dashboard
            </h1>
            <p className="font-body text-sm sm:text-base text-on-deep-canopy/85 leading-relaxed">
              Ministry of Environment, Forest and Climate Change &amp; State Coastal Zone Management Authorities monitoring console. Real-time telemetry, fraud signals, and on-chain verification logs.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-shoot-lime text-on-shoot-lime font-semibold text-xs shadow-md hover:bg-living-leaf-container transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Compliance CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface-card p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <span className="font-label text-xs font-semibold text-botanical-muted uppercase tracking-wider">
            Monitored Area
          </span>
          <div className="mt-2">
            <span className="font-headline text-3xl font-bold text-on-surface tabular-nums">
              {formatNumber(totalArea)}
            </span>
            <span className="font-body text-xs text-botanical-muted ml-1">ha</span>
          </div>
        </div>

        <div className="bg-surface-card p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <span className="font-label text-xs font-semibold text-primary uppercase tracking-wider">
            Total Minted
          </span>
          <div className="mt-2">
            <span className="font-headline text-3xl font-bold text-primary tabular-nums">
              {formatNumber(totalMinted)}
            </span>
            <span className="font-body text-xs text-botanical-muted ml-1">tCO2e</span>
          </div>
        </div>

        <div className="bg-surface-card p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <span className="font-label text-xs font-semibold text-tidal-teal uppercase tracking-wider">
            Retired Offsets
          </span>
          <div className="mt-2">
            <span className="font-headline text-3xl font-bold text-tidal-teal tabular-nums">
              {formatNumber(totalRetired)}
            </span>
            <span className="font-body text-xs text-botanical-muted ml-1">tCO2e</span>
          </div>
        </div>

        <div className="bg-surface-card p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <span className="font-label text-xs font-semibold text-rhizome-earth uppercase tracking-wider">
            Panchayat Streams
          </span>
          <div className="mt-2">
            <span className="font-headline text-3xl font-bold text-rhizome-earth tabular-nums">
              {formatNumber(totalRevenue)}
            </span>
            <span className="font-body text-xs text-botanical-muted ml-1">VARA</span>
          </div>
        </div>
      </div>

      {/* Anomaly & Risk Alerts Banner */}
      <div className="bg-surface-card p-6 sm:p-8 rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3">
          <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rhizome-earth" />
            <span>Automated Fraud &amp; Anomaly Signals</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rhizome-earth-container text-on-rhizome-earth-container">
            3 Active Flags
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1">
            <div className="font-semibold text-amber-900">NDVI Variance Flag</div>
            <p className="text-amber-800 leading-relaxed">
              Site #2 (Tamil Nadu): Rapid 8% canopy gain flagged for field verification plot inspection.
            </p>
          </div>

          <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1">
            <div className="font-semibold text-blue-900">IoT Sensor Offline Alert</div>
            <p className="text-blue-800 leading-relaxed">
              Sundarbans Node SN-09: No telemetry heartbeat in 52 hours. Automatic verifier review warning attached.
            </p>
          </div>

          <div className="p-4 bg-red-50/80 border border-red-200/80 rounded-xl space-y-1">
            <div className="font-semibold text-red-900">Citizen Threat Clustered</div>
            <p className="text-red-800 leading-relaxed">
              Gujarat Embankment: 4 independent citizen reports received reporting mangrove edge cutting.
            </p>
          </div>
        </div>
      </div>

      {/* State-Wise Coastal Breakdown Table */}
      <div className="bg-surface-card rounded-2xl border border-outline-variant/60 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-4">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              State &amp; Union Territory Registry Distribution
            </h3>
            <p className="text-xs text-botanical-muted mt-0.5">
              10 Indian maritime states and territories under automated Sentinel-2 surveillance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-botanical-muted" />
            <select
              value={filterEcosystem}
              onChange={(e) => setFilterEcosystem(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none"
            >
              <option value="all">All Ecosystems</option>
              <option value="mangrove">Mangrove</option>
              <option value="seagrass">Seagrass</option>
              <option value="saltmarsh">Salt Marsh</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/50 text-botanical-muted uppercase tracking-wider font-semibold">
                <th className="pb-3">State / Jurisdiction</th>
                <th className="pb-3">Dominant Ecosystem</th>
                <th className="pb-3 text-right">Area (ha)</th>
                <th className="pb-3 text-right">Minted (tCO2e)</th>
                <th className="pb-3 text-right">Retired (tCO2e)</th>
                <th className="pb-3 text-right">Revenue (VARA)</th>
                <th className="pb-3 text-center">Active Sites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-mono">
              {filteredStates.map((row) => (
                <tr key={row.stateCode} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 font-sans font-semibold text-on-surface">
                    {row.stateName}{' '}
                    <span className="text-[10px] font-mono font-bold text-botanical-muted bg-surface-container-low px-1.5 py-0.5 rounded ml-1">
                      {row.stateCode}
                    </span>
                  </td>
                  <td className="py-3 font-sans">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-container text-on-primary-container">
                      {row.ecosystem}
                    </span>
                  </td>
                  <td className="py-3 text-right text-on-surface font-bold">
                    {formatNumber(row.areaHa)}
                  </td>
                  <td className="py-3 text-right text-primary font-bold">
                    {formatNumber(row.mintedBlu)}
                  </td>
                  <td className="py-3 text-right text-tidal-teal font-semibold">
                    {formatNumber(row.retiredBlu)}
                  </td>
                  <td className="py-3 text-right text-on-surface font-semibold">
                    {formatNumber(row.revenueVara)}
                  </td>
                  <td className="py-3 text-center font-sans font-bold">
                    {row.activeSites > 0 ? (
                      <span className="text-living-leaf">{row.activeSites} active</span>
                    ) : (
                      <span className="text-botanical-muted">Pilot queued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
