import { useState } from 'react';
import { BarChart3, Calendar, Filter, Play } from 'lucide-react';
import clsx from 'clsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

/* ─── mock data ─── */
const kpis = [
  { label: 'TOTAL TONNAGE (MT)', value: '1,248.5', sub: '+12.4% VS PREV_MONTH', subType: 'up' as const },
  { label: 'AVG SESSION RPE', value: '7.8', sub: '— OPTIMAL_STRESS_ZONE', subType: 'neutral' as const },
  { label: 'NEW PRS RECORDED', value: '142', sub: '★ PEAK_PERFORMANCE_MATCH', subType: 'highlight' as const },
  { label: 'ACTIVE ATHLETES', value: '88', sub: '▲ 94% RETENTION_RATE', subType: 'up' as const },
];

const trajectoryData = [
  { name: 'WK_01', SQ: 120, BP: 80, DL: 95 },
  { name: 'WK_02', SQ: 125, BP: 82, DL: 100 },
  { name: 'WK_03', SQ: 135, BP: 90, DL: 110 },
  { name: 'WK_04', SQ: 130, BP: 85, DL: 105 },
  { name: 'WK_05', SQ: 140, BP: 88, DL: 108 },
  { name: 'WK_06', SQ: 138, BP: 92, DL: 112 },
  { name: 'WK_07', SQ: 145, BP: 95, DL: 115 },
  { name: 'WK_08', SQ: 155, BP: 100, DL: 125 },
  { name: 'WK_09', SQ: 160, BP: 105, DL: 130, isPeak: true },
  { name: 'WK_10', SQ: 175, BP: 110, DL: 142 },
  { name: 'WK_11', SQ: 180, BP: 108, DL: 145 },
  { name: 'WK_12', SQ: 190, BP: 115, DL: 150 },
];

const movementData = [
  { name: 'SQUAT_VARIATIONS', value: 42, color: '#dc2626' },
  { name: 'HINGE_PATTERNS', value: 28, color: '#111111' },
  { name: 'PUSH_HORIZONTAL', value: 15, color: '#6b7280' },
  { name: 'ACCESSORY_LOAD', value: 15, color: '#9ca3af' },
];

interface AthleteEntry {
  rank: string;
  name: string;
  program: string;
  consistency: ('red' | 'gray')[];
}

const athleteConsistency: AthleteEntry[] = [
  { rank: '01', name: 'MILLER, MARCUS', program: 'PEAKING_V2', consistency: ['red', 'red', 'red', 'red', 'red'] },
  { rank: '02', name: 'CHEN, SARAH', program: 'INT_STR_B', consistency: ['red', 'red', 'red', 'gray', 'gray'] },
  { rank: '03', name: 'WALTERS, JAKE', program: 'OFF_SEASON_1', consistency: ['red', 'red', 'gray', 'gray', 'red'] },
];

const filters = ['LAST_30_DAYS', 'TEAM: ALL_UNITS', 'PROG: HYPERTROPHY_B'];

