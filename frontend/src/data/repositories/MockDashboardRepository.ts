import type { DashboardData, IDashboardRepository } from '../../domain/entities/DashboardData';

const mockData: DashboardData = {
  stats: {
    activeCount: 42,
    uptimeChange: 4,
  },
  liveProtocols: [
    {
      id: 'p1',
      athleteName: 'MARCUS THORNE',
      status: 'CALIBRATING',
      protocolName: 'HYPERTROPHY_V4 [OFF-SEASON]',
      progressText: 'WEEK 06 / 12',
      progressPercent: 50,
      nextSession: '2023.10.27 // 06:00'
    },
    {
      id: 'p2',
      athleteName: 'ELENA RODRIGUEZ',
      status: 'PEAK_WEEK',
      protocolName: 'CONJUGATE_STRENGTH_MAX',
      intensityOutputText: '94%',
      intensityOutputPercent: 94,
      nextSession: '2023.10.24 // 14:30'
    }
  ],
  recentProtocols: [
    { id: 'r1', protocolId: '#4592-A', programName: 'Linear Progression: Novice Block', modifiedBy: 'S. Vance', timestamp: '2023.10.23 // 11:42:01', status: 'STAGED' },
    { id: 'r2', protocolId: '#3102-X', programName: 'Conditioning: Gas Tank Expansion', modifiedBy: 'J. Doe', timestamp: '2023.10.23 // 09:15:55', status: 'DEPLOYED' },
    { id: 'r3', protocolId: '#8821-B', programName: 'Olympic Weightlifting Tech [W4]', modifiedBy: 'S. Vance', timestamp: '2023.10.22 // 18:22:10', status: 'ARCHIVE' },
    { id: 'r4', protocolId: '#1104-K', programName: 'Bench Press Specialization: Vol 2', modifiedBy: 'M. Ross', timestamp: '2023.10.21 // 14:10:44', status: 'DEPLOYED' },
  ],
  tonnageLoad: {
    currentTotal: 1284500,
    unit: 'KG',
    history: [20, 30, 45, 60, 75, 95] // representative heights for the bars
  },
  alerts: [
    {
      id: 'a1',
      type: 'WARNING',
      title: 'HIGH INTENSITY DETECTED',
      message: 'M. Thorne exceeded RPE target in Squat Phase...',
      meta: {
        'LAT': '40.7128° N',
        'LON': '74.0060° W',
        'SYS_STATUS': 'OPTIMAL_OUTPUT'
      }
    },
    {
      id: 'a2',
      type: 'SUCCESS',
      title: 'SYNC SUCCESSFUL',
      message: 'SmartRack telemetry updated for 14 athletes',
      timestamp: '12M AGO'
    }
  ]
};

export class MockDashboardRepository implements IDashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve(mockData), 300));
  }
}

export const dashboardRepository = new MockDashboardRepository();
