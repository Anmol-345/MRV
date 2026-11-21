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
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>National Coastal Carbon Registry</span>
            </div>
            <h1 className="text-3xl font-serif font-black text-ink">
              Government Oversight &amp; Audit Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Ministry of Environment, Forest and Climate Change (MoEFCC) &amp; State Coastal Zone Management Authorities (SCZMA) monitoring console.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Compliance CSV</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Monitored Area"
            value={formatNumber(totalArea)}
            unit="hectares"
            variant="forest"
          />
          <StatCard
            title="Total Minted"
            value={formatNumber(totalMinted)}
            unit="tCO2e"
            variant="leaf"
          />
          <StatCard
            title="Retired Offsets"
            value={formatNumber(totalRetired)}
            unit="tCO2e"
            variant="teal"
          />
          <StatCard
            title="Gram Panchayat Streams"
            value={formatNumber(totalRevenue)}
            unit="VARA"
            variant="earth"
          />
        </div>

        {/* Anomaly & Risk Alerts Banner */}
        <div className="bg-white p-6 rounded-3xl border border-muted/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-muted/20 pb-3">
            <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-earth" />
              <span>Automated Fraud &amp; Anomaly Signals</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-earth/20 text-earth">
              3 Active Flags
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="font-semibold text-amber-900">NDVI Variance Flag</div>
              <p className="text-amber-800 leading-relaxed">
                Site #2 (Tamil Nadu): Rapid 8% canopy gain flagged for field verification plot inspection.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <div className="font-semibold text-blue-900">IoT Sensor Offline Alert</div>
              <p className="text-blue-800 leading-relaxed">
                Sundarbans Node SN-09: No telemetry heartbeat in 52 hours. Automatic verifier review warning attached.
              </p>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
              <div className="font-semibold text-red-900">Citizen Threat Clustered</div>
              <p className="text-red-800 leading-relaxed">
                Gujarat Embankment: 4 independent citizen reports received reporting mangrove edge cutting.
              </p>
            </div>
          </div>
        </div>

        {/* State-Wise Coastal Breakdown Table */}
        <div className="bg-white rounded-3xl border border-muted/20 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-muted/20 pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">
                State &amp; Union Territory Registry Distribution
              </h3>
              <p className="text-xs text-muted">
                10 Indian maritime states and territories under automated Sentinel-2 surveillance.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-muted" />
              <select
                value={filterEcosystem}
                onChange={(e) => setFilterEcosystem(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-muted/20 bg-mist/50 text-xs font-semibold text-ink focus:outline-none"
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
                <tr className="border-b border-muted/20 text-muted uppercase tracking-wider font-semibold">
                  <th className="pb-3">State / Jurisdiction</th>
                  <th className="pb-3">Dominant Ecosystem</th>
                  <th className="pb-3 text-right">Area (ha)</th>
                  <th className="pb-3 text-right">Minted (tCO2e)</th>
                  <th className="pb-3 text-right">Retired (tCO2e)</th>
                  <th className="pb-3 text-right">Revenue (VARA)</th>
                  <th className="pb-3 text-center">Active Sites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10 font-mono">
                {filteredStates.map((row) => (
                  <tr key={row.stateCode} className="hover:bg-mist/30 transition-colors">
                    <td className="py-3 font-sans font-semibold text-ink">
                      {row.stateName}{' '}
                      <span className="text-[10px] font-mono font-bold text-muted bg-mist px-1.5 py-0.5 rounded ml-1">
                        {row.stateCode}
                      </span>
                    </td>
                    <td className="py-3 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-forest/10 text-forest">
                        {row.ecosystem}
                      </span>
                    </td>
                    <td className="py-3 text-right text-ink font-bold">
                      {formatNumber(row.areaHa)}
                    </td>
                    <td className="py-3 text-right text-forest font-bold">
                      {formatNumber(row.mintedBlu)}
                    </td>
                    <td className="py-3 text-right text-teal font-semibold">
                      {formatNumber(row.retiredBlu)}
                    </td>
                    <td className="py-3 text-right text-ink font-semibold">
                      {formatNumber(row.revenueVara)}
                    </td>
                    <td className="py-3 text-center font-sans font-bold">
                      {row.activeSites > 0 ? (
                        <span className="text-leaf">{row.activeSites} active</span>
                      ) : (
                        <span className="text-muted">Pilot queued</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
