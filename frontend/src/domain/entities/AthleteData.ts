export interface MaxStats {
  squat: { weight: number; statusText: string; statusColor: 'red' | 'gray' };
  bench: { weight: number; statusText: string; statusColor: 'red' | 'gray' };
  deadlift: { weight: number; statusText: string; statusColor: 'red' | 'gray' };
}

export interface RecentEntry {
  id: string;
  date: string;
  status: 'COMPLETE' | 'MISS_ENTRY';
  title: string;
  subtitle: string;
}

export interface CalibrationIndex {
  cnsLoad: number;
  integrity: number;
  recovery: number;
}

export interface RawLog {
  id: string;
  timestamp: string;
  movement: string;
  setsReps: string;
  loadKg: number;
  rpe: number;
  variance: string;
  varianceColor: 'red' | 'gray';
}

export interface AthleteData {
  id: string;
  name: string;
  idEntry: string;
  status: 'ACTIVE' | 'INACTIVE';
  massClass: number;
  specObjective: number;
  currentProtocol: string;
  imagePlaceholderUrl?: string;
  maxStats: MaxStats;
  recentEntries: RecentEntry[];
  calibration: CalibrationIndex;
  rawLogs: RawLog[];
  canDeleteProgram?: boolean;
  programSelectionId?: string;
  programSourceScope?: string;
}

export interface IAthleteRepository {
  getAthleteData(): Promise<AthleteData>;
  getAthletes(): Promise<AthleteData[]>;
}
