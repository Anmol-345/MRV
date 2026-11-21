import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'forest' | 'teal' | 'leaf' | 'earth';
}

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  variant = 'forest',
}: StatCardProps) {
  const variantStyles = {
    forest: 'bg-forest/10 text-forest border-forest/20',
    teal: 'bg-teal/10 text-teal border-teal/20',
    leaf: 'bg-leaf/10 text-leaf border-leaf/20',
    earth: 'bg-earth/10 text-earth border-earth/20',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-muted/20 shadow-sm hover:shadow-md transition-shadow space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{title}</span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${variantStyles[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight flex items-baseline gap-1.5">
          <span>{value}</span>
          {unit && <span className="text-sm font-sans font-medium text-muted">{unit}</span>}
        </div>
        {subtitle && <p className="text-[11px] text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
