import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProgramViewModel } from '../../viewmodels/useProgramViewModel';
import { User, Calendar, Target } from 'lucide-react';
import { ProgramBuilder } from './components/ProgramBuilder';

export default function ProgramView() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const isNew = athleteId === 'new';
  const { data, isLoading } = useProgramViewModel(athleteId);
  const [programName, setProgramName] = useState('NEW_PROGRAM');
  const [athleteName, setAthleteName] = useState('ATHLETE_NAME');
  const [goal, setGoal] = useState('GENERAL');
  const [durationWeeks, setDurationWeeks] = useState(4);

  if (!isNew && (isLoading || !data)) {
    return <div className="p-8 text-iron-red animate-pulse">LOADING_PROGRAM_DATA...</div>;
  }

  const displayName = isNew ? programName : data?.name ?? '';
  const displayAthlete = isNew ? athleteName : data?.athleteName ?? '';
  const displayGoal = isNew ? goal : data?.goal ?? '';
  const displayDuration = isNew ? durationWeeks : data?.durationWeeks ?? 4;

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Program Metadata */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-1.5 h-12 bg-orange-600" />
            <div className="flex-1 grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase">Program Name</span>
                {isNew ? (
                  <input
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="text-lg font-black text-gray-900 tracking-wide border border-gray-200 rounded px-3 py-2"
                  />
                ) : (
                  <div className="text-lg font-black text-gray-900 tracking-wide px-1 py-2">
                    {displayName}
                  </div>
                )}
              </label>
              <label className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase">Athlete</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {isNew ? (
                    <input
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      className="flex-1 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded px-2 py-2"
                    />
                  ) : (
                    <div className="flex-1 text-sm font-mono font-bold text-gray-800 px-1 py-2">
                      {displayAthlete}
                    </div>
                  )}
                </div>
              </label>
              <label className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase">Goal</span>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  {isNew ? (
                    <input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="flex-1 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded px-2 py-2"
                    />
                  ) : (
                    <div className="flex-1 text-sm font-mono font-bold text-gray-800 px-1 py-2">
                      {displayGoal}
                    </div>
                  )}
                </div>
              </label>
              <label className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase">Duration (weeks)</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {isNew ? (
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(Number(e.target.value) || 1)}
                      className="w-24 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded px-2 py-2"
                    />
                  ) : (
                    <div className="w-24 text-sm font-mono font-bold text-gray-800 px-1 py-2">
                      {displayDuration}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-[10px] font-mono font-bold border border-gray-300 hover:bg-gray-50 transition-colors">
              SAVE DRAFT
            </button>
            <button className="px-4 py-2 text-[10px] font-mono font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors">
              {isNew ? 'CREATE PROGRAM' : 'PUBLISH PROGRAM'}
            </button>
          </div>
        </div>
      </div>

      {/* Program Builder Component */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ProgramBuilder
          initialWeeks={displayDuration || 4}
        />
      </div>
    </div>
  );
}
