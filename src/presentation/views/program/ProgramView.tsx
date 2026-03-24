import { useParams } from 'react-router-dom';
import { useProgramViewModel } from '../../viewmodels/useProgramViewModel';
import { User, Calendar, Target } from 'lucide-react';
import { ProgramBuilder } from './components/ProgramBuilder';

export default function ProgramView() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const { data, isLoading } = useProgramViewModel(athleteId);

  if (isLoading || !data) return <div className="p-8 text-iron-red animate-pulse">LOADING_PROGRAM_DATA...</div>;

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Enhanced Header with Program Info */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-orange-600" />
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">
                {data.name}
              </h1>
              <div className="flex items-center gap-6 text-[9px] font-mono font-bold text-gray-500 tracking-widest uppercase mt-2">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  ATHLETE: {data.athleteName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  DURATION: {data.durationWeeks} WEEKS
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  GOAL: {data.goal}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-[10px] font-mono font-bold border border-gray-300 hover:bg-gray-50 transition-colors">
              SAVE DRAFT
            </button>
            <button className="px-4 py-2 text-[10px] font-mono font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors">
              PUBLISH PROGRAM
            </button>
          </div>
        </div>
      </div>

      {/* Program Builder Component */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ProgramBuilder
          programName={data.name}
          athleteName={data.athleteName}
          initialWeeks={data.durationWeeks}
        />
      </div>
    </div>
  );
}
