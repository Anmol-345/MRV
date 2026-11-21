'use client';

import React, { useState } from 'react';
import { useAccount, type Account } from '@gear-js/react-hooks';
import { Wallet, ChevronDown, Check, LogOut, Copy, ExternalLink, X, PlusCircle } from 'lucide-react';
import { truncateAddress } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';

export function WalletButton() {
  const { account, wallets, isAccountReady, login, logout } = useAccount();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);

  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const walletList = wallets ? Object.values(wallets) : [];
  const allAccounts: Account[] = walletList.flatMap((w) => w.accounts || []);

  const handleConnectWallet = async (walletId: string) => {
    const w = wallets?.[walletId];
    if (w) {
      setConnectingWalletId(walletId);
      try {
        await w.connect();
      } catch (err) {
        console.warn('Wallet connection error:', err);
      } finally {
        setConnectingWalletId(null);
      }
    }
  };

  if (!isAccountReady) {
    return (
      <div className="h-9 px-4 rounded-lg bg-forest/20 text-muted animate-pulse text-xs flex items-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {account ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 bg-white hover:bg-mist/50 border border-muted/20 text-ink text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-leaf" />
            <span className="font-mono">{truncateAddress(account.address)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-muted/20 shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-muted/10">
                <div className="font-semibold text-ink">{account.meta.name || 'Connected Wallet'}</div>
                <div className="font-mono text-muted text-[11px] truncate mt-0.5">{account.address}</div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-mist text-ink transition-colors text-left"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-leaf" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  <span>{copied ? 'Copied address!' : 'Copy address'}</span>
                </button>

                <a
                  href={`https://idea.gear-tech.io/programs?account=${account.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-mist text-ink transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted" />
                  <span>View in Gear Idea</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.nav.disconnect}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 bg-leaf hover:bg-leaf/90 text-white font-medium px-4 py-1.5 rounded-lg text-xs md:text-sm shadow-sm transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>{t.nav.connect}</span>
        </button>
      )}

      {/* Account selection modal */}
      {isOpen && !account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-muted/20 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-muted/10">
              <div className="font-serif font-bold text-lg text-ink">Connect Substrate Wallet</div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet Extensions List */}
            {walletList.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase text-muted tracking-wider">
                  Detected Extensions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {walletList.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleConnectWallet(w.id)}
                      disabled={connectingWalletId === w.id}
                      className="p-2.5 rounded-xl border border-muted/20 hover:border-forest hover:bg-mist/40 transition-colors flex items-center justify-between text-xs text-ink"
                    >
                      <span className="font-semibold capitalize truncate">{w.id.replace('-js', '')}</span>
                      {connectingWalletId === w.id ? (
                        <div className="w-3 h-3 rounded-full border border-forest border-t-transparent animate-spin" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5 text-muted" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase text-muted tracking-wider">
                Available Accounts
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {allAccounts.length > 0 ? (
                  allAccounts.map((acc: Account) => (
                    <button
                      key={acc.address}
                      type="button"
                      onClick={() => {
                        login(acc);
                        setIsOpen(false);
                      }}
                      className="w-full p-3 rounded-xl border border-muted/20 hover:border-leaf hover:bg-mist/50 transition-all flex items-center justify-between text-left group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-sm text-ink group-hover:text-forest">
                          {acc.meta.name || 'Substrate Account'}
                        </div>
                        <div className="font-mono text-xs text-muted truncate mt-0.5">
                          {acc.address}
                        </div>
                      </div>
                      <div className="text-[10px] bg-forest/10 text-forest font-medium px-2 py-0.5 rounded-full capitalize shrink-0">
                        {acc.meta.source || 'wallet'}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 space-y-2 bg-mist rounded-xl p-4">
                    <Wallet className="w-8 h-8 text-muted mx-auto" />
                    <div className="text-sm font-semibold text-ink">No Accounts Detected</div>
                    <p className="text-xs text-muted max-w-xs mx-auto">
                      Click one of the detected wallet extensions above to grant permission, or install SubWallet or Talisman.
                    </p>
                    <div className="flex justify-center gap-3 pt-2 text-xs text-forest font-medium">
                      <a
                        href="https://subwallet.app"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        SubWallet <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://talisman.xyz"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        Talisman <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
