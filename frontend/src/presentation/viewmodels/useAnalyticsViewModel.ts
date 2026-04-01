import { useEffect, useState } from 'react';
import type { AnalyticsData } from '../../domain/entities/AnalyticsData';
import { analyticsRepository } from '../../data/repositories/ApiAnalyticsRepository';

export function useAnalyticsViewModel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const result = await analyticsRepository.getAnalyticsData();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void fetchAnalytics();

    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error };
}
