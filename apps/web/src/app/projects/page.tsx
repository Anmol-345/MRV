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
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-forest">
          On-chain Registry
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
          Coastal Blue Carbon Projects
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          Browse verified blue carbon conservation and restoration projects registered on the Vara blockchain registry across India&apos;s coastline.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-muted/20 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.common.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-muted/20 bg-mist/30 focus:outline-none focus:ring-1 focus:ring-forest text-ink"
            />
          </div>

          {/* Ecosystem Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto sm:col-span-2">
            <span className="text-xs text-muted font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Ecosystem:</span>
            </span>
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {ecosystems.map((eco) => (
                <button
                  key={eco}
                  type="button"
                  onClick={() => setSelectedEcosystem(eco)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    selectedEcosystem === eco
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-mist text-muted hover:text-ink hover:bg-mist/80'
                  }`}
                >
                  {eco === 'ALL' ? t.common.all : eco}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* State Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-muted/10 overflow-x-auto text-xs">
          <span className="text-muted font-medium shrink-0">State / UT:</span>
          <div className="flex gap-1 overflow-x-auto">
            {states.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedState === st
                    ? 'bg-leaf text-white'
                    : 'text-muted hover:text-ink hover:bg-mist'
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
          <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin mx-auto" />
          <div className="text-xs text-muted font-medium">{t.common.loading}</div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-6">
          <div className="text-xs text-muted font-medium">
            Showing {filteredProjects.length} of {total} registered projects
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id.toString()} project={project} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-muted/20 p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-muted mx-auto" />
          <div className="font-serif font-bold text-lg text-ink">No matching projects found</div>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try adjusting your search terms, ecosystem filter, or state selector to explore other projects.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedEcosystem('ALL');
              setSelectedState('ALL');
            }}
            className="text-xs font-semibold text-forest hover:underline pt-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}
