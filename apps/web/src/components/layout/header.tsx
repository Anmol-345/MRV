'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { WalletButton } from '@/components/wallet/wallet-button';
import { NetworkBadge } from '@/components/network/network-badge';

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/projects', label: 'Projects' },
    { href: '/market', label: 'Marketplace' },
    { href: '/report-threat', label: 'Citizen PWA' },
    { href: '/audit', label: 'Audit Trail' },
    { href: '/dashboard/gov', label: 'Governance' },
  ];

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-surface-card/85 border-b border-outline-variant/60">
      <div className="max-w-[1280px] mx-auto px-gutter-md sm:px-gutter-xl h-20 flex items-center justify-between gap-gutter-lg">
        {/* Brand Logo: Stylized Mangrove Stilt Root + Blockchain Node */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-md bg-deep-canopy flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path
                d="M14 5V15M14 15C14 19 9 21 6 24M14 15C14 19 19 21 22 24M14 15V24"
                stroke="#8FB855"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="5" r="2.5" fill="#8FB855" />
              <circle cx="6" cy="24" r="1.8" fill="#FFFFFF" />
              <circle cx="14" cy="24" r="1.8" fill="#FFFFFF" />
              <circle cx="22" cy="24" r="1.8" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-title-lg text-deep-canopy leading-none">BluToken</span>
            <span className="font-label text-label-sm text-botanical-muted">National Blue Carbon Registry</span>
          </div>
        </Link>

        {/* Center Navigation Pills */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/50">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-label-md font-label transition-colors duration-state-change ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface hover:bg-surface-card'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/60 hover:bg-surface-container-low text-label-sm font-label text-on-surface transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-botanical-muted" />
            <span>{locale === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          <NetworkBadge />
          <WalletButton />
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full border border-outline-variant/60 text-label-sm font-label text-on-surface"
          >
            {locale === 'en' ? 'हिन्दी' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-on-surface hover:bg-surface-container-low"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant/60 bg-surface-card px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-body-md font-body text-on-surface hover:bg-surface-container-low hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-outline-variant/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-body-md">
              <span className="text-botanical-muted text-label-sm font-label">Network:</span>
              <NetworkBadge />
            </div>
            <div className="pt-1">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
