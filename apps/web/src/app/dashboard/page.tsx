'use client';

import React from 'react';
import Link from 'next/link';
import { Trees, ShieldCheck, Users, ShoppingCart, Sliders, ArrowRight } from 'lucide-react';

export default function DashboardHubPage() {
  const portals = [
    {
      title: 'Project Developer Portal',
      description: 'Register coastal restoration projects, monitor satellite NDVI health, and submit periodic MRV reports.',
      href: '/dashboard/owner',
      icon: <Trees className="w-6 h-6 text-forest" />,
      tag: 'Developer',
    },
    {
      title: 'Accredited Verifier Queue',
      description: 'Audit submitted MRV evidence bundles, run automated integrity checks, and cast consensus quorum votes.',
      href: '/dashboard/verifier',
      icon: <ShieldCheck className="w-6 h-6 text-teal" />,
      tag: 'Verifier',
    },
    {
      title: 'Community Panchayat Portal',
      description: 'Track community revenue shares from marketplace credit sales and execute pull-payment claims.',
      href: '/dashboard/community',
      icon: <Users className="w-6 h-6 text-leaf" />,
      tag: 'Community',
    },
    {
      title: 'Carbon Credit Marketplace',
      description: 'Browse active verified credit listings, purchase tokens, or permanently retire credits for GHG offsetting.',
      href: '/market',
      icon: <ShoppingCart className="w-6 h-6 text-earth" />,
      tag: 'Buyer',
    },
    {
      title: 'Protocol Administration',
      description: 'Manage protocol parameters, assign verifier accreditations, and operate the emergency circuit breaker.',
      href: '/admin',
      icon: <Sliders className="w-6 h-6 text-deep-green" />,
      tag: 'Admin',
    },
  ];

  return (
    <main className="flex-1 bg-mist/30 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-forest">
            Role-Aware Portals
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink">
            BluToken Platform Portals
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            Select your organization portal to access customized workflows for project developers, accredited scientific verifiers, coastal community panchayats, and carbon buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="bg-white p-6 rounded-3xl border border-muted/20 shadow-sm hover:shadow-md hover:border-forest/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-mist flex items-center justify-center">
                    {portal.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-mist text-ink">
                    {portal.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl text-ink group-hover:text-forest transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed">
                    {portal.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center text-xs font-bold text-forest group-hover:translate-x-1 transition-transform">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
