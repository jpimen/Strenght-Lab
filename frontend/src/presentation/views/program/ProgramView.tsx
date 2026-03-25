import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Calendar, Target } from 'lucide-react';
import { useProgramViewModel } from '../../viewmodels/useProgramViewModel';
import { ProgramBuilder } from './components/ProgramBuilder';
import {
  loadProgramDraftCache,
  saveProgramDraftCache,
  saveProgramToSelection,
  type ProgramBuilderSnapshot,
  type ProgramDraftCache,
} from './utils/programDraftCache';

type DraftMetaState = {
  programName: string;
  athleteName: string;
  goal: string;
  durationWeeks: number;
};

const NEW_PROGRAM_DEFAULTS: DraftMetaState = {
  programName: 'NEW_PROGRAM',
  athleteName: 'ATHLETE_NAME',
  goal: 'GENERAL',
  durationWeeks: 4,
};

export default function ProgramView() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const isNew = athleteId === 'new';
  const cacheScope = athleteId ?? 'new';
  const { data, isLoading } = useProgramViewModel(athleteId);
  const [draftMetaByScope, setDraftMetaByScope] = useState<Record<string, DraftMetaState>>({});
  const [builderByScope, setBuilderByScope] = useState<Record<string, ProgramBuilderSnapshot>>({});
  const [cacheStampByScope, setCacheStampByScope] = useState<Record<string, string>>({});
  const [lifecycleByScope, setLifecycleByScope] = useState<Record<string, ProgramDraftCache['lifecycle']>>({});
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const cachedDraft = useMemo(() => loadProgramDraftCache(cacheScope), [cacheScope]);
  const baseMeta: DraftMetaState = isNew
    ? {
        programName: cachedDraft?.programName || NEW_PROGRAM_DEFAULTS.programName,
        athleteName: cachedDraft?.athleteName || NEW_PROGRAM_DEFAULTS.athleteName,
        goal: cachedDraft?.goal || NEW_PROGRAM_DEFAULTS.goal,
        durationWeeks: cachedDraft?.durationWeeks || NEW_PROGRAM_DEFAULTS.durationWeeks,
      }
    : {
        programName: data?.name ?? '',
        athleteName: data?.athleteName ?? '',
        goal: data?.goal ?? '',
        durationWeeks: data?.durationWeeks ?? 4,
      };

  const scopedMeta = draftMetaByScope[cacheScope] ?? baseMeta;
  const displayName = scopedMeta.programName;
  const displayAthlete = scopedMeta.athleteName;
  const displayGoal = scopedMeta.goal;
  const displayDuration = scopedMeta.durationWeeks;
  const activeBuilderState = builderByScope[cacheScope];
  const lastKnownBuilderState = activeBuilderState ?? cachedDraft?.builder ?? null;
  const currentLifecycle = lifecycleByScope[cacheScope] ?? cachedDraft?.lifecycle ?? 'draft';
  const cachedAt = cacheStampByScope[cacheScope] ?? cachedDraft?.updatedAt ?? null;

  const handleBuilderStateChange = useCallback(
    (state: ProgramBuilderSnapshot) => {
      setBuilderByScope((prev) => {
        const current = prev[cacheScope];
        if (
          current &&
          current.cells === state.cells &&
          current.columns === state.columns &&
          current.rowLabels === state.rowLabels &&
          current.variables === state.variables
        ) {
          return prev;
        }
        return {
          ...prev,
          [cacheScope]: state,
        };
      });
    },
    [cacheScope]
  );

  const updateDraftMeta = (patch: Partial<DraftMetaState>) => {
    setDraftMetaByScope((prev) => ({
      ...prev,
      [cacheScope]: {
        ...(prev[cacheScope] ?? baseMeta),
        ...patch,
      },
    }));
  };

  useEffect(() => {
    if (!activeBuilderState) return;

    const timeoutId = window.setTimeout(() => {
      const payload: ProgramDraftCache = {
        programName: displayName || NEW_PROGRAM_DEFAULTS.programName,
        athleteName: displayAthlete || NEW_PROGRAM_DEFAULTS.athleteName,
        goal: displayGoal || NEW_PROGRAM_DEFAULTS.goal,
        durationWeeks: displayDuration || NEW_PROGRAM_DEFAULTS.durationWeeks,
        lifecycle: currentLifecycle === 'draft' ? 'draft' : currentLifecycle,
        builder: activeBuilderState,
        updatedAt: new Date().toISOString(),
      };
      saveProgramDraftCache(cacheScope, payload);
      setCacheStampByScope((prev) => ({
        ...prev,
        [cacheScope]: payload.updatedAt,
      }));
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeBuilderState, cacheScope, displayName, displayAthlete, displayGoal, displayDuration, currentLifecycle]);

  const persistProgram = (
    builderState: ProgramBuilderSnapshot,
    notice: string,
    lifecycle: ProgramDraftCache['lifecycle']
  ) => {
    const payload: ProgramDraftCache = {
      programName: displayName || NEW_PROGRAM_DEFAULTS.programName,
      athleteName: displayAthlete || NEW_PROGRAM_DEFAULTS.athleteName,
      goal: displayGoal || NEW_PROGRAM_DEFAULTS.goal,
      durationWeeks: displayDuration || NEW_PROGRAM_DEFAULTS.durationWeeks,
      lifecycle,
      builder: builderState,
      updatedAt: new Date().toISOString(),
    };
    saveProgramDraftCache(cacheScope, payload);
    setCacheStampByScope((prev) => ({
      ...prev,
      [cacheScope]: payload.updatedAt,
    }));
    setLifecycleByScope((prev) => ({
      ...prev,
      [cacheScope]: lifecycle,
    }));

    if (lifecycle === 'created' || lifecycle === 'published') {
      saveProgramToSelection({
        athleteId: !isNew ? athleteId : undefined,
        athleteName: displayAthlete || NEW_PROGRAM_DEFAULTS.athleteName,
        programName: displayName || NEW_PROGRAM_DEFAULTS.programName,
        goal: displayGoal || NEW_PROGRAM_DEFAULTS.goal,
        durationWeeks: displayDuration || NEW_PROGRAM_DEFAULTS.durationWeeks,
        status: lifecycle,
        sourceScope: cacheScope,
      });
    }

    setSaveNotice(notice);
  };

  const handleSaveDraft = () => {
    if (!lastKnownBuilderState) return;
    persistProgram(lastKnownBuilderState, 'DRAFT SAVED', 'draft');
  };

  const handleCreateOrPublish = () => {
    if (!lastKnownBuilderState) return;
    persistProgram(
      lastKnownBuilderState,
      isNew ? 'PROGRAM CREATED & SAVED' : 'PROGRAM PUBLISHED & SAVED',
      isNew ? 'created' : 'published'
    );
  };

  if (!isNew && (isLoading || !data)) {
    return <div className="p-8 text-iron-red animate-pulse">LOADING_PROGRAM_DATA...</div>;
  }

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
                    value={displayName}
                    onChange={(e) => updateDraftMeta({ programName: e.target.value })}
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
                      value={displayAthlete}
                      onChange={(e) => updateDraftMeta({ athleteName: e.target.value })}
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
                      value={displayGoal}
                      onChange={(e) => updateDraftMeta({ goal: e.target.value })}
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
                      value={displayDuration}
                      onChange={(e) => updateDraftMeta({ durationWeeks: Number(e.target.value) || 1 })}
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
            <button
              onClick={handleSaveDraft}
              disabled={!lastKnownBuilderState}
              className="px-4 py-2 text-[10px] font-mono font-bold border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SAVE DRAFT
            </button>
            <button
              onClick={handleCreateOrPublish}
              disabled={!lastKnownBuilderState}
              className="px-4 py-2 text-[10px] font-mono font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNew ? 'CREATE PROGRAM' : 'PUBLISH PROGRAM'}
            </button>
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
              {cachedAt ? `CACHED ${new Date(cachedAt).toLocaleTimeString()}` : 'NOT CACHED YET'}
            </div>
            {saveNotice && (
              <div className="text-[9px] font-mono font-bold tracking-widest text-green-700 uppercase">
                {saveNotice}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Builder Component */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ProgramBuilder
          key={cacheScope}
          initialWeeks={displayDuration || 4}
          initialState={cachedDraft?.builder ?? null}
          onStateChange={handleBuilderStateChange}
        />
      </div>
    </div>
  );
}
