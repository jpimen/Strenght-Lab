/**
 * Autocomplete utilities for formula suggestions
 */

import type { VariableState, CellState } from '../types/spreadsheet';

export interface AutocompleteOption {
  label: string;
  value: string;
  description: string;
  type: 'function' | 'variable' | 'recent' | 'cell';
  currentValue?: string | number;
}

const BUILT_IN_FUNCTIONS: AutocompleteOption[] = [
  {
    label: 'ROUND',
    value: 'ROUND(value, step)',
    description: 'Round to nearest step',
    type: 'function',
  },
  {
    label: 'TONNAGE',
    value: 'TONNAGE(sets, reps, load)',
    description: 'Calculate total volume',
    type: 'function',
  },
  {
    label: 'RPE',
    value: 'RPE(rpe_val, reps)',
    description: 'Est. 1RM from RPE',
    type: 'function',
  },
  {
    label: 'AUTOLOAD',
    value: 'AUTOLOAD(1rm, intensity, increment)',
    description: 'Progressive weekly load',
    type: 'function',
  },
  {
    label: 'IF',
    value: 'IF(condition, true_val, false_val)',
    description: 'Conditional expression',
    type: 'function',
  },
  {
    label: 'SUM',
    value: 'SUM(range)',
    description: 'Sum values in range',
    type: 'function',
  },
  {
    label: 'AVG',
    value: 'AVG(range)',
    description: 'Average values',
    type: 'function',
  },
  {
    label: 'MAX',
    value: 'MAX(range)',
    description: 'Maximum value',
    type: 'function',
  },
  {
    label: 'MIN',
    value: 'MIN(range)',
    description: 'Minimum value',
    type: 'function',
  },
];

export function getVariableOptions(variables: VariableState): AutocompleteOption[] {
  return Object.entries(variables)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      label: key,
      value: key,
      description: `= ${value}`,
      type: 'variable' as const,
      currentValue: value,
    }));
}

export function getAutocompleteSuggestions(
  input: string,
  variables: VariableState
): AutocompleteOption[] {
  // If input doesn't start with =, no suggestions
  if (!input.startsWith('=')) {
    return [];
  }

  const query = input.slice(1).toLowerCase().trim();
  if (query.length === 0) {
    return BUILT_IN_FUNCTIONS;
  }

  // Filter functions and variables by query
  const functionMatches = BUILT_IN_FUNCTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(query)
  );

  const variableMatches = getVariableOptions(variables).filter((opt) =>
    opt.label.toLowerCase().includes(query)
  );

  return [...functionMatches, ...variableMatches];
}

/**
 * Get all cell references currently in use
 */
export function getCellReferences(cells: CellState): string[] {
  const refs = new Set<string>();
  const cellRefPattern = /W\d+_D\d+_R\d+_\w+/g;

  Object.values(cells).forEach((cell) => {
    const matches = cell.raw.match(cellRefPattern);
    if (matches) {
      matches.forEach((ref) => refs.add(ref));
    }
  });

  return Array.from(refs).sort();
}
