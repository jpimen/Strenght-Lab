import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  delayIndex?: number;
}

export default function MetricCard({ title, value, trend, trendUp, icon: Icon, delayIndex = 0 }: MetricCardProps) {
  return (
    <div className="panel flex flex-col gap-4 animate-slideUp hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${(delayIndex + 1) * 50}ms` }}>
      <div className="flex justify-between items-start">
        <h3 className="text-gray-500 text-xs tracking-widest font-mono font-bold uppercase">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400 hover:scale-110 transition-transform duration-300" />
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tighter text-iron-900">{value}</div>
        {trend && (
          <div className={`text-xs font-bold mt-2 transition-all duration-300 ${trendUp ? 'text-green-600' : 'text-iron-red'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
}
