import type { SheetGridColumn } from '../components/SheetGrid';
import type { CellState, VariableState } from '../types/spreadsheet';

const PROGRAM_DRAFT_CACHE_PREFIX = 'ironlog.program.draft.v1';
const PROGRAM_SELECTIONS_KEY = 'ironlog.program.selection.v1';

export interface ProgramBuilderSnapshot {
  cells: CellState;
  columns: SheetGridColumn[];
  rowLabels: Record<string, string>;
  variables: VariableState;
}

export interface ProgramDraftCache {
  programName: string;
  athleteName: string;
  goal: string;
  durationWeeks: number;
  lifecycle: 'draft' | 'created' | 'published';
  builder: ProgramBuilderSnapshot;
  updatedAt: string;
}

function getDraftStorageKey(athleteId: string) {
  return `${PROGRAM_DRAFT_CACHE_PREFIX}:${athleteId}`;
}

export type ProgramDraftEntry = {
  athleteId: string;
  draft: ProgramDraftCache;
};

export interface ProgramSelectionEntry {
  id: string;
  athleteId?: string;
  athleteName: string;
  programName: string;
  goal: string;
  durationWeeks: number;
  status: 'created' | 'published';
  sourceScope: string;
  updatedAt: string;
}

export interface SaveProgramSelectionInput {
  athleteId?: string;
  athleteName: string;
  programName: string;
  goal: string;
  durationWeeks: number;
  status: 'created' | 'published';
  sourceScope: string;
}

export function loadProgramDraftCache(athleteId: string): ProgramDraftCache | null {
  try {
    const raw = localStorage.getItem(getDraftStorageKey(athleteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgramDraftCache & { lifecycle?: ProgramDraftCache['lifecycle'] };
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.builder || typeof parsed.builder !== 'object') return null;
    return {
      ...parsed,
      lifecycle: parsed.lifecycle ?? 'draft',
    };
  } catch {
    return null;
  }
}

export function saveProgramDraftCache(athleteId: string, payload: ProgramDraftCache) {
  localStorage.setItem(getDraftStorageKey(athleteId), JSON.stringify(payload));
}

export function clearProgramDraftCache(athleteId: string) {
  localStorage.removeItem(getDraftStorageKey(athleteId));
}

function readProgramSelections(): ProgramSelectionEntry[] {
  try {
    const raw = localStorage.getItem(PROGRAM_SELECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const entries: ProgramSelectionEntry[] = [];
    parsed.forEach((entry, index) => {
      const item = entry as Partial<ProgramSelectionEntry>;
      const athleteName = String(item.athleteName ?? '').trim();
      const programName = String(item.programName ?? '').trim();
      if (!athleteName || !programName) return;

      entries.push({
        id: item.id || `legacy_${index}_${Date.now()}`,
        athleteId: item.athleteId,
        athleteName,
        programName,
        goal: String(item.goal ?? 'GENERAL'),
        durationWeeks: Number(item.durationWeeks ?? 4) || 4,
        status: item.status === 'published' ? 'published' : 'created',
        sourceScope: String(item.sourceScope ?? item.athleteId ?? 'new'),
        updatedAt: String(item.updatedAt ?? new Date().toISOString()),
      });
    });
    return entries;
  } catch {
    return [];
  }
}

function writeProgramSelections(items: ProgramSelectionEntry[]) {
  localStorage.setItem(PROGRAM_SELECTIONS_KEY, JSON.stringify(items));
}

export function saveProgramToSelection(input: SaveProgramSelectionInput): ProgramSelectionEntry {
  const selections = readProgramSelections();
  const athleteNameKey = input.athleteName.trim().toLowerCase();
  const index = selections.findIndex((entry) => {
    if (input.athleteId) return entry.athleteId === input.athleteId;
    return entry.athleteName.trim().toLowerCase() === athleteNameKey;
  });

  const updatedAt = new Date().toISOString();
  const id =
    index >= 0
      ? selections[index].id
      : (globalThis.crypto?.randomUUID?.() ?? `prog_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const nextEntry: ProgramSelectionEntry = {
    id,
    athleteId: input.athleteId,
    athleteName: input.athleteName,
    programName: input.programName,
    goal: input.goal,
    durationWeeks: input.durationWeeks,
    status: input.status,
    sourceScope: input.sourceScope,
    updatedAt,
  };

  if (index >= 0) {
    selections[index] = nextEntry;
  } else {
    selections.push(nextEntry);
  }
  writeProgramSelections(selections);

  return nextEntry;
}

export function listProgramSelections(): ProgramSelectionEntry[] {
  return readProgramSelections();
}

export function deleteProgramSelectionById(selectionId: string) {
  const selections = readProgramSelections().filter((entry) => entry.id !== selectionId);
  writeProgramSelections(selections);
}

export function deleteProgramSelectionsByScope(scope: string) {
  const selections = readProgramSelections().filter(
    (entry) => entry.sourceScope !== scope && entry.athleteId !== scope
  );
  writeProgramSelections(selections);
}

export function listProgramDraftCaches(): ProgramDraftEntry[] {
  if (typeof window === 'undefined') return [];

  const entries: ProgramDraftEntry[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(`${PROGRAM_DRAFT_CACHE_PREFIX}:`)) continue;

    const athleteId = key.slice(`${PROGRAM_DRAFT_CACHE_PREFIX}:`.length);
    if (!athleteId) continue;

    const draft = loadProgramDraftCache(athleteId);
    if (!draft) continue;
    entries.push({ athleteId, draft });
  }
  return entries;
}
