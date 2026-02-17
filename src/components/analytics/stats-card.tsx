interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--muted)]">{title}</h3>
        {icon && <div className="text-[var(--accent)]">{icon}</div>}
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-[var(--muted)]">{subtitle}</p>
      )}
    </div>
  );
}
