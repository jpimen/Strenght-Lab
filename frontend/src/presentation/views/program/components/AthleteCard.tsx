import { useNavigate } from 'react-router-dom';
import type { AthleteData } from '../../../../domain/entities/AthleteData';
import { clsx } from 'clsx';

interface AthleteCardProps {
  athlete: AthleteData;
  onDeleteProgram?: (athlete: AthleteData) => void;
}

export default function AthleteCard({ athlete, onDeleteProgram }: AthleteCardProps) {
  const navigate = useNavigate();
  const hasProgram = athlete.currentProtocol !== 'NONE_ASSIGNED';
  const editorScope = athlete.programSourceScope ?? athlete.id;

  return (
    <div className="bg-white border border-gray-200 shadow-sm flex items-stretch h-36 group hover:border-iron-red hover:shadow-lg transition-all duration-300 animate-slideUp">
      {/* Athlete Image/Status */}
      <div className="w-36 bg-gray-100 relative overflow-hidden flex-shrink-0 animate-slideLeft delay-50">
        <img 
          src={athlete.imagePlaceholderUrl} 
          alt={athlete.name}
          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
        />
        <div className={clsx(
          "absolute bottom-0 left-0 right-0 py-1 px-2 text-[8px] font-mono font-bold tracking-widest text-center uppercase transition-all duration-300",
          athlete.status === 'ACTIVE' ? "bg-black text-white" : "bg-gray-200 text-gray-500"
        )}>
          STATUS: {athlete.status}
        </div>
      </div>

      {/* Info Sections */}
      <div className="flex-1 flex px-8 py-6 items-center animate-fadeIn delay-100">
        {/* Name/ID */}
        <div className="w-64 border-r border-gray-100 pr-8 animate-slideUp delay-150">
          <h3 className="text-xl font-black text-iron-900 tracking-tight leading-tight mb-1 uppercase">
            {athlete.name}
          </h3>
          <div className="flex gap-4 text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase">
            <span>ID: {athlete.idEntry}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{athlete.massClass}KG CLASS</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 flex justify-center gap-12 px-8">
          <StatBox label="SQT" value={athlete.maxStats.squat.weight} delay={200} />
          <StatBox label="BNC" value={athlete.maxStats.bench.weight} delay={250} />
          <StatBox label="DLF" value={athlete.maxStats.deadlift.weight} delay={300} />
        </div>

        {/* Program Status/Actions */}
        <div className="w-64 flex flex-col items-end gap-3 pl-8 animate-slideUp delay-350">
          <div className="flex flex-col items-end">
             <div className="text-[8px] font-mono font-bold text-gray-400 tracking-widest uppercase mb-1">PROG: {athlete.currentProtocol}</div>
             <div className={clsx(
               "h-px w-24 mb-1 transition-all duration-500",
               hasProgram ? "bg-iron-red" : "bg-gray-200 border-dashed border-t"
             )} />
          </div>
          
          <div className="flex gap-2">
            {hasProgram ? (
              <>
                <button 
                  onClick={() => navigate(`/program-builder/editor/${editorScope}`)}
                  className="px-6 py-2 border border-gray-950 text-[10px] font-mono font-bold text-iron-900 tracking-widest uppercase hover:bg-iron-900 hover:text-white hover:shadow-lg active:scale-95 transition-all duration-300"
                >
                  EDIT_PROG
                </button>
                <button 
                   onClick={() => navigate(`/program-builder/editor/${editorScope}`)}
                   className="px-6 py-2 bg-gray-50 border border-gray-200 text-[10px] font-mono font-bold text-gray-400 tracking-widest uppercase hover:text-iron-900 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  NEW_PROG
                </button>
                {athlete.canDeleteProgram && (
                  <button
                    onClick={() => onDeleteProgram?.(athlete)}
                    className="px-4 py-2 bg-white border border-red-300 text-[10px] font-mono font-bold text-red-600 tracking-widest uppercase hover:bg-red-50 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    DELETE
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => navigate(`/program-builder/editor/${athlete.id}`)}
                className="px-8 py-3 bg-iron-900 text-white text-[10px] font-mono font-bold tracking-[0.2em] uppercase hover:bg-iron-red hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              >
                CREATE_PROG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, delay }: { label: string; value: number; delay?: number }) {
  return (
    <div className="flex flex-col items-center" style={{ animationDelay: `${delay}ms` }}>
      <span className="text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase mb-2 animate-fadeIn">{label}</span>
      <span className="text-2xl font-black text-iron-900 tracking-tighter tabular-nums animate-slideUp">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
