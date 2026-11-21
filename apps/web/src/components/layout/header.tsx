'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Waves, Menu, X, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { WalletButton } from '@/components/wallet/wallet-button';
import { NetworkBadge } from '@/components/network/network-badge';

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/projects', label: t.nav.projects },
    { href: '/market', label: t.nav.market },
    { href: '/audit', label: t.nav.audit },
  ];

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-deep-green flex items-center justify-center text-lime shadow-sm group-hover:scale-105 transition-transform">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-deep-green tracking-tight leading-none">
              BluToken
            </div>
            <div className="text-[10px] text-muted font-medium tracking-wider uppercase mt-0.5">
              India MRV Registry
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest/10 text-forest'
                    : 'text-ink hover:text-forest hover:bg-mist/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-muted/20 hover:bg-mist/60 text-xs font-medium text-ink transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span>{locale === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          <NetworkBadge />
          <WalletButton />
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-1.5 rounded-lg border border-muted/20 text-xs font-semibold text-ink"
          >
            {locale === 'en' ? 'हिन्दी' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-ink hover:bg-mist"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-muted/20 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-mist hover:text-forest"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-muted/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Network Status:</span>
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
