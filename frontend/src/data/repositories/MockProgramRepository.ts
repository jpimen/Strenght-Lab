import type { ProgramData, IProgramRepository } from '../../domain/entities/ProgramData';

const mockProgram: ProgramData = {
  id: 'prg1',
  name: 'HYPERTROPHY_BLOCK_AL',
  athleteName: 'John_Doe_Elite',
  durationWeeks: 12,
  goal: 'MAX FORCE OUTPUT',
  status: 'AUTO-SYNCED',
  exercises: [
    { id: 'e1', weekDay: 'W1_D1', name: 'Low Bar Back Squat (Comp)', sets: 3, reps: 5, intensity: '75% / RPE', rest: '4m', isActive: true },
    { id: 'e2', weekDay: '', name: 'Competition Bench Press', sets: 4, reps: 6, intensity: 'RPE 7.5', rest: '3m' },
    { id: 'e3', weekDay: '', name: 'Romanian Deadlift', sets: 3, reps: 10, intensity: 'RPE 6', rest: '2m' },
    { id: 'e4', weekDay: 'W1_D2', name: 'Overhead Press', sets: 4, reps: 8, intensity: '70%', rest: '3m' },
    // Empty placeholder rows to match design
    { id: 'e5', weekDay: 'W1_D3', name: '', sets: '', reps: '', intensity: '', rest: '' },
    { id: 'e6', weekDay: '', name: '', sets: '', reps: '', intensity: '', rest: '' },
  ],
  weeks: ['WEEK 1', 'WEEK 2', 'WEEK 3'],
  activeWeek: 'WEEK 1',
  activeExerciseDetail: {
    id: 'e1_detail',
    name: 'Low Bar Back Squat',
    videoPlaceholderUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop',
    tags: ['LOWER BODY', 'COMPOUND'],
    coachingNotes: 'Enter specific mechanical cues...',
    historicalLoad: {
      label: 'Last Session (Week 0)',
      weight: 185,
      reps: 5
    }
  }
};

export class MockProgramRepository implements IProgramRepository {
  async getProgramData(_programId: string): Promise<ProgramData> {
    return new Promise((resolve) => setTimeout(() => resolve(mockProgram), 300));
  }

  async publishProgram(input: ProgramData, builderData: any): Promise<{ shareCode: string; id: string }> {
    console.log('Mock publishProgram', input, builderData);
    return { shareCode: 'ABCD12', id: input.id || 'prg1' };
  }
}

export const programRepository = new MockProgramRepository();
