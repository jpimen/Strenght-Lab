import { useState, useEffect } from 'react';
import type { AthleteData } from '../../domain/entities/AthleteData';
import { athleteRepository } from '../../data/repositories/MockAthleteRepository';

export function useAthleteViewModel() {
  const [data, setData] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    athleteRepository.getAthleteData().then(result => {
      if (active) {
        setData(result);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  return { data, isLoading };
}
