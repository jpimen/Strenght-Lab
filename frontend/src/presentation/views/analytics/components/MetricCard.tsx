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
  const delayClass = `delay-${delayIndex * 100}`;
  
  return (
    <div className={`panel flex flex-col gap-4 animate-slide-up opacity-0 ${delayClass} transition-shadow hover:shadow-md cursor-default`}>
      <div className="flex justify-between items-start">
        <h3 className="text-gray-500 text-xs tracking-widest">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tighter text-iron-900">{value}</div>
        {trend && (
          <div className={`text-xs font-bold mt-2 ${trendUp ? 'text-green-600' : 'text-iron-red'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
}
