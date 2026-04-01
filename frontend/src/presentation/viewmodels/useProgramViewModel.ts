import { useState, useEffect } from 'react';
import type { ProgramData } from '../../domain/entities/ProgramData';
import { programRepository } from '../../data/repositories/ApiProgramRepository';

export function useProgramViewModel(athleteId?: string) {
  const [data, setData] = useState<ProgramData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(athleteId !== 'new');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let active = true;

    if (!athleteId || athleteId === 'new') {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    programRepository
      .getProgramData(athleteId)
      .then((program) => {
        if (!active) return;
        setData(program);
      })
      .catch(() => {
        if (!active) return;
        setData(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [athleteId]);

  const publish = async (input: ProgramData, builderData: unknown) => {
    setIsPublishing(true);
    try {
      const result = await programRepository.publishProgram(input, builderData);
      return result;
    } finally {
      setIsPublishing(false);
    }
  };

  return { data, isLoading, isPublishing, publish };
}
