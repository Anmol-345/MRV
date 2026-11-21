'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trees, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { BoundaryUploader } from '@/components/forms/boundary-uploader';
import { BeneficiariesEditor, type BeneficiaryShare } from '@/components/forms/beneficiaries-editor';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

export default function NewProjectWizardPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [ecosystem, setEcosystem] = useState<'Mangrove' | 'Seagrass' | 'SaltMarsh'>('Mangrove');
  const [stateCode, setStateCode] = useState<string>('WB');

  // Boundary & Area
  const [boundaryCid, setBoundaryCid] = useState<string>('');
  const [areaHa, setAreaHa] = useState<number>(0);

  // Beneficiaries (Default with primary Gram Panchayat)
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryShare[]>([
    {
      who: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      share_bps: 10000,
      label: 'Sundarbans Gram Panchayat #1',
    },
  ]);

  // Tx state
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);

  const totalBps = beneficiaries.reduce((sum, b) => sum + (Number(b.share_bps) || 0), 0);
  const isSharesValid = totalBps === 10000;
  const isBoundaryValid = areaHa > 0 && boundaryCid.length > 0;
  const isFormValid = name.trim().length >= 3 && isSharesValid && isBoundaryValid;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setTxStep('preparing');
      setTxError(null);

      // Simulate preparation & signature
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

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </div>

        {/* Wizard Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
            <Trees className="w-3.5 h-3.5" />
            <span>Blue Carbon Project Registration</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-ink">Register New Restoration Project</h1>
          <p className="text-xs sm:text-sm text-muted">
            Register a coastal wetland restoration project on the Vara Network registry. All boundary geometries and community revenue shares are permanently committed on-chain.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleRegister} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-muted/20 shadow-sm">
          {/* Section 1: Basic Metadata */}
          <div className="space-y-4">
            <div className="border-b border-muted/20 pb-2">
              <h3 className="font-serif font-bold text-lg text-ink">1. Project Metadata</h3>
              <p className="text-xs text-muted">Provide descriptive details and administrative location.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sundarbans Delta Mangrove Restoration Block B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Coastal Ecosystem *</label>
                <select
                  value={ecosystem}
                  onChange={(e) => setEcosystem(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="Mangrove">Mangrove Forest</option>
                  <option value="Seagrass">Seagrass Meadow</option>
                  <option value="SaltMarsh">Salt Marsh</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Coastal State / UT *</label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="WB">West Bengal</option>
                  <option value="TN">Tamil Nadu</option>
                  <option value="KL">Kerala</option>
                  <option value="GJ">Gujarat</option>
                  <option value="AP">Andhra Pradesh</option>
                  <option value="OD">Odisha</option>
                  <option value="KA">Karnataka</option>
                  <option value="GA">Goa</option>
                  <option value="MH">Maharashtra</option>
                  <option value="AN">Andaman &amp; Nicobar</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline restoration objectives, planting species, and ecological significance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Boundary Geometry & Area */}
          <div className="space-y-4">
            <div className="border-b border-muted/20 pb-2">
              <h3 className="font-serif font-bold text-lg text-ink">2. Geospatial Boundary &amp; Area</h3>
              <p className="text-xs text-muted">
                Upload GeoJSON boundary polygon. Project area is computed client-side with geodesic geometry.
              </p>
            </div>

            <BoundaryUploader
              onBoundaryLoaded={({ boundaryCid, areaHa }) => {
                setBoundaryCid(boundaryCid);
                setAreaHa(areaHa);
              }}
            />
          </div>

          {/* Section 3: Beneficiary Split */}
          <div className="space-y-4">
            <div className="border-b border-muted/20 pb-2">
              <h3 className="font-serif font-bold text-lg text-ink">3. Community Revenue Sharing</h3>
              <p className="text-xs text-muted">
                Configure beneficiary Gram Panchayats. Total shares must equal exactly 10,000 basis points (100.00%).
              </p>
            </div>

            <BeneficiariesEditor
              beneficiaries={beneficiaries}
              onChange={setBeneficiaries}
            />
          </div>

          {/* Section 4: Review & Submit */}
          <div className="pt-4 border-t border-muted/20 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted">
                <span>Registration commits project metadata on-chain to the BluToken Registry.</span>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest hover:bg-forest/90 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Register Project on Vara</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title="Registering Blue Carbon Project"
        txHash={txHash}
        error={txError}
        actionLabel="View Projects Registry"
        onClose={() => setTxStep('idle')}
        onSuccessDone={() => {
          setTxStep('idle');
          router.push('/projects');
        }}
      />
    </main>
  );
}
