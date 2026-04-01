import { useState, useEffect } from 'react';
import type { DashboardData } from '../../domain/entities/DashboardData';
import { dashboardRepository } from '../../data/repositories/ApiDashboardRepository';

export function useDashboardViewModel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const result = await dashboardRepository.getDashboardData();
        if (active) {
          setData(result);
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

    fetchDashboard();
    
    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh: () => {
      // Logic to refetch if needed
    }
  };
}
