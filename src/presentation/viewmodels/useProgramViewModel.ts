import { useState, useEffect } from 'react';
import type { ProgramData } from '../../domain/entities/ProgramData';
import { programRepository } from '../../data/repositories/MockProgramRepository';

export function useProgramViewModel() {
  const [data, setData] = useState<ProgramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    programRepository.getProgramData().then(result => {
      if (active) {
        setData(result);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  return { data, isLoading };
}
