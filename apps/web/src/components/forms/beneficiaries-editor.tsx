'use client';

import React from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export interface BeneficiaryShare {
  who: string;
  share_bps: number;
  label?: string;
}

interface BeneficiariesEditorProps {
  beneficiaries: BeneficiaryShare[];
  onChange: (shares: BeneficiaryShare[]) => void;
  disabled?: boolean;
}

export function BeneficiariesEditor({
  beneficiaries,
  onChange,
  disabled = false,
}: BeneficiariesEditorProps) {
  const totalBps = beneficiaries.reduce((sum, b) => sum + (Number(b.share_bps) || 0), 0);
  const isValid = totalBps === 10000;
  const remainingBps = 10000 - totalBps;

  const handleAdd = () => {
    onChange([
      ...beneficiaries,
      {
        who: '',
        share_bps: remainingBps > 0 ? remainingBps : 0,
        label: `Gram Panchayat #${beneficiaries.length + 1}`,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const updated = beneficiaries.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof BeneficiaryShare, value: any) => {
    const updated = [...beneficiaries];
    updated[index] = {
      ...updated[index],
      [field]: field === 'share_bps' ? Math.max(0, parseInt(value, 10) || 0) : value,
    };
    onChange(updated);
  };

  const handleSplitEvenly = () => {
    if (beneficiaries.length === 0) return;
    const count = beneficiaries.length;
    const baseShare = Math.floor(10000 / count);
    const remainder = 10000 % count;

    const updated = beneficiaries.map((b, i) => ({
      ...b,
      share_bps: baseShare + (i === 0 ? remainder : 0),
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4 bg-mist/60 p-4 sm:p-5 rounded-2xl border border-muted/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-muted/20 pb-3">
        <div className="flex items-center gap-2 text-ink font-serif font-bold text-base">
          <Users className="w-5 h-5 text-forest" />
          <span>Coastal Community Beneficiaries</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSplitEvenly}
            disabled={disabled || beneficiaries.length === 0}
            className="text-xs font-semibold text-forest hover:text-forest/80 disabled:opacity-40 transition-colors"
          >
            Split Evenly
          </button>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isValid
                ? 'bg-leaf/20 text-leaf border border-leaf/30'
                : 'bg-earth/20 text-earth border border-earth/30'
            }`}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Total: 100.00% (10,000 bps)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  Total: {(totalBps / 100).toFixed(2)}% ({totalBps} / 10,000 bps)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted space-y-2">
          <p>No community beneficiaries configured yet.</p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors"
          >
            Add Primary Gram Panchayat
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {beneficiaries.map((b, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white rounded-xl border border-muted/20 shadow-sm"
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Gram Panchayat / Community Address (5... or 0x...)"
                  value={b.who}
                  disabled={disabled}
                  onChange={(e) => handleChange(index, 'who', e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-muted/20 focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="w-full sm:w-36 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={b.share_bps}
                  disabled={disabled}
                  onChange={(e) => handleChange(index, 'share_bps', e.target.value)}
                  className="w-20 text-xs px-2.5 py-2 rounded-lg border border-muted/20 text-right font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <span className="text-xs text-muted font-mono w-16">
                  {((b.share_bps || 0) / 100).toFixed(1)}%
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled || beneficiaries.length <= 1}
                  className="p-1.5 text-muted hover:text-red-600 disabled:opacity-30 transition-colors"
                  title="Remove beneficiary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled}
            className="w-full py-2 border-2 border-dashed border-muted/30 rounded-xl text-xs font-semibold text-muted hover:text-forest hover:border-forest/50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Community Beneficiary</span>
          </button>
        </div>
      )}

      {!isValid && (
        <div className="text-xs text-earth bg-earth/10 border border-earth/20 rounded-lg p-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {totalBps < 10000
              ? `You need to allocate ${(100 - totalBps / 100).toFixed(2)}% more (${10000 - totalBps} bps) to reach 100%.`
              : `Total shares exceed 100% by ${(totalBps / 100 - 100).toFixed(2)}% (${totalBps - 10000} bps). Reduce shares to reach exactly 10,000 bps.`}
          </span>
        </div>
      )}
    </div>
  );
}
