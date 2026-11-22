'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Trees, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { ProjectCard, ProjectCardData } from '@/components/projects/project-card';
import { useI18n } from '@/lib/i18n';

export default function ProjectsPage() {
  const { t } = useI18n();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [total, setTotal] = useState(0);

  const states = ['ALL', 'WB', 'GJ', 'TN', 'KL', 'MH', 'AP', 'OR', 'GA'];
  const ecosystems = ['ALL', 'Mangrove', 'Seagrass', 'SaltMarsh'];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedEcosystem !== 'ALL') params.set('ecosystem', selectedEcosystem);
    if (selectedState !== 'ALL') params.set('state', selectedState);

    fetch(`/api/projects?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items) {
          setProjects(data.items);
          setTotal(data.total || data.items.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedEcosystem, selectedState]);

  const filteredProjects = projects.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.stateCode.toLowerCase().includes(term);
  });

  return (
    <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex flex-col gap-8">
      {/* Nature Banner Header */}
      <section className="relative rounded-2xl overflow-hidden bg-deep-canopy text-on-deep-canopy p-6 sm:p-10 shadow-lg border border-outline-variant/60">
        {/* Background Nature Imagery - Mangrove Forest Canals */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1600&q=80"
          alt="Aerial view of coastal mangrove delta"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-canopy/95 via-deep-canopy/85 to-deep-canopy/65" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card/15 backdrop-blur-md border border-on-deep-canopy/20 text-xs font-semibold text-shoot-lime">
              <Trees className="w-3.5 h-3.5" />
              <span>ON-CHAIN REGISTRY • SENTINEL-2 VERIFIED</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-deep-canopy tracking-tight">
              Coastal Blue Carbon Projects
            </h1>
            <p className="font-body text-sm sm:text-base text-on-deep-canopy/85 leading-relaxed">
              Explore verified blue carbon restoration and conservation projects registered on the Vara blockchain registry across India&apos;s coastline.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-surface-card/10 backdrop-blur-md border border-on-deep-canopy/20 rounded-xl px-4 py-2.5 text-center">
              <span className="block font-headline text-2xl font-bold text-shoot-lime tabular-nums">
                {total || projects.length}
              </span>
              <span className="block font-label text-[11px] text-on-deep-canopy/75 uppercase tracking-wider">
                Sanctuaries
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-surface-card p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-[0_4px_20px_rgba(27,56,43,0.04)] flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-botanical-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.common?.search || 'Search projects by name, state...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-outline-variant/60 bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>

          {/* Ecosystem Filter */}
          <div className="flex items-center gap-2 overflow-x-auto sm:col-span-2">
            <span className="text-xs text-botanical-muted font-semibold shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Ecosystem:</span>
            </span>
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {ecosystems.map((eco) => (
                <button
                  key={eco}
                  type="button"
                  onClick={() => setSelectedEcosystem(eco)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedEcosystem === eco
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {eco === 'ALL' ? (t.common?.all || 'All Ecosystems') : eco}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* State Filter Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/50 overflow-x-auto text-xs">
          <span className="text-botanical-muted font-semibold shrink-0">State / UT:</span>
          <div className="flex gap-1.5 overflow-x-auto py-0.5">
            {states.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedState === st
                    ? 'bg-living-leaf text-on-living-leaf shadow-sm'
                    : 'bg-surface-container-low text-botanical-muted hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <div className="text-xs text-botanical-muted font-medium">{t.common?.loading || 'Loading projects...'}</div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs text-botanical-muted font-semibold">
            Showing {filteredProjects.length} of {total} registered projects
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id.toString()} project={project} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface-card rounded-2xl border border-outline-variant/60 p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-botanical-muted mx-auto" />
          <div className="font-headline font-bold text-lg text-on-surface">No matching projects found</div>
          <p className="text-xs text-botanical-muted max-w-sm mx-auto">
            Try adjusting your search terms, ecosystem filter, or state selector to explore other projects.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedEcosystem('ALL');
              setSelectedState('ALL');
            }}
            className="text-xs font-semibold text-primary hover:underline pt-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}
