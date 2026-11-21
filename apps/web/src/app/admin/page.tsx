'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  UserCheck,
  UserMinus,
  Sliders,
  Power,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { TxModal, type TxStep } from '@/components/tx/tx-modal';

export default function AdminPage() {
  // Protocol Pause Circuit Breaker
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Role Management State
  const [targetAccount, setTargetAccount] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'Verifier' | 'Admin' | 'ProjectOwner'>('Verifier');
  const [orgId, setOrgId] = useState<string>('1');

  // Protocol Parameters
  const [quorum, setQuorum] = useState<number>(2);
  const [minOrgs, setMinOrgs] = useState<number>(2);
  const [bufferBps, setBufferBps] = useState<number>(2000); // 20%
  const [platformFeeBps, setPlatformFeeBps] = useState<number>(200); // 2%

  // Tx state
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txTitle, setTxTitle] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<unknown>(null);

  const executeTx = async (title: string, action: () => void) => {
    try {
      setTxTitle(title);
      setTxStep('preparing');
      setTxError(null);

      await new Promise((r) => setTimeout(r, 600));
      setTxStep('signing');

      await new Promise((r) => setTimeout(r, 900));
      setTxStep('broadcasting');

      await new Promise((r) => setTimeout(r, 1200));

      const simulatedHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      setTxHash(simulatedHash);
      action();
      setTxStep('success');
    } catch (err) {
      setTxError(err);
      setTxStep('error');
    }
  };

  const handleTogglePause = () => {
    const nextState = !isPaused;
    executeTx(nextState ? 'Pausing Smart Contracts' : 'Unpausing Smart Contracts', () => {
      setIsPaused(nextState);
    });
  };

  const handleGrantRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount) return;
    executeTx(`Granting Role: ${selectedRole}`, () => {
      setTargetAccount('');
    });
  };

  const handleUpdateParams = (e: React.FormEvent) => {
    e.preventDefault();
    executeTx('Updating Protocol Parameters', () => {});
  };

  return (
    <main className="flex-1 bg-mist/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-earth/15 text-earth text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Protocol Governance &amp; Administration</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-ink">Protocol Control Center</h1>
          <p className="text-xs sm:text-sm text-muted">
            Manage protocol parameters, accredited verifier roles, and emergency circuit breakers on Vara Network.
          </p>
        </div>

        {/* Emergency Circuit Breaker Card */}
        <div
          className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all ${
            isPaused
              ? 'bg-red-50/70 border-red-300'
              : 'bg-white border-muted/20'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Power className={`w-5 h-5 ${isPaused ? 'text-red-600' : 'text-leaf'}`} />
              <h3 className="font-serif font-bold text-xl text-ink">
                Global Circuit Breaker Status:{' '}
                <span className={isPaused ? 'text-red-600' : 'text-leaf'}>
                  {isPaused ? 'PAUSED' : 'OPERATIONAL'}
                </span>
              </h3>
            </div>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              When paused, all registry submissions, verifications, token transfers, and marketplace transactions are temporarily frozen for contract security.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleTogglePause}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm flex items-center gap-2 ${
                isPaused
                  ? 'bg-leaf hover:bg-leaf/90 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isPaused ? 'Unpause Contracts' : 'Emergency Pause'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Admin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Role Management */}
          <form
            onSubmit={handleGrantRole}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-muted/20 shadow-sm space-y-5"
          >
            <div className="border-b border-muted/20 pb-3">
              <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-forest" />
                <span>Accreditation &amp; Roles</span>
              </h3>
              <p className="text-xs text-muted">Grant or revoke roles to Substrate wallet addresses.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Wallet Address (5... or 0x...)</label>
                <input
                  type="text"
                  required
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Target Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value="Verifier">Verifier</option>
                    <option value="Admin">Admin</option>
                    <option value="ProjectOwner">ProjectOwner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink">Organization ID</label>
                  <input
                    type="number"
                    min="1"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!targetAccount}
              className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest/90 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Grant Role on Vara</span>
            </button>
          </form>

          {/* Column 2: Protocol Parameters */}
          <form
            onSubmit={handleUpdateParams}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-muted/20 shadow-sm space-y-5"
          >
            <div className="border-b border-muted/20 pb-3">
              <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <Sliders className="w-5 h-5 text-forest" />
                <span>Protocol Parameters</span>
              </h3>
              <p className="text-xs text-muted">Core threshold invariants governing verification and fees.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Required Quorum</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quorum}
                  onChange={(e) => setQuorum(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Min Distinct Orgs</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={minOrgs}
                  onChange={(e) => setMinOrgs(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Buffer Pool (bps)</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={bufferBps}
                  onChange={(e) => setBufferBps(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <span className="text-[10px] text-muted">{(bufferBps / 100).toFixed(1)}% reserved</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Platform Fee (bps)</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={platformFeeBps}
                  onChange={(e) => setPlatformFeeBps(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-muted/20 font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <span className="text-[10px] text-muted">{(platformFeeBps / 100).toFixed(1)}% on trades</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Update Parameters on Vara</span>
            </button>
          </form>
        </div>
      </div>

      <TxModal
        isOpen={txStep !== 'idle'}
        step={txStep}
        title={txTitle}
        txHash={txHash}
        error={txError}
        actionLabel="Done"
        onClose={() => setTxStep('idle')}
        onSuccessDone={() => setTxStep('idle')}
      />
    </main>
  );
}
