import { useState } from 'react';
import type { ProgramData } from '../../domain/entities/ProgramData';
import { programRepository } from '../../data/repositories/ApiProgramRepository';

export function useProgramViewModel(athleteId?: string) {
  const [data] = useState<ProgramData | null>(null);
  const [isLoading] = useState(athleteId !== 'new');
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (input: ProgramData, builderData: any) => {
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