/* ─── custom tooltip ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-iron-900 text-white text-[11px] font-mono px-3 py-2 shadow-md border border-iron-800">
      <div className="tracking-widest mb-1 text-gray-400">{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.dataKey}</span>
          <span className="text-white font-bold">{p.value} kg</span>
        </div>
      ))}
    </div>
  );
}

/* ─── component ─── */
export default function AnalyticsView() {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-16 bg-iron-red mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-5xl font-black text-iron-900 tracking-tighter leading-[0.95] uppercase">
              SYSTEM<br />ANALYTICS
            </h2>
            <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] mt-2">
              REAL-TIME PERFORMANCE AGGREGATION // v4.0.2
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiveFilter(i)}
              className={clsx(
                'text-[10px] font-mono font-bold tracking-widest px-3 py-2 border transition-colors flex items-center gap-2',
                activeFilter === i
                  ? 'bg-iron-900 text-white border-iron-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-iron-900'
              )}
            >
              {i === 0 && <Calendar className="w-3 h-3" />}
              {f}
            </button>
          ))}
          <button className="bg-iron-red text-white text-[10px] font-mono font-bold tracking-widest px-4 py-2 hover:bg-red-700 transition-colors flex items-center gap-2 uppercase">
            <Play className="w-3 h-3" fill="white" />
            EXECUTE_QUERY
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="panel animate-slide-up opacity-0 hover:shadow-md transition-shadow"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
          >
            <h3 className="text-[10px] font-mono font-bold tracking-[0.1em] text-gray-400 uppercase mb-6">
              {kpi.label}
            </h3>
            <div className="text-5xl font-black tracking-tighter text-iron-900 mb-3">
              {kpi.value}
            </div>
            <div className={clsx(
              'text-[10px] font-mono font-bold tracking-widest uppercase',
              kpi.subType === 'up' ? 'text-green-600' :
              kpi.subType === 'highlight' ? 'text-iron-red' :
              'text-gray-400'
            )}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Aggregated Strength Trajectory (Bar Chart) ── */}
      <div
        className="panel animate-slide-up opacity-0"
        style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
      >
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase font-mono">
              AGGREGATED_STRENGTH_TRAJECTORY
            </h3>
            <p className="text-[10px] font-mono text-gray-400 tracking-widest mt-1 uppercase">
              MEAN 1RM ESTIMATION (KG) • LAST 12 WEEKS
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono font-bold tracking-widest">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-iron-red inline-block" /> SQ</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-iron-900 inline-block" /> BP</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 inline-block" /> DL</span>
          </div>
        </div>

        <div className="h-[320px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trajectoryData} barGap={1} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }}
                domain={[0, 'dataMax + 20']}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="SQ" fill="#dc2626" animationDuration={1200} radius={[1, 1, 0, 0]}>
                {trajectoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.isPeak ? '#dc2626' : '#e5e7eb'} />
                ))}
                <LabelList
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  dataKey={(entry: any) => entry.isPeak ? 'PEAK' : null}
                  position="top"
                  style={{ fontSize: 9, fill: '#dc2626', fontWeight: 800, fontFamily: 'monospace' }}
                  offset={8}
                />
              </Bar>
              <Bar dataKey="BP" fill="#111111" animationDuration={1200} animationBegin={200} radius={[1, 1, 0, 0]}>
                {trajectoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.isPeak ? '#111111' : '#d1d5db'} />
                ))}
              </Bar>
              <Bar dataKey="DL" fill="#9ca3af" animationDuration={1200} animationBegin={400} radius={[1, 1, 0, 0]}>
                {trajectoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.isPeak ? '#9ca3af' : '#f3f4f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Movement Distribution + Athlete Consistency ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Movement Distribution */}
        <div
          className="col-span-12 lg:col-span-5 panel animate-slide-up opacity-0"
          style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-iron-900" />
              MOVEMENT_DISTRIBUTION
            </h3>
            <span className="badge badge-outline">BY_TOTAL_REPS</span>
          </div>

          <div className="space-y-5">
            {movementData.map((item, i) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-iron-900">{item.name}</span>
                  <span className="text-[11px] font-mono font-bold text-gray-500">{item.value}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 w-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                      animation: `barGrow 1s ease-out ${i * 150}ms both`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Athlete Consistency */}
        <div
          className="col-span-12 lg:col-span-7 panel animate-slide-up opacity-0"
          style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase font-mono flex items-center gap-2">
              <Filter className="w-4 h-4 text-iron-900" />
              ATHLETE_CONSISTENCY
            </h3>
            <span className="badge badge-outline">TOP_5_UNITS</span>
          </div>

          <div className="divide-y divide-gray-100">
            {athleteConsistency.map((a, i) => (
              <div
                key={a.rank}
                className="flex items-center gap-4 py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors cursor-pointer"
              >
                <div className={clsx(
                  'w-9 h-9 flex items-center justify-center text-xs font-mono font-bold tracking-wider flex-shrink-0',
                  i === 0 ? 'bg-iron-red text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'
                )}>
                  {a.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black tracking-tight text-iron-900 uppercase truncate">{a.name}</div>
                  <div className="text-[10px] font-mono text-gray-400 tracking-widest">PROGRAM: {a.program}</div>
                </div>
                <div className="flex gap-1">
                  {a.consistency.map((c, ci) => (
                    <div
                      key={ci}
                      className={clsx(
                        'w-5 h-5',
                        c === 'red' ? 'bg-iron-red' : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Generate Report FAB */}
          <div className="mt-4 flex justify-end">
            <button className="bg-iron-900 text-white uppercase text-[10px] font-mono font-bold py-3 px-5 hover:bg-iron-800 transition-colors flex items-center gap-2 tracking-widest shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              + GENERATE_REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
