import React from 'react';
import { Trees, Waves, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface EcosystemBadgeProps {
  ecosystem: 'Mangrove' | 'Seagrass' | 'SaltMarsh' | string;
  size?: 'sm' | 'md';
}

export function EcosystemBadge({ ecosystem, size = 'md' }: EcosystemBadgeProps) {
  const { t } = useI18n();

  const config = {
    Mangrove: {
      label: t.ecosystem.Mangrove,
      icon: Trees,
      classes: 'bg-forest/15 text-forest border-forest/30',
    },
    Seagrass: {
      label: t.ecosystem.Seagrass,
      icon: Waves,
      classes: 'bg-teal/15 text-teal border-teal/30',
    },
    SaltMarsh: {
      label: t.ecosystem.SaltMarsh,
      icon: ShieldCheck,
      classes: 'bg-leaf/15 text-leaf border-leaf/30',
    },
  }[ecosystem] || {
    label: ecosystem,
    icon: Trees,
    classes: 'bg-muted/15 text-muted border-muted/30',
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${config.classes}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
