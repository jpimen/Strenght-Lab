import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AthleteData } from '../../domain/entities/AthleteData';
import { athleteRepository } from '../../data/repositories/MockAthleteRepository';
import {
  listProgramDraftCaches,
  listProgramSelections,
  loadProgramDraftCache,
  deleteProgramSelectionById,
  deleteProgramSelectionsByScope,
  clearProgramDraftCache,
  type ProgramSelectionEntry,
} from '../views/program/utils/programDraftCache';

const fallbackImage =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';

type ProgramBinding = {
  programName: string;
  selectionId?: string;
  sourceScope: string;
};

function toNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildAthleteFromSelection(athlete: AthleteData, binding: ProgramBinding): AthleteData {
  return {
    ...athlete,
    currentProtocol: binding.programName,
    canDeleteProgram: true,
    programSelectionId: binding.selectionId,
    programSourceScope: binding.sourceScope,
  };
}

function buildAthleteFromDraftOverlay(athlete: AthleteData, programName: string): AthleteData {
  return {
    ...athlete,
    currentProtocol: programName,
    canDeleteProgram: true,
    programSourceScope: athlete.id,
  };
}

function buildVirtualAthleteFromSelection(selection: ProgramSelectionEntry, index: number): AthleteData {
  const draft = loadProgramDraftCache(selection.sourceScope);
  const variables = draft?.builder?.variables ?? {};

  const squat = toNumber(variables.SQ_1RM, 0);
  const bench = toNumber(variables.BP_1RM, 0);
  const deadlift = toNumber(variables.DL_1RM, 0);
  const massKg = toNumber(variables.MASS_KG, 0);

  return {
    id: `selection-${selection.id}`,
    name: selection.athleteName.toUpperCase(),
    idEntry: `SEL-${String(index + 1).padStart(4, '0')}`,
    status: 'ACTIVE',
    massClass: massKg || 0,
    specObjective: 0,
    currentProtocol: selection.programName,
    imagePlaceholderUrl: fallbackImage,
    maxStats: {
      squat: { weight: squat, statusText: 'FROM PROGRAM', statusColor: 'gray' },
      bench: { weight: bench, statusText: 'FROM PROGRAM', statusColor: 'gray' },
      deadlift: { weight: deadlift, statusText: 'FROM PROGRAM', statusColor: 'gray' },
    },
    recentEntries: [],
    calibration: {
      cnsLoad: 0,
      integrity: 0,
      recovery: 0,
    },
    rawLogs: [],
    canDeleteProgram: true,
    programSelectionId: selection.id,
    programSourceScope: selection.sourceScope,
  };
}

export function useRosterViewModel() {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setProgramMutationTick] = useState(0);

  useEffect(() => {
    let active = true;
    athleteRepository.getAthletes().then((result) => {
      if (active) {
        setAthletes(result);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const allSelections = listProgramSelections()
    .filter((entry) => entry.status === 'created' || entry.status === 'published')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const createdDraftPrograms = (() => {
    const byAthleteId = new Map<string, string>();
    listProgramDraftCaches().forEach(({ athleteId, draft }) => {
      if (athleteId === 'new') return;
      if (draft.lifecycle !== 'created' && draft.lifecycle !== 'published') return;
      byAthleteId.set(athleteId, draft.programName.trim() || 'CUSTOM_PROGRAM');
    });
    return byAthleteId;
  })();

  const athletesWithPrograms = useMemo(() => {
    const selectionsById = new Map<string, ProgramBinding>();
    const selectionsByName = new Map<string, ProgramBinding>();

    allSelections.forEach((entry) => {
      const binding: ProgramBinding = {
        programName: entry.programName.trim() || 'CUSTOM_PROGRAM',
        selectionId: entry.id,
        sourceScope: entry.sourceScope || entry.athleteId || 'new',
      };
      if (entry.athleteId) {
        selectionsById.set(entry.athleteId, binding);
      }

      const nameKey = entry.athleteName.trim().toLowerCase();
      if (nameKey) {
        selectionsByName.set(nameKey, binding);
      }
    });

    const mappedAthletes = athletes.map((athlete) => {
      const selectionBinding =
        selectionsById.get(athlete.id) ?? selectionsByName.get(athlete.name.trim().toLowerCase());
      if (selectionBinding) {
        return buildAthleteFromSelection(athlete, selectionBinding);
      }

      const draftProgramName = createdDraftPrograms.get(athlete.id);
      if (draftProgramName) {
        return buildAthleteFromDraftOverlay(athlete, draftProgramName);
      }

      return athlete;
    });

    const baseAthleteIds = new Set(athletes.map((athlete) => athlete.id));
    const baseAthleteNames = new Set(athletes.map((athlete) => athlete.name.trim().toLowerCase()));

    const virtualAthletes = allSelections
      .filter((entry) => {
        const hasIdMatch = entry.athleteId ? baseAthleteIds.has(entry.athleteId) : false;
        const hasNameMatch = baseAthleteNames.has(entry.athleteName.trim().toLowerCase());
        return !hasIdMatch && !hasNameMatch;
      })
      .map((entry, index) => buildVirtualAthleteFromSelection(entry, index));

    return [...virtualAthletes, ...mappedAthletes];
  }, [athletes, allSelections, createdDraftPrograms]);

  const deleteProgram = useCallback((athlete: AthleteData) => {
    if (!athlete.canDeleteProgram) return;

    if (athlete.programSelectionId) {
      deleteProgramSelectionById(athlete.programSelectionId);
    }

    if (athlete.programSourceScope && athlete.programSourceScope !== 'new') {
      deleteProgramSelectionsByScope(athlete.programSourceScope);
      clearProgramDraftCache(athlete.programSourceScope);
    }

    if (athlete.id && !athlete.id.startsWith('selection-')) {
      clearProgramDraftCache(athlete.id);
    }

    setProgramMutationTick((prev) => prev + 1);
  }, []);

  const filteredAthletes = athletesWithPrograms.filter(
    (athlete) =>
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.idEntry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.currentProtocol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    athletes: filteredAthletes,
    isLoading,
    searchQuery,
    setSearchQuery,
    deleteProgram,
  };
}
