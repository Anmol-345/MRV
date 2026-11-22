import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { EcosystemBadge } from '@/components/ui/ecosystem-badge';
import { formatBlu, formatNumber } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n';

export interface ProjectCardData {
  id: string | bigint;
  name: string;
  ecosystem: 'Mangrove' | 'Seagrass' | 'SaltMarsh' | string;
  stateCode: string;
  areaHa: number | string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Closed' | string;
  totalMinted: string | bigint;
  totalRetired: string | bigint;
  beneficiaries?: Array<{ shareBps: number; displayName?: string | null }>;
}

const ECOSYSTEM_IMAGES: Record<string, string> = {
  Mangrove:
    'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=800&q=80',
  Seagrass:
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  SaltMarsh:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const { t } = useI18n();
  const idStr = project.id.toString();

  const statusConfig = {
    Active: {
      label: t.status?.Active || 'Active',
      icon: CheckCircle2,
      classes: 'text-living-leaf bg-living-leaf-container border-living-leaf/25',
    },
    Pending: {
      label: t.status?.Pending || 'Pending',
      icon: Clock,
      classes: 'text-rhizome-earth bg-rhizome-earth-container border-rhizome-earth/25',
    },
    Suspended: {
      label: t.status?.Suspended || 'Suspended',
      icon: AlertTriangle,
      classes: 'text-error bg-error-container border-error/30',
    },
  }[project.status] || {
    label: project.status,
    icon: Clock,
    classes: 'text-botanical-muted bg-surface-container-low border-outline-variant/60',
  };

  const StatusIcon = statusConfig.icon;
  const imageUrl =
    ECOSYSTEM_IMAGES[project.ecosystem] ||
    'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-surface-card rounded-2xl border border-outline-variant/60 shadow-[0_4px_20px_rgba(27,56,43,0.04)] hover:shadow-lg hover:border-primary/40 transition-all duration-surface-enter overflow-hidden flex flex-col group relative">
      {/* Nature & Mangrove Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-deep-canopy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-canopy/70 via-transparent to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <EcosystemBadge ecosystem={project.ecosystem} size="sm" />
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${statusConfig.classes}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-white/95 font-medium">
          <MapPin className="w-3.5 h-3.5 text-shoot-lime" />
          <span>India • {project.stateCode}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pb-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {project.name}
          </h3>
        </div>

        {/* Project Stats Summary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/50 text-xs">
          <div className="bg-surface-container-low p-2.5 rounded-xl">
            <span className="text-[10px] text-botanical-muted block uppercase font-label font-semibold">Area</span>
            <span className="font-semibold text-on-surface text-sm tabular-nums">
              {formatNumber(project.areaHa)} ha
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl">
            <span className="text-[10px] text-botanical-muted block uppercase font-label font-semibold">Verified</span>
            <span className="font-semibold text-primary text-sm tabular-nums">
              {formatBlu(project.totalMinted)} BLU
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Link */}
      <div className="px-5 py-3.5 bg-surface-container-low border-t border-outline-variant/50 flex items-center justify-between text-xs font-semibold text-primary group-hover:bg-primary-container transition-colors">
        <span>{t.common?.viewDetails || 'View Project & Satellite MRV'}</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>

      <Link href={`/projects/${idStr}`} className="absolute inset-0">
        <span className="sr-only">View {project.name}</span>
      </Link>
    </div>
  );
}
