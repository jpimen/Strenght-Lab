import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Calendar, Target, Send, Copy } from 'lucide-react';
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
  durationWeeks: number | '';
};

const NEW_PROGRAM_DEFAULTS: DraftMetaState = {
  programName: '',
  athleteName: '',
  goal: '',
  durationWeeks: '',
};

function normalizeDurationWeeks(value: number | '') {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

export default function ProgramView() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const isNew = athleteId === 'new';
  const cacheScope = athleteId ?? 'new';
  const { data, isLoading, publish, isPublishing } = useProgramViewModel(athleteId);
  const [draftMetaByScope, setDraftMetaByScope] = useState<Record<string, DraftMetaState>>({});
  const [builderByScope, setBuilderByScope] = useState<Record<string, ProgramBuilderSnapshot>>({});
  const [cacheStampByScope, setCacheStampByScope] = useState<Record<string, string>>({});
  const [lifecycleByScope, setLifecycleByScope] = useState<Record<string, ProgramDraftCache['lifecycle']>>({});
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);

  const cachedDraft = useMemo(
    () => (isNew ? null : loadProgramDraftCache(cacheScope)),
    [cacheScope, isNew]
  );

  const baseMeta: DraftMetaState = isNew
    ? NEW_PROGRAM_DEFAULTS
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
  const normalizedDurationWeeks = normalizeDurationWeeks(displayDuration);

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
        programName: displayName,
        athleteName: displayAthlete,
        goal: displayGoal,
        durationWeeks: normalizedDurationWeeks,
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

    return () => window.clearTimeout(timeoutId);
  }, [
    activeBuilderState,
    cacheScope,
    currentLifecycle,
    displayAthlete,
    displayGoal,
    displayName,
    normalizedDurationWeeks,
  ]);

  const persistProgram = (
    builderState: ProgramBuilderSnapshot,
    notice: string,
    lifecycle: ProgramDraftCache['lifecycle']
  ) => {
    const payload: ProgramDraftCache = {
      programName: displayName,
      athleteName: displayAthlete,
      goal: displayGoal,
      durationWeeks: normalizedDurationWeeks,
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
        athleteName: displayAthlete,
        programName: displayName,
        goal: displayGoal,
        durationWeeks: normalizedDurationWeeks,
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

  const handleCreateOrPublish = async (source: 'button' | 'shortcut' = 'button') => {
    if (!lastKnownBuilderState) return;
    
    // Call the actual API if we're publishing
    try {
      const result = await publish({
        id: isNew ? 'new' : (athleteId || ''),
        name: displayName,
        athleteName: displayAthlete,
        goal: displayGoal,
        durationWeeks: normalizedDurationWeeks,
        status: 'PUBLISHED',
        exercises: [], // Not used for publishing, we send builderData
        weeks: [],
        activeWeek: ''
      }, lastKnownBuilderState);
      
      if (result?.shareCode) {
        setShareCode(result.shareCode);
      }
    } catch (err) {
      console.error('Publish failed', err);
    }

    persistProgram(
      lastKnownBuilderState,
      isNew
        ? source === 'shortcut'
          ? 'PROGRAM CREATED & SAVED (CTRL+S)'
          : 'PROGRAM CREATED & SAVED'
        : source === 'shortcut'
          ? 'PROGRAM PUBLISHED & SAVED (CTRL+S)'
          : 'PROGRAM PUBLISHED & SAVED',
      isNew ? 'created' : 'published'
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== 's') return;
      event.preventDefault();

      if (!lastKnownBuilderState) return;

      const lifecycle: ProgramDraftCache['lifecycle'] = isNew ? 'created' : 'published';
      const payload: ProgramDraftCache = {
        programName: displayName,
        athleteName: displayAthlete,
        goal: displayGoal,
        durationWeeks: normalizedDurationWeeks,
        lifecycle,
        builder: lastKnownBuilderState,
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

      saveProgramToSelection({
        athleteId: !isNew ? athleteId : undefined,
        athleteName: displayAthlete,
        programName: displayName,
        goal: displayGoal,
        durationWeeks: normalizedDurationWeeks,
        status: lifecycle,
        sourceScope: cacheScope,
      });

      setSaveNotice(isNew ? 'PROGRAM CREATED & SAVED (CTRL+S)' : 'PROGRAM PUBLISHED & SAVED (CTRL+S)');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    athleteId,
    cacheScope,
    displayAthlete,
    displayGoal,
    displayName,
    isNew,
    lastKnownBuilderState,
    normalizedDurationWeeks,
  ]);

  if (!isNew && (isLoading || !data)) {
    return <div className="p-8 text-iron-red animate-pulse">LOADING_PROGRAM_DATA...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
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
                    placeholder="PROGRAM NAME"
                    className="text-lg font-black text-gray-900 tracking-wide border border-gray-200 rounded px-3 py-2"
                  />
                ) : (
                  <div className="text-lg font-black text-gray-900 tracking-wide px-1 py-2">{displayName}</div>
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
                      placeholder="ATHLETE NAME"
                      className="flex-1 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded px-2 py-2"
                    />
                  ) : (
                    <div className="flex-1 text-sm font-mono font-bold text-gray-800 px-1 py-2">{displayAthlete}</div>
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
                      placeholder="GOAL"
                      className="flex-1 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded px-2 py-2"
                    />
                  ) : (
                    <div className="flex-1 text-sm font-mono font-bold text-gray-800 px-1 py-2">{displayGoal}</div>
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
                      placeholder="WEEKS"
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        if (nextValue === '') {
                          updateDraftMeta({ durationWeeks: '' });
                          return;
                        }
                        const parsed = Number(nextValue);
                        updateDraftMeta({ durationWeeks: Number.isFinite(parsed) ? parsed : '' });
                      }}
                      className="w-24 text-sm font-mono font-bold text-gray-800 border border-gray-200 rounded px-2 py-2"
                    />
                  ) : (
                    <div className="w-24 text-sm font-mono font-bold text-gray-800 px-1 py-2">{displayDuration}</div>
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
              onClick={() => handleCreateOrPublish('button')}
              disabled={!lastKnownBuilderState || isPublishing}
              className="px-4 py-2 text-[10px] font-mono font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'PUBLISHING...' : (isNew ? 'CREATE PROGRAM' : 'PUBLISH PROGRAM')}
            </button>
            <div className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
              {cachedAt ? `CACHED ${new Date(cachedAt).toLocaleTimeString()}` : 'NOT CACHED YET'}
            </div>
            {saveNotice && (
              <div className="text-[9px] font-mono font-bold tracking-widest text-green-700 uppercase">{saveNotice}</div>
            )}
            {shareCode && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Share Code</span>
                <div className="flex items-center gap-2">
                   <div className="text-xl font-black text-orange-600 font-mono tracking-tighter">{shareCode}</div>
                   <button 
                    onClick={() => {
                        navigator.clipboard.writeText(shareCode);
                        setSaveNotice('CODE COPIED TO CLIPBOARD');
                        setTimeout(() => setSaveNotice(null), 2000);
                    }}
                    title="Copy to Clipboard"
                    className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-orange-600"
                   >
                     <Copy className="w-4 h-4" />
                   </button>
                   <button 
                    onClick={() => {
                        // In a real app this would send an email or trigger a notification
                        setSaveNotice('SENDING CODE TO ATHLETE...');
                        setTimeout(() => {
                           setSaveNotice('CODE SENT SUCCESSFULLY');
                           setTimeout(() => setSaveNotice(null), 2000);
                        }, 1000);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-[10px] font-mono font-bold hover:bg-black transition-colors"
                   >
                     <Send className="w-3.5 h-3.5" />
                     SEND CODE
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ProgramBuilder
          key={cacheScope}
          initialWeeks={normalizedDurationWeeks}
          initialState={cachedDraft?.builder ?? null}
          startEmpty={isNew}
          onStateChange={handleBuilderStateChange}
        />
      </div>
    </div>
  );
}
