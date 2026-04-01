import type { AnalyticsData, IAnalyticsRepository } from '../../domain/entities/AnalyticsData';
import { apiRequest } from './apiRequest';

export class ApiAnalyticsRepository implements IAnalyticsRepository {
  async getAnalyticsData(): Promise<AnalyticsData> {
    return apiRequest<AnalyticsData>('/programs/analytics/overview');
  }
}

export const analyticsRepository = new ApiAnalyticsRepository();
