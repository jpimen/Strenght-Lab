import { useAthleteViewModel } from '../../viewmodels/useAthleteViewModel';
import { CloudDownload, Plus, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

// Mock chart data matching the trajectory shown in Image 2
const chartData = [
  { name: 'JAN', squat: 200, bench: 120, deadlift: 220 },
  { name: 'FEB', squat: 210, bench: 125, deadlift: 235 },
  { name: 'MAR', squat: 215, bench: 125, deadlift: 240 },
  { name: 'APR', squat: 230, bench: 130, deadlift: 255 },
  { name: 'MAY', squat: 245, bench: 135, deadlift: 270 },
  { name: 'JUN', squat: 250, bench: 140, deadlift: 280 },
  { name: 'JUL', squat: 265, bench: 140, deadlift: 295 },
  { name: 'AUG', squat: 275, bench: 145, deadlift: 310 },
  { name: 'SEP', squat: 285, bench: 145, deadlift: 315 },
];

export default function AthleteView() {
  const { data, isLoading } = useAthleteViewModel();

  if (isLoading || !data) return <div className="p-8 text-iron-red animate-pulse">LOADING_ATHLETE_DATA...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header Panel */}
      <div className="bg-white border-y sm:border border-gray-200 shadow-sm flex flex-col lg:flex-row pb-0">
        <div className="w-full lg:w-1/3 bg-gray-900 aspect-[4/3] lg:aspect-auto relative overflow-hidden flex-shrink-0">
          <img src={data.imagePlaceholderUrl} alt={data.name} className="w-full h-full object-cover object-top opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="p-8 lg:p-10 flex flex-col justify-between flex-1">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-500 uppercase">
                ID_ENTRY: {data.idEntry}
              </div>
              <div className="border border-iron-red text-iron-red text-[10px] font-mono font-bold px-3 py-1 tracking-widest uppercase">
                STATUS: <br/>{data.status}
              </div>
            </div>
            
            <h2 className="text-6xl font-black text-iron-900 tracking-tighter uppercase leading-none mb-10">
              {data.name}
            </h2>
            
            <div className="flex gap-16 mb-8">
              <div>
                 <div className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">
                  MASS_CLASS
                 </div>
                 <div className="text-2xl font-black text-iron-900 uppercase">
                   {data.massClass} <span className="text-sm font-bold text-gray-500">KG</span>
                 </div>
              </div>
              <div>
                 <div className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">
                  SPEC_OBJECTIVE
                 </div>
                 <div className="text-2xl font-black text-iron-900 uppercase">
                   {data.specObjective.toFixed(1)} <span className="text-sm font-bold text-gray-500">KG</span>
                 </div>
              </div>
              <div>
                 <div className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">
                  CURRENT_PROTOCOL
                 </div>
                 <div className="text-xl font-black text-iron-red tracking-tight uppercase mt-1">
                   {data.currentProtocol}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 mt-6 border-t border-gray-100 pt-6">
             {['OVERVIEW', 'PROGRAMS', 'PROGRESS', 'NOTES'].map(tab => (
               <button key={tab} className={clsx(
                 "text-[10px] font-mono tracking-widest uppercase font-bold pb-2 border-b-2 transition-colors",
                 tab === 'PROGRESS' ? 'border-iron-red text-iron-900' : 'border-transparent text-gray-400 hover:text-iron-900'
               )}>
                 {tab}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left main column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* 1RM Cards */}
          <div className="grid grid-cols-3 gap-6">
            {(Object.entries(data.maxStats) as [keyof typeof data.maxStats, typeof data.maxStats.squat][]).map(([lift, stat]) => (
              <div key={lift} className="panel">
                 <div className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-4">
                  {lift} 1RM
                 </div>
                 <div className="text-4xl font-black text-iron-900 tracking-tighter mb-4">
                   {stat.weight} <span className="text-sm font-bold text-gray-400 tracking-normal ml-1">KG</span>
                 </div>
                 <div className={clsx(
                   "text-[9px] font-mono tracking-widest font-bold uppercase",
                   stat.statusColor === 'red' ? 'text-iron-red' : 'text-gray-500'
                 )}>
                   {stat.statusText}
                 </div>
              </div>
            ))}
          </div>

          {/* Performance Trajectory */}
          <div className="panel h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8 pr-4">
               <h3 className="text-xs font-black tracking-widest text-iron-900 uppercase">
                PERFORMANCE_TRAJECTORY
              </h3>
              <div className="flex gap-4">
                 {[
                   { label: 'SQUAT', color: '#dc2626' },
                   { label: 'BENCH', color: '#6b7280' },
                   { label: 'DEADLIFT', color: '#111111' }
                 ].map(item => (
                   <div key={item.label} className="flex items-center gap-2">
                     <div className="w-2 h-2" style={{ backgroundColor: item.color }} />
                     <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase">{item.label}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="flex-1 w-full min-h-0 relative -left-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                  <YAxis hide domain={['dataMin - 20', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 0, border: '1px solid #e5e7eb', boxShadow: 'none', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Inter' }}
                  />
                  <Line type="monotone" dataKey="deadlift" stroke="#111111" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="squat" stroke="#dc2626" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="bench" stroke="#9ca3af" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Grid lines placeholder for background */}
            <div className="absolute inset-0 pointer-events-none p-6 pt-20 pb-12 flex flex-col justify-between z-0 opacity-30">
              <div className="w-full border-b border-gray-200"></div>
              <div className="w-full border-b border-gray-200"></div>
              <div className="w-full border-b border-gray-200"></div>
              <div className="w-full border-b border-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="panel p-0 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-iron-900 uppercase p-6 pb-4 border-b border-gray-100">
              RECENT_ENTRIES
            </h3>
            <div className="flex flex-col flex-1 divide-y divide-gray-100">
               {data.recentEntries.map(entry => (
                 <div key={entry.id} className="p-6">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-mono font-bold text-gray-800 tracking-wider">
                       {entry.date}
                     </span>
                     <span className={clsx(
                       "badge border text-[8px] py-0.5",
                       entry.status === 'MISS_ENTRY' ? 'border-iron-red text-iron-red' : 'bg-gray-100 text-gray-600 border-gray-200'
                     )}>
                       {entry.status}
                     </span>
                   </div>
                   <div className="text-sm font-black text-iron-900 uppercase tracking-tight mb-1">
                     {entry.title}
                   </div>
                   <div className="text-[10px] font-mono text-gray-500 tracking-wide">
                     {entry.subtitle}
                   </div>
                 </div>
               ))}
            </div>
            <button className="w-full bg-white border-y border-gray-100 py-4 text-[10px] font-mono font-bold tracking-widest text-iron-900 hover:bg-gray-50 transition-colors uppercase">
              EXPORT_SESSION_DATA
            </button>
            <button className="w-full bg-iron-900 text-white py-4 text-xs font-bold tracking-widest hover:bg-black transition-colors uppercase flex items-center justify-center gap-2 border-t-2 border-transparent">
              <Plus className="w-4 h-4" />
              LOG_ENTRY
            </button>
          </div>

          <div className="panel flex flex-col gap-6">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-iron-900 uppercase">
              CALIBRATION_INDEX
            </h3>
            
            <div className="flex flex-col gap-5">
              {[
                { label: 'CNS_LOAD', val: data.calibration.cnsLoad },
                { label: 'INTEGRITY', val: data.calibration.integrity },
                { label: 'RECOVERY', val: data.calibration.recovery, isRed: true },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[9px] font-mono font-bold text-gray-500 uppercase mb-2 tracking-widest">
                    <span>{item.label}</span>
                    <span className={item.isRed ? 'text-iron-red' : 'text-iron-900'}>{item.val}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 w-full overflow-hidden">
                    <div className={clsx("h-full", item.isRed ? "bg-iron-red" : "bg-iron-900")} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 border border-gray-100 text-[10px] font-mono text-gray-600 leading-relaxed tracking-wider mt-2">
              WARNING: Recovery index below nominal for Phase 3. Protocol adjustment suggested.
            </div>
          </div>
        </div>
      </div>

      {/* Raw Performance Logs Table */}
      <div className="panel border-none p-0">
         <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xs font-black tracking-widest text-iron-900 uppercase">
            RAW_PERFORMANCE_LOGS
          </h3>
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-iron-900 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-iron-900 transition-colors">
              <CloudDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="border-b border-gray-100">
                {['TIMESTAMP', 'MOVEMENT', 'SETS/REPS', 'LOAD_KG', 'RPE', 'VARIANCE'].map(header => (
                  <th key={header} className="font-mono text-[9px] font-bold tracking-widest text-gray-400 py-4 px-6 uppercase whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.rawLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-[11px] font-bold text-iron-900 tracking-wider">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-6 font-mono text-[10px] font-bold tracking-widest text-gray-600 uppercase">
                    {log.movement}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-gray-700 tracking-widest">
                    {log.setsReps}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] font-bold text-iron-900 tracking-wider">
                    {log.loadKg.toFixed(1)}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-gray-700 tracking-wider">
                    {log.rpe.toFixed(1)}
                  </td>
                  <td className={clsx(
                    "py-4 px-6 font-mono text-[11px] font-bold tracking-wider",
                    log.varianceColor === 'red' ? 'text-iron-red' : 'text-gray-500'
                  )}>
                    {log.variance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
