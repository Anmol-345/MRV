'use client';

import React from 'react';
import { ShieldCheck, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QuorumMeterProps {
  approvalsCount: number;
  rejectionsCount: number;
  requiredQuorum?: number;
  minDistinctOrgs?: number;
  distinctOrgsCount?: number;
  status: 'Submitted' | 'Verified' | 'Rejected' | 'Cancelled';
}

export function QuorumMeter({
  approvalsCount,
  rejectionsCount,
  requiredQuorum = 2,
  minDistinctOrgs = 2,
  distinctOrgsCount = 0,
  status,
}: QuorumMeterProps) {
  const percentApproved = Math.min(100, Math.round((approvalsCount / requiredQuorum) * 100));
  const isQuorumReached = approvalsCount >= requiredQuorum && distinctOrgsCount >= minDistinctOrgs;

  return (
    <div className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-forest" />
          <h4 className="font-serif font-bold text-ink">Verification Quorum</h4>
        </div>
        <div>
          {status === 'Verified' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-leaf/20 text-leaf">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Quorum Finalized</span>
            </span>
          ) : status === 'Rejected' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>Report Rejected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-mist text-muted border border-muted/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Voting Active</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted font-medium">Accredited Approvals</span>
          <span className="font-mono font-bold text-ink">
            {approvalsCount} / {requiredQuorum} needed
          </span>
        </div>
        <div className="w-full h-3 bg-mist rounded-full overflow-hidden flex">
          <div
            className="h-full bg-leaf transition-all duration-300 rounded-full"
            style={{ width: `${percentApproved}%` }}
          />
        </div>
      </div>

      {/* Organization Diversity Metric */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-muted/10 text-xs">
        <div className="bg-mist/50 p-2.5 rounded-xl space-y-0.5">
          <div className="text-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Distinct Orgs</span>
          </div>
          <div className="font-mono font-bold text-ink">
            {distinctOrgsCount} of {minDistinctOrgs} required
          </div>
        </div>

        <div className="bg-mist/50 p-2.5 rounded-xl space-y-0.5">
          <div className="text-muted">Rejection Count</div>
          <div className="font-mono font-bold text-red-600">{rejectionsCount}</div>
        </div>
      </div>

      <div className="text-xs text-muted leading-relaxed">
        <strong>Rule 2 &amp; 3:</strong> Verification requires at least{' '}
        <span className="font-semibold text-ink">{requiredQuorum} approvals</span> from at least{' '}
        <span className="font-semibold text-ink">{minDistinctOrgs} independent organizations</span>.
        Project developers are barred by contract from voting on their own submissions.
      </div>
    </div>
  );
}
