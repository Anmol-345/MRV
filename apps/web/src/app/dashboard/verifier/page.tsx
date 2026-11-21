'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBlu, formatDate } from '@/lib/formatters';
import { EcosystemBadge } from '@/components/ui/ecosystem-badge';

interface PendingReportItem {
  id: string | number;
  projectId: string | number;
  projectName: string;
  ecosystem: 'Mangrove' | 'Seagrass' | 'SaltMarsh';
  state: string;
  submitter: string;
  periodStart: number;
  periodEnd: number;
  estimatedMilli: string | bigint;
  status: 'Submitted' | 'Verified' | 'Rejected';
  approvalsCount: number;
  rejectionsCount: number;
  createdAt: string;
}

export default function VerifierQueuePage() {
  const [reports, setReports] = useState<PendingReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In demo / MVP, load pending reports from API or seed list
    fetch('/api/reports/1')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setReports([
            {
              id: data.id || '1',
              projectId: data.projectId || '1',
              projectName: data.project?.name || 'Sundarbans Delta Mangrove Conservation',
              ecosystem: data.project?.ecosystem || 'Mangrove',
              state: data.project?.stateCode || 'WB',
              submitter: data.submitter || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              periodStart: data.periodStart || 1000,
              periodEnd: data.periodEnd || 2000,
              estimatedMilli: data.estimatedMilli || '5000000',
              status: data.status || 'Submitted',
              approvalsCount: Array.isArray(data.votes) ? data.votes.filter((v: any) => v.approve).length : 1,
              rejectionsCount: Array.isArray(data.votes) ? data.votes.filter((v: any) => !v.approve).length : 0,
              createdAt: data.createdAt || new Date().toISOString(),
            },
          ]);
        } else {
          setReports([
            {
              id: '1',
              projectId: '1',
              projectName: 'Sundarbans Delta Mangrove Conservation',
              ecosystem: 'Mangrove',
              state: 'WB',
              submitter: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              periodStart: 1000,
              periodEnd: 2000,
              estimatedMilli: '5000000',
              status: 'Submitted',
              approvalsCount: 1,
              rejectionsCount: 0,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setReports([
          {
            id: '1',
            projectId: '1',
            projectName: 'Sundarbans Delta Mangrove Conservation',
            ecosystem: 'Mangrove',
            state: 'WB',
            submitter: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            periodStart: 1000,
            periodEnd: 2000,
            estimatedMilli: '5000000',
            status: 'Submitted',
            approvalsCount: 1,
            rejectionsCount: 0,
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accredited Scientific Verifier Portal</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-ink">MRV Verification Queue</h1>
          <p className="text-xs sm:text-sm text-muted">
            Independent scientific auditing queue for submitted blue carbon restoration MRV evidence bundles.
          </p>
        </div>

        {/* Queue List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-forest" />
            <span>Loading verification queue...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-muted/20 space-y-3">
            <FileText className="w-10 h-10 text-muted mx-auto" />
            <h3 className="font-serif font-bold text-ink">No Pending Reports</h3>
            <p className="text-xs text-muted">All submitted MRV evidence bundles have been audited.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-muted/20 shadow-sm hover:border-forest/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted">Report #{report.id}</span>
                    <EcosystemBadge ecosystem={report.ecosystem} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-mist text-ink">
                      {report.state}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      Voting Active
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-ink">{report.projectName}</h3>

                  <div className="text-xs text-muted flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Period: <strong className="text-ink">Block #{report.periodStart} – #{report.periodEnd}</strong>
                    </span>
                    <span>
                      Claim:{' '}
                      <strong className="text-forest">
                        {formatBlu(BigInt(report.estimatedMilli))} tCO2e
                      </strong>
                    </span>
                    <span>
                      Progress: <strong className="text-ink">{report.approvalsCount}/2 approvals</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <Link
                    href={`/dashboard/verifier/reports/${report.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <span>Audit &amp; Cast Vote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
