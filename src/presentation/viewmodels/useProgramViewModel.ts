import { useState, useEffect } from 'react';
import type { ProgramData } from '../../domain/entities/ProgramData';
import { programRepository } from '../../data/repositories/MockProgramRepository';

export function useProgramViewModel(athleteId?: string) {
  const [data, setData] = useState<ProgramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // In a real app we'd fetch by ID, here we just mock it
    programRepository.getProgramData().then(result => {
      if (active) {
        setData(result);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, [athleteId]);

  return { data, isLoading };
}
