export interface AnalyticsMetrics {
  totalTonnageKg: number;
  avgSessionRpe: number;
  newPrsRecorded: number;
  activeAthletes: number;
}

export interface StrengthTrajectoryPoint {
  name: string;
  SQ: number;
  BP: number;
  DL: number;
  isPeak?: boolean;
}

export interface MovementDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface AthleteConsistencyEntry {
  rank: string;
  name: string;
  program: string;
  consistency: ('red' | 'gray')[];
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  trajectoryData: StrengthTrajectoryPoint[];
  movementDistribution: MovementDistributionItem[];
  athleteConsistency: AthleteConsistencyEntry[];
}

export interface IAnalyticsRepository {
  getAnalyticsData(): Promise<AnalyticsData>;
}
