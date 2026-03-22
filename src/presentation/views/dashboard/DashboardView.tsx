import { useDashboardViewModel } from '../../viewmodels/useDashboardViewModel';
import { ChevronRight, Plus, TriangleAlert, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardView() {
  const { data, isLoading, error } = useDashboardViewModel();

  if (isLoading) return <div className="p-8 text-iron-red animate-pulse">LOADING_DATA_STREAM...</div>;
  if (error || !data) return <div className="p-8 text-red-600">SYSTEM_ERROR_ENCOUNTERED</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-5xl font-black text-iron-900 tracking-tighter mb-1 uppercase font-sans">
            OPERATIONS
          </h2>
          <p className="font-mono text-[10px] text-iron-red font-bold uppercase tracking-[0.2em]">
            REAL-TIME PERFORMANCE MONITORING
          </p>
        </div>
        <button className="bg-iron-red text-white uppercase text-sm font-bold py-3 px-6 hover:bg-red-700 transition-colors flex items-center gap-2 tracking-wider shadow-sm font-sans">
          <Plus className="w-4 h-4" />
          NEW PROGRAM
        </button>
      </div>

      {/* Top Row Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Live Protocols Count */}
        <div className="col-span-12 lg:col-span-3 panel flex flex-col justify-between border-l-4 border-l-iron-red border-y-gray-200 border-r-gray-200">
          <h3 className="text-[10px] font-mono font-bold tracking-[0.1em] text-gray-400 uppercase mb-8">
            LIVE PROTOCOLS
          </h3>
          <div className="mt-auto">
            <div className="text-6xl font-black tracking-tighter text-iron-900 mb-6">
              {data.stats.activeCount}
            </div>
            <div className="font-mono text-[10px] text-green-500 font-bold tracking-widest uppercase">
              +{data.stats.uptimeChange} SYSTEM UPTIME
            </div>
          </div>
        </div>

        {/* Athlete Cards */}
        {data.liveProtocols.map((protocol) => (
          <div key={protocol.id} className="col-span-12 lg:col-span-4 panel flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-1">
                  ATHLETE
                </div>
                <div className="text-lg font-black tracking-tighter text-iron-900 uppercase">
                  {protocol.athleteName}
                </div>
              </div>
              <div className={clsx("badge", 
                protocol.status === 'PEAK_WEEK' ? 'badge-red' : 'badge-outline'
              )}>
                {protocol.status.replace('_', ' ')}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-1">
                PROTOCOL
              </div>
              <div className="text-sm font-bold tracking-tight text-iron-900 uppercase">
                {protocol.protocolName}
              </div>
            </div>

            {/* Progress Bar Area */}
            {protocol.progressText && (
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-mono font-bold text-gray-500 uppercase mb-2 tracking-widest">
                  <span>PROGRESS</span>
                  <span>{protocol.progressText}</span>
                </div>
                <div className="h-2 bg-gray-100 w-full overflow-hidden">
                  <div className="h-full bg-iron-red" style={{ width: `${protocol.progressPercent}%` }} />
                </div>
              </div>
            )}
            
            {protocol.intensityOutputText && (
              <div className="mb-6">
                 <div className="flex justify-between text-[10px] font-mono font-bold text-gray-500 uppercase mb-2 tracking-widest">
                  <span>INTENSITY OUTPUT</span>
                  <span>{protocol.intensityOutputText}</span>
                </div>
                <div className="h-2 bg-gray-100 w-full overflow-hidden">
                  <div className="h-full bg-iron-red" style={{ width: `${protocol.intensityOutputPercent}%` }} />
                </div>
              </div>
            )}

            <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center group cursor-pointer">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-1">
                  NEXT SESSION
                </div>
                <div className="text-[11px] font-mono font-bold text-gray-700 tracking-wider">
                  {protocol.nextSession}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-iron-red transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Recents Table */}
      <div className="panel border-t-4 border-t-iron-red px-0 py-0 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-sm font-black tracking-widest text-iron-900 uppercase">
            RECENTLY_MODIFIED_PROTOCOLS
          </h3>
          <button className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase hover:text-iron-900 transition-colors">
            VIEW ALL ARCHIVES
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-6 uppercase w-1/6">PROTOCOL ID</th>
                <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-6 uppercase w-1/3">PROGRAM NAME</th>
                <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-6 uppercase w-1/6">MODIFIED BY</th>
                <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-6 uppercase w-1/6">TIMESTAMP</th>
                <th className="font-mono text-[10px] font-bold tracking-widest text-gray-500 py-3 px-6 uppercase text-right w-1/6">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data.recentProtocols.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-bold text-iron-red tracking-wider">
                    {p.protocolId}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-800 tracking-tight">
                    {p.programName}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-gray-600 tracking-widest uppercase">
                    {p.modifiedBy}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-gray-500 tracking-widest">
                    {p.timestamp}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={clsx(
                      "badge",
                      p.status === 'STAGED' ? 'badge-outline' :
                      p.status === 'DEPLOYED' ? 'badge-red' :
                      'badge-green text-[#38a169] border-[#38a169]'
                    )}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-6 pb-8">
        {/* Tonnage Load */}
        <div className="col-span-12 lg:col-span-6 panel">
           <h3 className="text-[11px] font-mono font-bold tracking-widest text-gray-500 uppercase mb-4">
            TOTAL TONNAGE LOAD (CURRENT CYCLE)
          </h3>
          <div className="flex items-end gap-2 mb-8 mt-2">
            <div className="text-5xl font-black tracking-tighter text-iron-900 leading-none">
              {data.tonnageLoad.currentTotal.toLocaleString()}
            </div>
            <div className="text-sm font-bold tracking-widest text-gray-400 mb-1">
              {data.tonnageLoad.unit}
            </div>
          </div>
          
          {/* Simple static bar chart representation */}
          <div className="flex items-end gap-2 h-16 w-full">
            {[10, 15, 20, 25, 30, 35].map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-red-600 to-red-300 opacity-90 transition-all hover:opacity-100" 
                style={{ height: `${val + 40}%` }}
              />
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="col-span-12 lg:col-span-6 panel bg-transparent border-none shadow-none p-0 flex flex-col gap-4">
           <h3 className="text-[11px] font-mono font-bold tracking-widest text-gray-500 uppercase px-1">
            SYSTEM ALERTS
          </h3>
          <div className="flex flex-col gap-3">
             {data.alerts.map((alert) => (
                <div key={alert.id} className={clsx(
                  "p-4 border relative overflow-hidden",
                  alert.type === 'WARNING' ? 'bg-gray-50 border-gray-200' : 'bg-green-50/50 border-green-200'
                )}>
                  <div className="flex gap-4 relative z-10">
                    <div className="mt-0.5 flex-shrink-0">
                      {alert.type === 'WARNING' ? (
                         <TriangleAlert className="w-5 h-5 text-iron-red flex-shrink-0" fill="white" />
                      ) : (
                         <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" fill="white" />
                      )}
                    </div>
                    <div className="flex-1">
                       <div className={clsx(
                         "text-[10px] font-mono font-bold tracking-widest uppercase mb-1",
                         alert.type === 'WARNING' ? 'text-iron-red' : 'text-green-600'
                       )}>
                         {alert.title}
                       </div>
                       <div className="text-xs font-bold text-iron-900 pr-32">
                         {alert.message}
                       </div>
                    </div>
                    {alert.timestamp && (
                      <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest absolute right-4 top-1/2 -translate-y-1/2 mt-0.5">
                        {alert.timestamp}
                      </div>
                    )}
                  </div>
                  
                  {/* Warning Meta overlay */}
                  {alert.meta && (
                     <div className="absolute right-0 top-0 bottom-0 bg-iron-900 border-l px-4 py-3 flex flex-col justify-center">
                        {Object.entries(alert.meta).map(([key, val]) => (
                          <div key={key} className="text-[8px] font-mono text-gray-400 tracking-[0.2em] mb-1 leading-none whitespace-nowrap">
                            {key}: <span className="text-gray-200">{val}</span>
                          </div>
                        ))}
                     </div>
                  )}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
