export interface LiveProtocolStats {
  activeCount: number;
  uptimeChange: number;
}

export interface AthleteProtocol {
  id: string;
  athleteName: string;
  status: 'CALIBRATING' | 'PEAK_WEEK' | 'ACTIVE';
  protocolName: string;
  progressText?: string;
  progressPercent?: number;
  intensityOutputText?: string;
  intensityOutputPercent?: number;
  nextSession: string;
}

export interface RecentProtocol {
  id: string;
  protocolId: string;
  programName: string;
  modifiedBy: string;
  timestamp: string;
  status: 'STAGED' | 'DEPLOYED' | 'ARCHIVE';
}

export interface TonnageLoad {
  currentTotal: number;
  unit: string;
  history: number[]; // e.g. last 6 cycles/weeks for the chart
}

export interface SystemAlert {
  id: string;
  type: 'WARNING' | 'SUCCESS' | 'INFO';
  title: string;
  message: string;
  timestamp?: string;
  meta?: Record<string, string>;
}

export interface DashboardData {
  stats: LiveProtocolStats;
  liveProtocols: AthleteProtocol[];
  recentProtocols: RecentProtocol[];
  tonnageLoad: TonnageLoad;
  alerts: SystemAlert[];
}

export interface IDashboardRepository {
  getDashboardData(): Promise<DashboardData>;
}
