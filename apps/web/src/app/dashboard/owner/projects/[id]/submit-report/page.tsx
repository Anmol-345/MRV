'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cloud,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { generateDemoMrvBundle, type DemoMrvBundle } from '@/components/mrv/stub-mrv-generator';
import { formatBlu } from '@/lib/formatters';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SubmitMrvReportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Period inputs (blocks or timestamps)
  const [periodStart, setPeriodStart] = useState<number>(1000);
  const [periodEnd, setPeriodEnd] = useState<number>(2000);

  // MRV Analysis state
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [bundle, setBundle] = useState<DemoMrvBundle | null>(null);

  // Tx state
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProject(data);
        else {
          setProject({
            id,
            name: 'Sundarbans Delta Mangrove Restoration Block A',
            ecosystem: 'Mangrove',
            stateCode: 'WB',
            areaHa: 1000,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setProject({
          id,
          name: 'Sundarbans Delta Mangrove Restoration Block A',
          ecosystem: 'Mangrove',
          stateCode: 'WB',
          areaHa: 1000,
        });
        setLoading(false);
      });
  }, [id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    // Simulate satellite composite processing time
    await new Promise((r) => setTimeout(r, 1200));

    const generated = await generateDemoMrvBundle(
      parseInt(id, 10) || 1,
      project?.areaHa || 1000,
      periodStart,
      periodEnd,
      project?.ecosystem || 'Mangrove'
    );
    setBundle(generated);
    setAnalyzing(false);
  };

  const handleSubmitOnChain = async () => {
    if (!bundle) return;

    try {
      setTxStep('preparing');
      setTxError(null);

      await new Promise((r) => setTimeout(r, 600));
      setTxStep('signing');

      await new Promise((r) => setTimeout(r, 900));
      setTxStep('broadcasting');

      await new Promise((r) => setTimeout(r, 1200));

      const simulatedHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      setTxHash(simulatedHash);
      setTxStep('success');
    } catch (err) {
      setTxError(err);
      setTxStep('error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-forest text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading project details...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project #{id}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
            <FileCheck className="w-3.5 h-3.5" />
            <span>MRV Verification Pipeline</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-ink">Submit MRV Verification Report</h1>
          <p className="text-xs sm:text-sm text-muted">
            Execute decentralized MRV analysis on Sentinel-2 earth observation composites and submit cryptographic proof to the Vara registry.
          </p>
        </div>

        {/* Project Meta Card */}
        <div className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted">Target Project</span>
            <h3 className="font-serif font-bold text-lg text-ink">{project.name}</h3>
            <div className="text-xs text-muted">
              Ecosystem: <span className="font-semibold text-forest">{project.ecosystem}</span> · Area:{' '}
              <span className="font-semibold text-ink">{project.areaHa} ha</span>
            </div>
          </div>
          <div className="text-xs text-muted font-mono bg-mist px-3 py-2 rounded-xl">
            Methodology: VM0033-BLUE-CARBON
          </div>
        </div>

        {/* Step 1: Monitoring Period */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-muted/20 shadow-sm space-y-6">
          <div className="border-b border-muted/20 pb-3">
            <h3 className="font-serif font-bold text-lg text-ink">1. Monitoring Period Selection</h3>
            <p className="text-xs text-muted">
              Specify start and end block numbers or temporal boundaries for this monitoring window.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Period Start Block</label>
              <input
                type="number"
                value={periodStart}
                onChange={(e) => setPeriodStart(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Period End Block</label>
              <input
                type="number"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={analyzing || periodEnd <= periodStart}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest/90 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Sentinel-2 Composites...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Satellite &amp; Biomass Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Step 2: Analysis Preview Bundle */}
          {bundle && (
            <div className="space-y-4 pt-6 border-t border-muted/20 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink">2. MRV Evidence Bundle Preview</h3>
                  <span className="text-xs text-teal font-semibold">Tag: [{bundle.tag}] Certified Analysis</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-leaf/20 text-leaf">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hash Verified</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-mist/70 p-3.5 rounded-xl space-y-1">
                  <div className="text-muted">Net Carbon Sequestration</div>
                  <div className="text-lg font-mono font-bold text-forest">
                    {formatBlu(bundle.milliTco2eNet)} tCO2e
                  </div>
                </div>

                <div className="bg-mist/70 p-3.5 rounded-xl space-y-1">
                  <div className="text-muted">Biomass Growth Gain</div>
                  <div className="text-lg font-mono font-bold text-ink">
                    +{bundle.deltaBiomassMg} Mg
                  </div>
                </div>

                <div className="bg-mist/70 p-3.5 rounded-xl space-y-1">
                  <div className="text-muted flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Cloud Occlusion</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-ink">
                    {bundle.cloudCoverPct}%
                  </div>
                </div>

                <div className="bg-mist/70 p-3.5 rounded-xl space-y-1">
                  <div className="text-muted">Sensor Health</div>
                  <div className="text-lg font-mono font-bold text-leaf">
                    {bundle.sensorHealthScore}%
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="bg-mist/40 p-4 rounded-xl border border-muted/20 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-1 text-ink font-semibold">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  <span>Cryptographic Proof Commitment:</span>
                </div>
                <div className="truncate">
                  <span className="text-muted">SHA-256 Hash: </span>
                  <span className="text-forest font-bold">{bundle.sha256Hex}</span>
                </div>
                <div className="truncate">
                  <span className="text-muted">IPFS Bundle CID: </span>
                  <span className="text-ink">{bundle.bundleCid}</span>
                </div>
              </div>

              {/* Submission Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitOnChain}
                  className="px-6 py-3 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Sign &amp; Submit to Registry Contract</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title="Submitting MRV Report to Registry"
        txHash={txHash}
        error={txError}
        actionLabel="View Project"
        onClose={() => setTxStep('idle')}
        onSuccessDone={() => {
          setTxStep('idle');
          router.push(`/projects/${id}`);
        }}
      />
    </main>
  );
}
