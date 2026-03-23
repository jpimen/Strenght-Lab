import { useParams } from 'react-router-dom';
import { useProgramViewModel } from '../../viewmodels/useProgramViewModel';
import { User, Calendar, Target, Bold, Italic, Type, AlignLeft, PlusSquare, History, PlayCircle, X, Repeat } from 'lucide-react';
import clsx from 'clsx';

export default function ProgramView() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const { data, isLoading } = useProgramViewModel(athleteId);

  if (isLoading || !data) return <div className="p-8 text-iron-red animate-pulse">LOADING_PROGRAM_DATA...</div>;

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col pt-0 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-iron-red" />
          <div>
            <h2 className="text-xl font-black text-iron-900 tracking-wider uppercase mb-1">
              {data.name}
            </h2>
            <div className="flex items-center gap-6 text-[9px] font-mono font-bold text-gray-500 tracking-widest uppercase">
              <div className="flex items-center gap-2"><User className="w-3 h-3" /> ATHLETE: {data.athleteName}</div>
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> DURATION: {data.durationWeeks} WEEKS</div>
              <div className="flex items-center gap-2"><Target className="w-3 h-3" /> GOAL: {data.goal}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-outline">
            SAVE DRAFT
          </button>
          <button className="btn-primary">
            PUBLISH PROGRAM
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-gray-400">
            <button className="hover:text-iron-900"><Bold className="w-4 h-4" /></button>
            <button className="hover:text-iron-900"><Italic className="w-4 h-4" /></button>
            <button className="hover:text-iron-900"><Type className="w-4 h-4" /></button>
            <button className="hover:text-iron-900"><AlignLeft className="w-4 h-4" /></button>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <button className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-iron-900 uppercase hover:bg-gray-50 px-3 py-1.5 border border-gray-200">
            <PlusSquare className="w-3.5 h-3.5" /> EXERCISE_LIBRARY
          </button>
          <button className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase hover:text-iron-900 transition-colors">
            <History className="w-3.5 h-3.5" /> LOAD_TEMPLATE
          </button>
        </div>
        <div className="text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-2 text-gray-500">
          STATUS: <span className="text-green-600">{data.status}</span>
        </div>
      </div>

      {/* Main Content Area (Table + Sidebar) */}
      <div className="flex flex-1 min-h-0">
        {/* Table Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-200 relative z-10 sticky top-0 bg-white">
                   {['WEEK/DAY', 'EXERCISE NAME', 'SETS', 'REPS', 'INTENSITY\n(%/RPE)', 'REST', 'NOTES'].map(h => (
                     <th key={h} className="font-mono text-[9px] font-bold tracking-[0.2em] text-gray-500 py-3 px-4 uppercase whitespace-pre border-r border-gray-200 last:border-0 align-bottom">
                       {h}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                  {data.exercises.map((row) => (
                    <tr key={row.id} className={clsx(
                      "group border-b border-gray-100",
                      row.isActive ? "bg-red-50/10 cursor-default" : "hover:bg-gray-50 transition-colors cursor-pointer"
                    )}>
                      <td className={clsx(
                        "py-3 px-4 font-mono text-[10px] font-bold tracking-widest w-24 border-r border-gray-200 relative",
                        row.weekDay ? "text-iron-red" : "text-gray-400"
                      )}>
                        {row.isActive && (
                           <div className="absolute inset-y-0 left-0 w-full border border-iron-red pointer-events-none z-10" />
                        )}
                        {/* Expand border hack for the active row to span across td */}
                        <div className={clsx("absolute inset-y-[0.5px] inset-x-0 border-y-2 pointer-events-none z-10", row.isActive ? "border-iron-red" : "border-transparent")} />
                        
                        {row.weekDay}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-iron-900 border-r border-gray-200 tracking-tight min-w-[200px] relative">
                         {row.isActive && <div className="absolute inset-y-[0.5px] inset-x-0 border-y-2 border-iron-red pointer-events-none z-10" />}
                        {row.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm border-r border-gray-200 text-center relative text-gray-700">
                         {row.isActive && <div className="absolute inset-y-[0.5px] inset-x-0 border-y-2 border-iron-red pointer-events-none z-10" />}
                        {row.sets}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm border-r border-gray-200 text-center relative text-gray-700">
                        {row.isActive && <div className="absolute inset-y-[0.5px] inset-x-0 border-y-2 border-iron-red pointer-events-none z-10" />}
                        {row.reps}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] border-r border-gray-200 text-center tracking-widest relative text-gray-700">
                        {row.isActive && <div className="absolute inset-y-[0.5px] inset-x-0 border-y-2 border-iron-red pointer-events-none z-10" />}
                        {row.intensity}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] border-r border-gray-200 text-center tracking-widest relative text-gray-700">
                        {row.isActive && <div className="absolute inset-y-[0.5px] inset-x-0 border-y-2 border-iron-red pointer-events-none z-10" />}
                        {row.rest}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] tracking-widest relative text-gray-400">
                        {row.isActive && (
                           <>
                             <div className="absolute inset-y-[0.5px] inset-x-0 border-y-2 border-iron-red pointer-events-none z-10" />
                             <div className="absolute inset-y-0 right-0 w-0 border-r-2 border-iron-red pointer-events-none z-10" />
                           </>
                        )}
                        {row.notes}
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
          
          {/* Bottom Week Tabs */}
          <div className="flex items-center border-t border-gray-200 bg-gray-50/50 mt-auto">
            {data.weeks.map(week => (
               <button key={week} className={clsx(
                 "px-8 py-4 text-[10px] font-mono font-bold tracking-widest uppercase border-r border-gray-200 transition-colors relative",
                 week === data.activeWeek ? "text-iron-900 bg-white" : "text-gray-500 hover:bg-white hover:text-iron-900"
               )}>
                 {week}
                 {week === data.activeWeek && <div className="absolute bottom-0 left-0 right-0 h-1 bg-iron-red" />}
               </button>
            ))}
            <button className="px-6 py-4 text-iron-red hover:bg-white transition-colors">
              <PlusSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar (Exercise Detail) */}
        {data.activeExerciseDetail && (
           <div className="w-80 border-l border-gray-200 bg-white flex flex-col flex-shrink-0 relative overflow-y-auto">
             <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-[10px] font-mono font-bold tracking-widest text-iron-900 uppercase">
                  EXERCISE DETAIL
                </h3>
                <button className="text-gray-400 hover:text-iron-900">
                  <X className="w-4 h-4" />
                </button>
             </div>

             <div className="p-6 flex-1 flex flex-col gap-8">
                {/* Demonstration */}
                <div>
                   <div className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase mb-3">
                     DEMONSTRATION
                   </div>
                   <div className="aspect-video bg-gray-100 relative group cursor-pointer border border-gray-200 rounded-sm overflow-hidden mb-6 flex items-center justify-center">
                      <img 
                        src={data.activeExerciseDetail.videoPlaceholderUrl} 
                        alt="Demo" 
                        className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-12 h-12 rounded-full bg-iron-red/90 flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-iron-red group-hover:scale-110 transition-all">
                            <PlayCircle className="w-6 h-6 text-white" fill="white" />
                         </div>
                      </div>
                   </div>

                   <h4 className="text-lg font-black text-iron-900 tracking-tight mb-3">
                     {data.activeExerciseDetail.name}
                   </h4>
                   <div className="flex gap-2">
                      {data.activeExerciseDetail.tags.map(tag => (
                        <span key={tag} className="badge badge-outline border-gray-200 bg-gray-50 py-1">
                          {tag}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Coaching Notes */}
                <div>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase mb-3">
                     COACHING NOTES
                  </div>
                  <textarea 
                    className="w-full h-32 p-4 text-[11px] font-mono tracking-wider text-gray-700 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-iron-red resize-none"
                    defaultValue={data.activeExerciseDetail.coachingNotes}
                  />
                </div>

                {/* Historical Load */}
                <div>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase mb-3">
                     HISTORICAL LOAD
                  </div>
                  <div className="p-4 bg-gray-50 flex gap-4 relative">
                    <div className="w-1 absolute left-0 top-0 bottom-0 bg-iron-red" />
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-1">
                        {data.activeExerciseDetail.historicalLoad.label}
                      </div>
                      <div className="text-xl font-black text-iron-900 tracking-tighter uppercase">
                        {data.activeExerciseDetail.historicalLoad.weight}<span className="text-sm font-bold text-gray-400 tracking-normal mx-1">KG</span> 
                        <span className="text-sm font-bold text-gray-600 tracking-widest">x {data.activeExerciseDetail.historicalLoad.reps} REPS</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="p-6 border-t border-gray-200">
               <button className="w-full flex items-center justify-center gap-2 text-[10px] font-mono font-bold tracking-widest text-iron-900 uppercase border border-gray-200 py-3 hover:bg-gray-50 transition-colors">
                 <Repeat className="w-3.5 h-3.5" /> REPLACE EXERCISE
               </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}
