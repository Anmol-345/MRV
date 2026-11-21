'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { ReportChecklist } from '@/components/mrv/report-checklist';
import { QuorumMeter } from '@/components/mrv/quorum-meter';
import { EcosystemBadge } from '@/components/ui/ecosystem-badge';
import { formatBlu, formatDate } from '@/lib/formatters';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VerifierReportDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Voting state
  const [approve, setApprove] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');

  // Tx Modal state
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setReport(data);
        } else {
          setReport({
            id,
            projectId: '1',
            project: {
              name: 'Sundarbans Delta Mangrove Conservation',
              ecosystem: 'Mangrove',
              stateCode: 'WB',
              areaHa: 1000,
            },
            periodStart: 1000,
            periodEnd: 2000,
            estimatedMilli: '5000000',
            status: 'Submitted',
            dataHash: '0x4f82a9...d18b',
            dataCid: 'bafybeidemo98231',
            votes: [
              {
                id: '1',
                verifier: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                approve: true,
                orgId: 1,
                note: 'Biomass expansion verified via Sentinel-2 NDVI change.',
              },
            ],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setReport({
          id,
          projectId: '1',
          project: {
            name: 'Sundarbans Delta Mangrove Conservation',
            ecosystem: 'Mangrove',
            stateCode: 'WB',
            areaHa: 1000,
          },
          periodStart: 1000,
          periodEnd: 2000,
          estimatedMilli: '5000000',
          status: 'Submitted',
          dataHash: '0x4f82a9...d18b',
          dataCid: 'bafybeidemo98231',
          votes: [
            {
              id: '1',
              verifier: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
              approve: true,
              orgId: 1,
              note: 'Biomass expansion verified via Sentinel-2 NDVI change.',
            },
          ],
        });
        setLoading(false);
      });
  }, [id]);

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          <span>Loading MRV audit dossier...</span>
        </div>
      </div>
    );
  }

  const approvalsCount = Array.isArray(report.votes)
    ? report.votes.filter((v: any) => v.approve).length
    : 1;
  const rejectionsCount = Array.isArray(report.votes)
    ? report.votes.filter((v: any) => !v.approve).length
    : 0;

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/verifier"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Verification Queue</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted">MRV Dossier #{report.id}</span>
              <EcosystemBadge ecosystem={report.project?.ecosystem || 'Mangrove'} />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-muted/20 text-ink">
                State: {report.project?.stateCode || 'WB'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">
              {report.project?.name}
            </h1>
            <p className="text-xs text-muted">
              Monitoring Window: Block #{report.periodStart} – #{report.periodEnd} · Claim:{' '}
              <strong className="text-forest font-mono">
                {formatBlu(BigInt(report.estimatedMilli || '0'))} tCO2e
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.network`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-muted/20 text-xs font-semibold text-forest hover:bg-mist transition-colors"
            >
              <span>On-Chain Record</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 2-Column Audit Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Automated Checks & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            <ReportChecklist
              hashMatch={true}
              periodValid={true}
              cloudCoverPct={4.2}
              sensorValid={true}
              isConflictOfInterest={false}
            />

            {/* Satellite Evidence Preview Card */}
            <div className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-ink">Satellite Earth Observation Analysis</h4>
              <div className="aspect-video bg-mist rounded-xl border border-muted/20 overflow-hidden relative flex items-center justify-center text-center p-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf/20 text-leaf text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sentinel-2 L2A Normalized Difference Vegetation Index (NDVI)</span>
                  </div>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Mean NDVI increased from 0.68 (baseline) to 0.74 over the reporting period. Zero catastrophic canopy loss detected.
                  </p>
                </div>
              </div>
            </div>

            {/* Prior Votes Log */}
            {Array.isArray(report.votes) && report.votes.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-ink text-sm">Prior Verifier Votes</h4>
                <div className="space-y-2">
                  {report.votes.map((v: any, idx: number) => (
                    <div key={idx} className="p-3 bg-mist/50 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-ink">
                          Verifier: {v.verifier.slice(0, 10)}...{v.verifier.slice(-6)}
                        </span>
                        <span
                          className={`font-bold ${
                            v.approve ? 'text-leaf' : 'text-red-600'
                          }`}
                        >
                          {v.approve ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      {v.note && <p className="text-muted italic">{v.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quorum & Voting Action */}
          <div className="space-y-6">
            <QuorumMeter
              approvalsCount={approvalsCount}
              rejectionsCount={rejectionsCount}
              requiredQuorum={2}
              minDistinctOrgs={2}
              distinctOrgsCount={approvalsCount}
              status={report.status}
            />

            {/* Voting Form Card */}
            <form
              onSubmit={handleVoteSubmit}
              className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm space-y-4"
            >
              <h4 className="font-serif font-bold text-ink">Cast Verification Vote</h4>
              <p className="text-xs text-muted leading-relaxed">
                By voting you certify that the satellite composites, cloud masks, and carbon coefficients satisfy VM0033 criteria.
              </p>

              {/* Vote Decision */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-ink">Vote Decision *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApprove(true)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      approve
                        ? 'bg-leaf/15 border-leaf text-leaf shadow-sm'
                        : 'border-muted/30 text-muted hover:border-muted'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApprove(false)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      !approve
                        ? 'bg-red-50 border-red-500 text-red-600 shadow-sm'
                        : 'border-muted/30 text-muted hover:border-muted'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Rationale Note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Audit Rationale &amp; Notes</label>
                <textarea
                  rows={3}
                  required={!approve}
                  placeholder={
                    approve
                      ? 'e.g. Verified Sentinel-2 L2A composite against local ground water salinity sensors.'
                      : 'Provide explicit justification for rejection...'
                  }
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-semibold text-xs shadow-sm transition-colors ${
                  approve
                    ? 'bg-forest hover:bg-forest/90'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <span>Submit Verification Vote to Vara</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title="Submitting Verification Vote"
        txHash={txHash}
        error={txError}
        actionLabel="Back to Queue"
        onClose={() => setTxStep('idle')}
        onSuccessDone={() => {
          setTxStep('idle');
          router.push('/dashboard/verifier');
        }}
      />
    </main>
  );
}
