'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, X } from 'lucide-react';
import { decodeContractError, type FriendlyError } from '@/lib/contract-errors';

export type TxStep = 'idle' | 'preparing' | 'signing' | 'broadcasting' | 'finalized' | 'success' | 'error';

interface TxModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: TxStep;
  title: string;
  txHash?: string;
  error?: unknown;
  actionLabel?: string;
  onSuccessDone?: () => void;
}

export function TxModal({
  isOpen,
  onClose,
  step,
  title,
  txHash,
  error,
  actionLabel = 'Close',
  onSuccessDone,
}: TxModalProps) {
  if (!isOpen) return null;

  const friendlyError: FriendlyError | null = error ? decodeContractError(error) : null;
  const isPending = step === 'preparing' || step === 'signing' || step === 'broadcasting';
  const isSuccess = step === 'success' || step === 'finalized';
  const isFailed = step === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-muted/20 relative space-y-5">
        {/* Close Button if not pending */}
        {!isPending && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-ink transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-2">
          {/* Status Indicator Icon */}
          <div className="flex justify-center">
            {isPending && (
              <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="w-16 h-16 rounded-full bg-leaf/20 flex items-center justify-center text-leaf">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            {isFailed && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          <h3 className="font-serif font-bold text-xl text-ink">{title}</h3>

          {/* Dynamic Step description */}
          <div className="text-sm text-muted">
            {step === 'preparing' && 'Preparing transaction payload and parameters...'}
            {step === 'signing' && 'Awaiting wallet signature approval in your extension...'}
            {step === 'broadcasting' && 'Broadcasting message to Vara Network validators...'}
            {isSuccess && 'Transaction successfully finalized and committed to Vara state!'}
            {isFailed && (friendlyError?.title || 'Transaction failed')}
          </div>
        </div>

        {/* Success Details */}
        {isSuccess && txHash && (
          <div className="bg-mist p-3 rounded-lg text-xs space-y-1 text-ink">
            <div className="text-muted font-medium">Transaction Hash / Message ID:</div>
            <div className="font-mono break-all text-forest font-semibold">{txHash}</div>
            <a
              href={`https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.network`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-forest hover:underline pt-1"
            >
              <span>View on Vara Idea Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Error Details */}
        {isFailed && friendlyError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2 text-red-900">
            <div className="font-semibold text-sm">{friendlyError.title}</div>
            <p className="leading-relaxed">{friendlyError.message}</p>
            {friendlyError.suggestion && (
              <div className="pt-2 border-t border-red-200/60 text-red-700">
                <strong>Suggestion:</strong> {friendlyError.suggestion}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          {isSuccess ? (
            <button
              onClick={() => {
                if (onSuccessDone) onSuccessDone();
                else onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {actionLabel}
            </button>
          ) : isFailed ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-earth hover:bg-earth/90 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Dismiss
            </button>
          ) : (
            <div className="text-center text-xs text-muted">
              Do not close your browser tab while transaction is processing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
