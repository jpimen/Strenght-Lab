import type { AthleteData, IAthleteRepository } from '../../domain/entities/AthleteData';

const ATHLETES_STORAGE_KEY = 'ironlog.athletes.v1';

const emptyAthlete: AthleteData = {
  id: 'athlete-empty',
  name: 'NO ATHLETE',
  idEntry: 'N/A',
  status: 'INACTIVE',
  massClass: 0,
  specObjective: 0,
  currentProtocol: 'NONE_ASSIGNED',
  imagePlaceholderUrl:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
  maxStats: {
    squat: { weight: 0, statusText: 'NO DATA', statusColor: 'gray' },
    bench: { weight: 0, statusText: 'NO DATA', statusColor: 'gray' },
    deadlift: { weight: 0, statusText: 'NO DATA', statusColor: 'gray' },
  },
  recentEntries: [],
  calibration: {
    cnsLoad: 0,
    integrity: 0,
    recovery: 0,
  },
  rawLogs: [],
};

function readAthletesFromStorage(): AthleteData[] {
  try {
    const raw = localStorage.getItem(ATHLETES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AthleteData[];
  } catch {
    return [];
  }
}

export class MockAthleteRepository implements IAthleteRepository {
  async getAthleteData(): Promise<AthleteData> {
    const athletes = readAthletesFromStorage();
    return new Promise((resolve) => setTimeout(() => resolve(athletes[0] ?? emptyAthlete), 200));
  }

  async getAthletes(): Promise<AthleteData[]> {
    const athletes = readAthletesFromStorage();
    return new Promise((resolve) => setTimeout(() => resolve(athletes), 200));
  }
}

export const athleteRepository = new MockAthleteRepository();
