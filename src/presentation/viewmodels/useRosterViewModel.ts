import { useState, useEffect } from 'react';
import type { AthleteData } from '../../domain/entities/AthleteData';
import { athleteRepository } from '../../data/repositories/MockAthleteRepository';

export function useRosterViewModel() {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    athleteRepository.getAthletes().then(result => {
      if (active) {
        setAthletes(result);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const filteredAthletes = athletes.filter(athlete => 
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.idEntry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { 
    athletes: filteredAthletes, 
    isLoading, 
    searchQuery, 
    setSearchQuery 
  };
}
