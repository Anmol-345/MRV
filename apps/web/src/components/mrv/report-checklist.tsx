'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileCheck, Cloud, Cpu, UserX } from 'lucide-react';

export interface AutomatedCheckItem {
  id: string;
  label: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  icon: React.ReactNode;
}

interface ReportChecklistProps {
  hashMatch: boolean;
  periodValid: boolean;
  cloudCoverPct: number;
  sensorValid: boolean;
  isConflictOfInterest: boolean;
}

export function ReportChecklist({
  hashMatch,
  periodValid,
  cloudCoverPct,
  sensorValid,
  isConflictOfInterest,
}: ReportChecklistProps) {
  const isCloudCoverPass = cloudCoverPct <= 15;

  const checks: AutomatedCheckItem[] = [
    {
      id: 'hash',
      label: 'SHA-256 Bundle Integrity',
      description: hashMatch
        ? 'Recomputed payload hash matches on-chain commitment.'
        : 'Hash mismatch: downloaded bundle does not match on-chain record.',
      status: hashMatch ? 'passed' : 'failed',
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      id: 'period',
      label: 'Monitoring Period Non-Overlap',
      description: periodValid
        ? 'Period starts strictly after previously verified reports.'
        : 'Overlapping temporal coverage detected with prior report.',
      status: periodValid ? 'passed' : 'failed',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'cloud',
      label: 'Sentinel-2 Cloud Masking',
      description: isCloudCoverPass
        ? `Cloud occlusion is ${cloudCoverPct.toFixed(1)}% (threshold < 15%).`
        : `Excessive cloud occlusion of ${cloudCoverPct.toFixed(1)}% violates minimum visibility standards.`,
      status: isCloudCoverPass ? 'passed' : 'warning',
      icon: <Cloud className="w-4 h-4" />,
    },
    {
      id: 'sensor',
      label: 'IoT Sensor Telemetry Validation',
      description: sensorValid
        ? 'Continuous water level & salinity readings verified with no drift.'
        : 'Sensor telemetry indicates drift or missing heartbeat signals.',
      status: sensorValid ? 'passed' : 'warning',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'conflict',
      label: 'Verifier Independence Check',
      description: !isConflictOfInterest
        ? 'No conflict of interest: verifier is an independent organization.'
        : 'Conflict of interest: connected wallet belongs to the project developer organization.',
      status: !isConflictOfInterest ? 'passed' : 'failed',
      icon: <UserX className="w-4 h-4" />,
    },
  ];

  const allPassed = checks.every((c) => c.status === 'passed');

  return (
    <div className="bg-white rounded-2xl border border-muted/20 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-muted/20 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-forest" />
          <h4 className="font-serif font-bold text-ink">Automated Verification Checks</h4>
        </div>
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            allPassed ? 'bg-leaf/20 text-leaf' : 'bg-earth/20 text-earth'
          }`}
        >
          {allPassed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Checks Passed</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Review Flags Detected</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
              check.status === 'passed'
                ? 'bg-leaf/5 border-leaf/20'
                : check.status === 'failed'
                ? 'bg-red-50/70 border-red-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                check.status === 'passed'
                  ? 'bg-leaf/20 text-leaf'
                  : check.status === 'failed'
                  ? 'bg-red-200 text-red-700'
                  : 'bg-amber-200 text-amber-700'
              }`}
            >
              {check.icon}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-ink">{check.label}</span>
                {check.status === 'passed' && (
                  <span className="text-[10px] uppercase font-bold text-leaf">Pass</span>
                )}
                {check.status === 'failed' && (
                  <span className="text-[10px] uppercase font-bold text-red-600">Fail</span>
                )}
                {check.status === 'warning' && (
                  <span className="text-[10px] uppercase font-bold text-amber-600">Review</span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">{check.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
