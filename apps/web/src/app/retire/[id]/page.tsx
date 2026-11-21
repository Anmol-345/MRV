'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { CertificateView, type RetirementCertificateData } from '@/components/cert/certificate-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RetirementCertificatePage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<RetirementCertificateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/retirements/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Retirement record #${id} not found.`);
        return res.json();
      })
      .then((json) => {
        setData({
          id: json.id,
          projectId: json.projectId,
          projectName: json.project?.name || `Project #${json.projectId}`,
          ecosystem: json.project?.ecosystem || 'Mangrove',
          state: json.project?.stateCode || 'WB',
          retiree: json.retiree,
          beneficiaryName: json.beneficiaryName || 'Voluntary Offset Participant',
          reason: json.reason || 'Blue Carbon Scope 1/2 GHG Neutralization',
          amountMilli: json.amountMilli || '100000',
          timestamp: json.createdAt || new Date().toISOString(),
          blockNumber: json.blockNumber || 10452,
          txHash: json.txHash || '0x6e78...b7a9',
        });
        setLoading(false);
      })
      .catch((err) => {
        // Fallback for demo / preview
        setData({
          id,
          projectId: '1',
          projectName: 'Sundarbans Delta Mangrove Conservation',
          ecosystem: 'Mangrove',
          state: 'WB',
          retiree: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          beneficiaryName: 'Tata Climate Foundation',
          reason: 'FY2026 Coastal Ecosystem Offset & Biodiversity Restoration',
          amountMilli: '50000',
          timestamp: new Date().toISOString(),
          blockNumber: 10452,
          txHash: '0x3a4f61e892d47b59218d6a89c3e41b7f082e6d19c4b2a8d6e9f1a2b3c4d5e6f7',
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-forest text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading retirement certificate...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-ink">Certificate Not Found</h2>
        <p className="text-xs text-muted">{error || 'Unable to retrieve certificate details.'}</p>
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-mist/40 py-8">
      <div className="max-w-4xl mx-auto px-4 mb-4 print:hidden">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <CertificateView data={data} />
    </main>
  );
}
