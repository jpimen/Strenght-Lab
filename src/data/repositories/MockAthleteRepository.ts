import type { AthleteData, IAthleteRepository } from '../../domain/entities/AthleteData';

const mockAthlete: AthleteData = {
  id: 'a1',
  name: 'VIKTOR REZA',
  idEntry: '9942-X',
  status: 'ACTIVE',
  massClass: 105,
  specObjective: 800.0,
  currentProtocol: 'IRON_ARCH_PHASE_3',
  imagePlaceholderUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
  maxStats: {
    squat: { weight: 285, statusText: '+5KG PROGRESSION', statusColor: 'red' },
    bench: { weight: 182, statusText: 'STABLE_METRIC', statusColor: 'gray' },
    deadlift: { weight: 315, statusText: '+12KG YTD_GAIN', statusColor: 'red' },
  },
  recentEntries: [
    {
      id: 're1',
      date: '2023.10.12',
      status: 'COMPLETE',
      title: 'HIGH INTENSITY SQUAT',
      subtitle: 'VOL: 12,400 KG / RPE: 8.5'
    },
    {
      id: 're2',
      date: '2023.10.10',
      status: 'COMPLETE',
      title: 'BENCH HYPERTROPHY',
      subtitle: 'VOL: 8,280 KG / RPE: 7.0'
    },
    {
      id: 're3',
      date: '2023.10.08',
      status: 'MISS_ENTRY',
      title: 'DEADLIFT MAX EFFORT',
      subtitle: '325kg x 1. Form break at lockout.'
    }
  ],
  calibration: {
    cnsLoad: 82,
    integrity: 95,
    recovery: 64, // Red warning trigger
  },
  rawLogs: [
    { id: 'l1', timestamp: '23_10_12:14:20', movement: 'COMP_SQUAT', setsReps: '5 x 3', loadKg: 245.0, rpe: 9.0, variance: '+2.5%', varianceColor: 'red' },
    { id: 'l2', timestamp: '23_10_12:15:05', movement: 'PAUSED_BENCH', setsReps: '4 x 6', loadKg: 145.0, rpe: 8.0, variance: '0.0%', varianceColor: 'gray' },
    { id: 'l3', timestamp: '23_10_10:11:45', movement: 'DEFICIT_DL', setsReps: '3 x 5', loadKg: 220.0, rpe: 7.5, variance: '-1.2%', varianceColor: 'red' },
    { id: 'l4', timestamp: '23_10_08:16:30', movement: 'OH_PRESS', setsReps: '5 x 5', loadKg: 95.0, rpe: 8.5, variance: '+5.0%', varianceColor: 'red' },
  ]
};

export class MockAthleteRepository implements IAthleteRepository {
  async getAthleteData(): Promise<AthleteData> {
    return new Promise(resolve => setTimeout(() => resolve(mockAthlete), 300));
  }
}

export const athleteRepository = new MockAthleteRepository();
