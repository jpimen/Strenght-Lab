import type { DashboardData, IDashboardRepository } from '../../domain/entities/DashboardData';
import { apiRequest } from './apiRequest';

export class ApiDashboardRepository implements IDashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    return apiRequest<DashboardData>('/programs/analytics/dashboard');
  }
}

export const dashboardRepository = new ApiDashboardRepository();
