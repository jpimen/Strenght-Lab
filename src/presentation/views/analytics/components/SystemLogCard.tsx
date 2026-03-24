import { useState } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const logs: LogEntry[] = [
  { id: '001', timestamp: '19:21:04', message: 'Program "Peak Strength 12W" compiled successfully', type: 'success' },
  { id: '002', timestamp: '19:18:32', message: 'Athlete sync completed — 24 profiles updated', type: 'success' },
  { id: '003', timestamp: '19:15:11', message: 'RPE calibration drift detected for athlete #A-0042', type: 'warning' },
  { id: '004', timestamp: '19:12:45', message: 'Failed to export session data — timeout after 30s', type: 'error' },
  { id: '005', timestamp: '19:10:00', message: 'New mesocycle template "Hypertrophy V3" saved to vault', type: 'info' },
  { id: '006', timestamp: '19:08:22', message: 'Auto-regulation engine recalibrated for 12 athletes', type: 'success' },
  { id: '007', timestamp: '19:05:58', message: 'Session volume threshold exceeded for athlete #A-0017', type: 'warning' },
  { id: '008', timestamp: '19:02:30', message: 'Database backup completed — 142MB archived', type: 'success' },
];

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Terminal,
};

const colorMap = {
  success: 'text-green-600',
  warning: 'text-amber-500',
  error: 'text-iron-red',
  info: 'text-gray-500',
};

const bgMap = {
  success: 'bg-green-50',
  warning: 'bg-amber-50',
  error: 'bg-red-50',
  info: 'bg-gray-50',
};

export default function SystemLogCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="panel animate-slide-up opacity-0 delay-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-iron-900 text-sm tracking-widest font-bold">SYSTEM LOG</h3>
        <div className="flex gap-2">
          <span className="badge badge-green">OPERATIONAL</span>
          <span className="badge badge-outline">LIVE</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {logs.map((log, i) => {
          const Icon = iconMap[log.type];
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              onClick={() => setExpandedId(isExpanded ? null : log.id)}
              className={clsx(
                'flex items-start gap-3 py-3 px-3 -mx-3 cursor-pointer transition-all duration-200 group',
                isExpanded ? bgMap[log.type] : 'hover:bg-gray-50'
              )}
              style={{ animationDelay: `${600 + i * 60}ms` }}
            >
              <Icon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', colorMap[log.type])} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-gray-400 flex-shrink-0">{log.timestamp}</span>
                  <span className="text-xs text-iron-900 truncate">{log.message}</span>
                </div>
                {isExpanded && (
                  <div className="mt-2 text-[11px] text-gray-500 font-mono animate-fade-in">
                    <span className="text-gray-400">EVENT_ID:</span> SYS-{log.id} &nbsp;|&nbsp;
                    <span className="text-gray-400">TYPE:</span> {log.type.toUpperCase()} &nbsp;|&nbsp;
                    <span className="text-gray-400">SOURCE:</span> CORE_ENGINE
                  </div>
                )}
              </div>
              <ChevronRight className={clsx(
                'w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
