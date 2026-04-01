export interface ExerciseRow {
  id: string;
  weekDay: string; // e.g. "W1_D1", or empty if continuing same day
  name: string;
  sets: number | string;
  reps: number | string;
  intensity: string;
  rest: string;
  notes?: string;
  isActive?: boolean;
}

export interface ExerciseDetail {
  id: string;
  name: string;
  videoPlaceholderUrl?: string;
  tags: string[];
  coachingNotes: string;
  historicalLoad: {
    label: string;
    weight: number;
    reps: number;
  };
}

export interface ProgramData {
  id: string;
  name: string;
  athleteName: string;
  durationWeeks: number;
  goal: string;
  status: 'AUTO-SYNCED' | 'DRAFT' | 'CREATED' | 'PUBLISHED';
  builderData?: unknown;
  exercises: ExerciseRow[];
  weeks: string[]; // e.g. ["WEEK 1", "WEEK 2", "WEEK 3"]
  activeWeek: string;
  activeExerciseDetail?: ExerciseDetail;
}

export interface IProgramRepository {
  getProgramData(programId: string): Promise<ProgramData>;
  publishProgram(input: ProgramData, builderData: unknown): Promise<{ shareCode: string; id: string }>;
}
