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
import { useAnalyticsViewModel } from '../../viewmodels/useAnalyticsViewModel';

const filters = ['LAST_30_DAYS', 'TEAM: LIVE_DATA', 'SOURCE: SESSION_LOGS'];

function buildKpis(data: NonNullable<ReturnType<typeof useAnalyticsViewModel>['data']>) {
  return [
    {
      label: 'TOTAL TONNAGE (KG)',
      value: data.metrics.totalTonnageKg.toLocaleString(),
      sub: `${data.metrics.activeAthletes} ATHLETES TRACKED`,
      subType: 'up' as const,
    },
    {
      label: 'AVG SESSION RPE',
      value: data.metrics.avgSessionRpe.toFixed(1),
      sub: data.metrics.avgSessionRpe >= 8.5 ? 'HIGH_STRESS_ZONE' : 'CONTROLLED_LOADING',
      subType: data.metrics.avgSessionRpe >= 8.5 ? 'highlight' as const : 'neutral' as const,
    },
    {
      label: 'NEW PRS RECORDED',
      value: data.metrics.newPrsRecorded.toString(),
      sub: data.metrics.newPrsRecorded > 0 ? 'LIVE_FROM_SET_LOGS' : 'NO_NEW_PRS_LOGGED',
      subType: data.metrics.newPrsRecorded > 0 ? 'highlight' as const : 'neutral' as const,
    },
    {
      label: 'ACTIVE ATHLETES',
      value: data.metrics.activeAthletes.toString(),
      sub: `${data.athleteConsistency.length} SHOWN_IN_CONSISTENCY`,
      subType: 'up' as const,
    },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-iron-900 text-white text-[11px] font-mono px-3 py-2 shadow-md border border-iron-800">
      <div className="tracking-widest mb-1 text-gray-400">{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((point: any) => (
        <div key={point.dataKey} className="flex justify-between gap-4">
          <span style={{ color: point.color }}>{point.dataKey}</span>
          <span className="text-white font-bold">{point.value} kg</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsView() {
  const [activeFilter, setActiveFilter] = useState(0);
  const { data, isLoading, error } = useAnalyticsViewModel();

  if (isLoading) return <div className="p-8 text-iron-red animate-pulse">LOADING_ANALYTICS_STREAM...</div>;
  if (error || !data) return <div className="p-8 text-red-600">ANALYTICS_STREAM_UNAVAILABLE</div>;

  const kpis = buildKpis(data);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2 animate-slideDown">
        <div className="flex items-start gap-3 animate-slideRight delay-100">
          <div className="w-1.5 h-16 bg-iron-red mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-5xl font-black text-iron-900 tracking-tighter leading-[0.95] uppercase">
              SYSTEM
              <br />
              ANALYTICS
            </h2>
            <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] mt-2">
              LIVE PERFORMANCE AGGREGATION // SESSION-DRIVEN
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 animate-slideUp delay-150">
          {filters.map((filter, index) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(index)}
              className={clsx(
                'text-[10px] font-mono font-bold tracking-widest px-3 py-2 border transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:scale-105 active:scale-95',
                activeFilter === index
                  ? 'bg-iron-900 text-white border-iron-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-iron-900'
              )}
            >
              {index === 0 && <Calendar className="w-3 h-3" />}
              {filter}
            </button>
          ))}
          <button className="bg-iron-red text-white text-[10px] font-mono font-bold tracking-widest px-4 py-2 hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 uppercase">
            <Play className="w-3 h-3" fill="white" />
            LIVE_QUERY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.label}
            className="panel animate-slideUp hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${(index + 2) * 50}ms` }}
          >
            <h3 className="text-[10px] font-mono font-bold tracking-[0.1em] text-gray-400 uppercase mb-6">
              {kpi.label}
            </h3>
            <div className="text-5xl font-black tracking-tighter text-iron-900 mb-3">
              {kpi.value}
            </div>
            <div
              className={clsx(
                'text-[10px] font-mono font-bold tracking-widest uppercase',
                kpi.subType === 'up'
                  ? 'text-green-600'
                  : kpi.subType === 'highlight'
                    ? 'text-iron-red'
                    : 'text-gray-400'
              )}
            >
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="panel animate-slideUp delay-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase font-mono">
              AGGREGATED_STRENGTH_TRAJECTORY
            </h3>
            <p className="text-[10px] font-mono text-gray-400 tracking-widest mt-1 uppercase">
              BEST ESTIMATED 1RM (KG) • LAST 12 WEEKS
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
            <BarChart data={data.trajectoryData} barGap={1} barCategoryGap="20%">
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
                {data.trajectoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.isPeak ? '#dc2626' : '#e5e7eb'} />
                ))}
                <LabelList
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  dataKey={(entry: any) => (entry.isPeak ? 'PEAK' : null)}
                  position="top"
                  style={{ fontSize: 9, fill: '#dc2626', fontWeight: 800, fontFamily: 'monospace' }}
                  offset={8}
                />
              </Bar>
              <Bar dataKey="BP" fill="#111111" animationDuration={1200} animationBegin={200} radius={[1, 1, 0, 0]}>
                {data.trajectoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.isPeak ? '#111111' : '#d1d5db'} />
                ))}
              </Bar>
              <Bar dataKey="DL" fill="#9ca3af" animationDuration={1200} animationBegin={400} radius={[1, 1, 0, 0]}>
                {data.trajectoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.isPeak ? '#9ca3af' : '#f3f4f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 panel animate-slideUp delay-350 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-iron-900" />
              MOVEMENT_DISTRIBUTION
            </h3>
            <span className="badge badge-outline">BY_TOTAL_REPS</span>
          </div>

          <div className="space-y-5">
            {data.movementDistribution.map((item, index) => (
              <div key={item.name} style={{ animationDelay: `${(index + 7) * 50}ms` }} className="animate-slideUp">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-iron-900">{item.name}</span>
                  <span className="text-[11px] font-mono font-bold text-gray-500">{item.value}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 w-full overflow-hidden rounded">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                      animation: `barGrow 1s ease-out ${index * 150}ms both`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 panel animate-slideUp delay-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase font-mono flex items-center gap-2">
              <Filter className="w-4 h-4 text-iron-900" />
              ATHLETE_CONSISTENCY
            </h3>
            <span className="badge badge-outline">LAST_5_WEEKS</span>
          </div>

          {data.athleteConsistency.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.athleteConsistency.map((athlete, index) => (
                <div
                  key={`${athlete.rank}-${athlete.name}`}
                  style={{ animationDelay: `${(index + 11) * 50}ms` }}
                  className="flex items-center gap-4 py-4 hover:bg-gray-50 -mx-6 px-6 transition-all duration-200 cursor-pointer animate-fadeIn"
                >
                  <div
                    className={clsx(
                      'w-9 h-9 flex items-center justify-center text-xs font-mono font-bold tracking-wider flex-shrink-0 transition-all duration-300',
                      index === 0 ? 'bg-iron-red text-white' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:shadow-md hover:scale-110'
                    )}
                  >
                    {athlete.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black tracking-tight text-iron-900 uppercase truncate">{athlete.name}</div>
                    <div className="text-[10px] font-mono text-gray-400 tracking-widest">PROGRAM: {athlete.program}</div>
                  </div>
                  <div className="flex gap-1">
                    {athlete.consistency.map((status, consistencyIndex) => (
                      <div
                        key={consistencyIndex}
                        className={clsx(
                          'w-5 h-5 transition-all duration-300 hover:scale-125',
                          status === 'red' ? 'bg-iron-red' : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-40 flex items-center justify-center text-[11px] font-mono font-bold tracking-widest text-gray-400 uppercase">
              NO_ATHLETE_CONSISTENCY_DATA_AVAILABLE
            </div>
          )}

          <div className="mt-4 flex justify-end animate-slideUp delay-500">
            <button className="bg-iron-900 text-white uppercase text-[10px] font-mono font-bold py-3 px-5 hover:bg-iron-800 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 tracking-widest shadow-lg">
              + EXPORT_LIVE_REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
