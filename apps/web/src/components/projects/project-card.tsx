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

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const { t } = useI18n();
  const idStr = project.id.toString();

  const statusConfig = {
    Active: {
      label: t.status.Active,
      icon: CheckCircle2,
      classes: 'text-leaf bg-leaf/10 border-leaf/20',
    },
    Pending: {
      label: t.status.Pending,
      icon: Clock,
      classes: 'text-earth bg-earth/10 border-earth/20',
    },
    Suspended: {
      label: t.status.Suspended,
      icon: AlertTriangle,
      classes: 'text-red-600 bg-red-50 border-red-200',
    },
  }[project.status] || {
    label: project.status,
    icon: Clock,
    classes: 'text-muted bg-muted/10 border-muted/20',
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-2xl border border-muted/20 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      {/* Top Banner */}
      <div className="p-5 pb-4 space-y-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <EcosystemBadge ecosystem={project.ecosystem} size="sm" />
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.classes}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs text-muted font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-forest" />
            <span>India · {project.stateCode}</span>
          </div>
          <h3 className="font-serif font-bold text-lg text-ink group-hover:text-forest transition-colors line-clamp-2">
            {project.name}
          </h3>
        </div>

        {/* Project Stats Summary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-muted/10 text-xs">
          <div className="bg-mist/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-muted block uppercase font-medium">Area</span>
            <span className="font-semibold text-ink">{formatNumber(project.areaHa)} ha</span>
          </div>
          <div className="bg-mist/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-muted block uppercase font-medium">Minted</span>
            <span className="font-semibold text-forest">{formatBlu(project.totalMinted)} BLU</span>
          </div>
        </div>
      </div>

      {/* Card Action Link */}
      <div className="px-5 py-3.5 bg-mist/30 border-t border-muted/15 flex items-center justify-between text-xs font-semibold text-forest group-hover:bg-forest/10 transition-colors">
        <span>{t.common.viewDetails}</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>

      <Link href={`/projects/${idStr}`} className="absolute inset-0">
        <span className="sr-only">View {project.name}</span>
      </Link>
    </div>
  );
}
