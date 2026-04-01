# Refactoring Implementation Guide

## Overview
This guide provides step-by-step implementation examples for the proposed refactoring.

---

## Phase 1: Setup Configuration Layer

### Step 1.1: Create Config Directory Structure

```bash
mkdir -p frontend/src/config
```

### Step 1.2: API Configuration

**File: `frontend/src/config/api.config.ts`**

```typescript
/**
 * API Configuration
 * Centralized configuration for all API-related constants
 */

export const API_CONFIG = {
  // Base URL configuration
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      GET_SESSION: '/auth/session',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    PROGRAMS: {
      LIST: '/programs',
      CREATE: '/programs',
      GET: (id: string) => `/programs/${id}`,
      UPDATE: (id: string) => `/programs/${id}`,
      DELETE: (id: string) => `/programs/${id}`,
    },
    ATHLETES: {
      LIST: '/athletes',
      GET: (id: string) => `/athletes/${id}`,
    },
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard',
      PERFORMANCE: (athleteId: string) => `/analytics/performance/${athleteId}`,
    },
  },

  // Timeouts (in milliseconds)
  TIMEOUT: {
    SHORT: 5000,       // For quick operations
    MEDIUM: 15000,     // For normal operations
    LONG: 30000,       // For file uploads/downloads
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MULTIPLIER: 2,
    INITIAL_DELAY: 1000,
  },

  // Error configuration
  ERROR_MESSAGES: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'Unauthorized. Please log in again.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'There are validation errors in your input.',
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
```

### Step 1.3: Storage Configuration

**File: `frontend/src/config/storage.config.ts`**

```typescript
/**
 * Storage Configuration
 * Centralized storage key management
 */

export const STORAGE_CONFIG = {
  // Token storage
  AUTH: {
    TOKEN: 'ironlog.auth.token',
    REFRESH_TOKEN: 'ironlog.auth.refresh_token',
    REMEMBER_ME: 'ironlog.auth.remember_me',
  },

  // Program drafts
  PROGRAMS: {
    DRAFT_PREFIX: 'ironlog.program.draft.',
    LAST_ACCESSED: 'ironlog.program.last_accessed',
  },

  // User preferences
  USER: {
    DARK_MODE: 'ironlog.user.dark_mode',
    LANGUAGE: 'ironlog.user.language',
    THEME: 'ironlog.user.theme',
  },

  // Spreadsheet preferences
  SPREADSHEET: {
    COLUMN_WIDTHS: 'ironlog.spreadsheet.column_widths',
    LAST_SCROLL: 'ironlog.spreadsheet.last_scroll',
  },
} as const;

export type StorageConfig = typeof STORAGE_CONFIG;

/**
 * Get storage key with namespace
 */
export function getStorageKey(domain: string, key: string): string {
  return `${domain}.${key}`;
}

/**
 * Safe localStorage wrapper with TypeScript support
 */
export class StorageManager {
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static getItem<T>(key: string, fallback?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback ?? null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return fallback ?? null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
```

---

## Phase 2: Extract Utility Functions

### Step 2.1: Formula Engine Utilities

**File: `frontend/src/shared/utils/formula/types.ts`**

```typescript
/**
 * Formula Engine Type Definitions
 */

import type { CellData } from '../../../shared/components/spreadsheet/types';

export interface FormulaContext {
  cells: Record<string, CellData>;
  variables: Record<string, number | string>;
}

export interface FormulaResult {
  value: string | number;
  error: string | null;
  isDirty: boolean;
  evaluationTime: number;
}

export interface ParsedFormula {
  type: 'literal' | 'formula' | 'reference';
  raw: string;
  expression?: string;
  references?: string[];
}

export interface FormulaFunction {
  name: string;
  description: string;
  numArgs?: number | [number, number]; // Fixed or [min, max]
  execute: (...args: (string | number)[]) => number | string;
}

export class FormulaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cellKey?: string,
  ) {
    super(message);
    this.name = 'FormulaError';
  }
}
```

**File: `frontend/src/shared/utils/formula/functionRegistry.ts`**

```typescript
/**
 * Formula Function Registry
 * Central registry for all available formula functions
 */

import type { FormulaFunction } from './types';

class FunctionRegistry {
  private functions: Map<string, FormulaFunction> = new Map();

  constructor() {
    this.registerDefaultFunctions();
  }

  private registerDefaultFunctions(): void {
    // Math functions
    this.register({
      name: 'ABS',
      description: 'Returns absolute value',
      numArgs: 1,
      execute: (n) => Math.abs(Number(n)),
    });

    this.register({
      name: 'SQRT',
      description: 'Returns square root',
      numArgs: 1,
      execute: (n) => Math.sqrt(Number(n)),
    });

    this.register({
      name: 'MIN',
      description: 'Returns minimum value',
      numArgs: [1, Infinity],
      execute: (...args) => Math.min(...args.map(Number)),
    });

    this.register({
      name: 'MAX',
      description: 'Returns maximum value',
      numArgs: [1, Infinity],
      execute: (...args) => Math.max(...args.map(Number)),
    });

    this.register({
      name: 'SUM',
      description: 'Returns sum of values',
      numArgs: [1, Infinity],
      execute: (...args) => args.reduce((sum, val) => sum + Number(val), 0),
    });

    this.register({
      name: 'AVERAGE',
      description: 'Returns average of values',
      numArgs: [1, Infinity],
      execute: (...args) => {
        const nums = args.map(Number);
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      },
    });

    this.register({
      name: 'IF',
      description: 'Returns value based on condition',
      numArgs: 3,
      execute: (condition, trueVal, falseVal) => {
        return Boolean(condition) ? trueVal : falseVal;
      },
    });

    // Fitness-specific functions
    this.register({
      name: 'PERCENT',
      description: 'Calculate percentage of value',
      numArgs: 2,
      execute: (value, percent) => {
        return Number(value) * (Number(percent) / 100);
      },
    });

    this.register({
      name: 'RPE_TO_PERCENT',
      description: 'Convert RPE (Rate of Perceived Exertion) to percentage of 1RM',
      numArgs: 1,
      execute: (rpe) => {
        // RPE 10 = 100%, RPE 9 = 90%, RPE 8 = 82%, etc.
        const rpeNum = Number(rpe);
        if (rpeNum >= 10) return 1.0;
        return 1.0 - (10 - rpeNum) * 0.04;
      },
    });
  }

  register(func: FormulaFunction): void {
    this.functions.set(func.name.toUpperCase(), func);
  }

  get(name: string): FormulaFunction | undefined {
    return this.functions.get(name.toUpperCase());
  }

  has(name: string): boolean {
    return this.functions.has(name.toUpperCase());
  }

  list(): FormulaFunction[] {
    return Array.from(this.functions.values());
  }

  listNames(): string[] {
    return Array.from(this.functions.keys());
  }
}

// Export singleton instance
export const functionRegistry = new FunctionRegistry();

/**
 * Get autocomplete suggestions for formula functions
 */
export function getFormulaFunctionSuggestions(prefix: string): FormulaFunction[] {
  const lowerPrefix = prefix.toUpperCase();
  return functionRegistry
    .list()
    .filter(fn => fn.name.startsWith(lowerPrefix));
}
```

### Step 2.2: CSV Utilities

**File: `frontend/src/shared/utils/csv/types.ts`**

```typescript
export interface CSVParseOptions {
  hasHeader?: boolean;
  delimiter?: string;
  encoding?: 'utf-8' | 'utf-16';
  skipEmptyLines?: boolean;
}

export interface CSVExportOptions {
  filename?: string;
  delimiter?: string;
  includeMetadata?: boolean;
  timestamp?: Date;
}

export interface CSVParseResult {
  headers?: string[];
  rows: string[][];
  errors: CSVError[];
  metadata: {
    lineCount: number;
    columnCount: number;
  };
}

export interface CSVError {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}
```

**File: `frontend/src/shared/utils/csv/csvHandler.ts`**

```typescript
/**
 * CSV Handler
 * Unified CSV parsing and exporting
 */

import type { CSVParseOptions, CSVParseResult, CSVError } from './types';

export class CSVHandler {
  /**
   * Parse CSV content
   */
  static parse(content: string, options: CSVParseOptions = {}): CSVParseResult {
    const {
      hasHeader = true,
      delimiter = ',',
      skipEmptyLines = true,
    } = options;

    const errors: CSVError[] = [];
    const lines = content.split('\n');
    const rows: string[][] = [];
    let headers: string[] | undefined;
    let columnCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (skipEmptyLines && !line) {
        continue;
      }

      try {
        const row = this.parseCSVLine(line, delimiter);
        columnCount = Math.max(columnCount, row.length);

        if (i === 0 && hasHeader) {
          headers = row;
        } else {
          rows.push(row);
        }
      } catch (error) {
        errors.push({
          line: i + 1,
          message: error instanceof Error ? error.message : 'Parse error',
          severity: 'error',
        });
      }
    }

    return {
      headers,
      rows,
      errors,
      metadata: {
        lineCount: rows.length,
        columnCount,
      },
    };
  }

  /**
   * Export data to CSV format
   */
  static export(
    headers: string[],
    rows: (string | number)[][],
    delimiter = ',',
  ): string {
    const headerLine = headers
      .map(h => this.escapeField(String(h)))
      .join(delimiter);

    const dataLines = rows.map(row =>
      row.map(cell => this.escapeField(String(cell))).join(delimiter),
    );

    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Download CSV as file
   */
  static download(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Parse CSV from file input
   */
  static async parseFile(
    file: File,
    options: CSVParseOptions = {},
  ): Promise<CSVParseResult> {
    const content = await file.text();
    return this.parse(content, options);
  }

  // Private helpers

  private static parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private static escapeField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
```

---

## Phase 3: Create Shared Hooks

### Step 3.1: Local Storage Hook

**File: `frontend/src/shared/hooks/useLocalStorage.ts`**

```typescript
/**
 * useLocalStorage Hook
 * Provides persistent state with localStorage
 */

import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### Step 3.2: Debounce Hook

**File: `frontend/src/shared/hooks/useDebounce.ts`**

```typescript
/**
 * useDebounce Hook
 * Delays function execution until user stops interacting
 */

import { useEffect, useRef, useCallback } from 'react';

export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay],
  );
}

/**
 * useDebounceValue Hook
 * Returns debounced value (useful for search inputs)
 */
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Re-export useState for use in the hook
import { useState } from 'react';
```

---

## Phase 4: Type Organization

### Step 4.1: Centralized Types

**File: `frontend/src/shared/types/spreadsheet.ts`**

```typescript
/**
 * Spreadsheet Domain Types
 * Centralized type definitions for all spreadsheet-related data
 */

export interface CellPosition {
  row: number;
  column: number;
}

export interface CellData {
  raw: string;
  resolved: string | number;
  error: string | null;
  isDirty?: boolean;
}

export type CellState = Record<string, CellData>;

export interface Column {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'number' | 'formula' | 'percentage';
  editable?: boolean;
  sortable?: boolean;
}

export interface Row {
  id: string;
  cells: Record<string, CellData>;
  metadata?: Record<string, unknown>;
}

export interface SpreadsheetData {
  columns: Column[];
  rows: Row[];
  metadata?: {
    title?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}

export type VariableState = Record<string, number | string>;

export interface SpreadsheetState {
  cells: CellState;
  variables: VariableState;
  selectedCell: string | null;
  selectionRange: SelectionRange | null;
  clipboard: CellData | null;
}

export interface SpreadsheetActions {
  selectCell: (key: string) => void;
  updateCell: (key: string, value: string) => void;
  deleteCell: (key: string) => void;
  copy: (key: string) => void;
  paste: (key: string) => void;
  undo: () => void;
  redo: () => void;
}
```

---

## Phase 5: Extract Component State

### Step 5.1: Program Builder State Logic

**File: `frontend/src/presentation/views/program/components/ProgramBuilderState.ts`**

```typescript
/**
 * Program Builder State Management
 * Extracted state logic from ProgramBuilder component
 */

import { useState, useCallback, useEffect } from 'react';
import { SPREADSHEET_DEFAULTS } from '../../../../../config/spreadsheet.config';
import type { ProgramBuilderSnapshot } from './utils/programDraftCache';
import type { SheetGridColumn } from './types/spreadsheet';
import type { VariableState, CellState } from '../../../../../shared/components/spreadsheet/types';

export interface ProgramSheet {
  id: string;
  name: string;
  cells: CellState;
  columns: SheetGridColumn[];
  rowLabels: Record<string, string>;
  variables?: VariableState;
}

export interface ProgramBuilderState {
  sheets: ProgramSheet[];
  activeSheetIndex: number;
  activeSheet: ProgramSheet | null;
}

export function useProgramBuilderState(
  initialWeeks: number = 4,
  initialState: ProgramBuilderSnapshot | null = null,
  startEmpty: boolean = false,
) {
  const defaultVariables = startEmpty
    ? {}
    : SPREADSHEET_DEFAULTS.DEFAULT_VARIABLES;

  const initialSheet: ProgramSheet = {
    id: 'sheet-1',
    name: 'Sheet 1',
    cells: initialState?.cells ?? buildInitialCells(initialWeeks),
    columns: initialState?.columns?.length
      ? initialState.columns
      : SPREADSHEET_DEFAULTS.DEFAULT_COLUMNS,
    rowLabels: initialState?.rowLabels ?? {},
    variables: initialState?.variables ?? defaultVariables,
  };

  const [sheets, setSheets] = useState<ProgramSheet[]>([initialSheet]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  const activeSheet = sheets[activeSheetIndex] ?? null;

  const selectSheet = useCallback((index: number) => {
    if (index >= 0 && index < sheets.length) {
      setActiveSheetIndex(index);
    }
  }, [sheets.length]);

  const addSheet = useCallback(() => {
    const newSheet: ProgramSheet = {
      id: `sheet-${Date.now()}`,
      name: `Sheet ${sheets.length + 1}`,
      cells: buildInitialCells(initialWeeks),
      columns: [...SPREADSHEET_DEFAULTS.DEFAULT_COLUMNS],
      rowLabels: {},
      variables: { ...defaultVariables },
    };
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetIndex(sheets.length);
  }, [sheets.length, initialWeeks, defaultVariables]);

  const updateActiveSheet = useCallback(
    (patch: Partial<ProgramSheet>) => {
      setSheets(prev =>
        prev.map((sheet, index) =>
          index === activeSheetIndex ? { ...sheet, ...patch } : sheet,
        ),
      );
    },
    [activeSheetIndex],
  );

  const renameSheet = useCallback(
    (index: number, newName: string) => {
      setSheets(prev =>
        prev.map((sheet, i) =>
          i === index ? { ...sheet, name: newName } : sheet,
        ),
      );
    },
    [],
  );

  const deleteSheet = useCallback(
    (index: number) => {
      if (sheets.length <= 1) return; // Keep at least one sheet

      setSheets(prev => prev.filter((_, i) => i !== index));

      // Adjust active index if needed
      if (activeSheetIndex >= sheets.length - 1) {
        setActiveSheetIndex(Math.max(0, sheets.length - 2));
      }
    },
    [sheets.length, activeSheetIndex],
  );

  return {
    sheets,
    activeSheetIndex,
    activeSheet,
    selectSheet,
    addSheet,
    updateActiveSheet,
    renameSheet,
    deleteSheet,
  };
}

// Helper: Build initial cell structure for given weeks
function buildInitialCells(weeks: number): CellState {
  const cells: CellState = {};
  const daysPerWeek = SPREADSHEET_DEFAULTS.DAYS_PER_WEEK;
  const rowsPerDay = SPREADSHEET_DEFAULTS.ROWS_PER_DAY;

  for (let w = 1; w <= weeks; w++) {
    for (let d = 1; d <= daysPerWeek; d++) {
      for (let r = 0; r < rowsPerDay; r++) {
        const baseKey = `W${w}_D${d}_R${r}`;
        cells[`${baseKey}_sets`] = { raw: '', resolved: '', error: null };
        cells[`${baseKey}_reps`] = { raw: '', resolved: '', error: null };
        cells[`${baseKey}_intensity`] = { raw: '', resolved: '', error: null };
        cells[`${baseKey}_rest`] = { raw: '', resolved: '', error: null };
        cells[`${baseKey}_load`] = { raw: '', resolved: '', error: null };
      }
    }
  }

  return cells;
}
```

---

## Migration Checklist

### Phase 1 Setup
- [ ] Create `config/` directory
- [ ] Create `api.config.ts`
- [ ] Create `storage.config.ts`
- [ ] Create `spreadsheet.config.ts`
- [ ] Test config imports

### Phase 2 Utilities
- [ ] Create `shared/utils/formula/` structure
- [ ] Create `shared/utils/csv/` structure
- [ ] Create `shared/utils/cell/` structure
- [ ] Move existing utilities into new structure
- [ ] Update imports in components

### Phase 3 Hooks
- [ ] Create `shared/hooks/` directory
- [ ] Create common hooks
- [ ] Add TypeScript types to hooks
- [ ] Create `index.ts` with barrel exports

### Phase 4 Types
- [ ] Centralize type definitions
- [ ] Update component imports
- [ ] Remove inline type definitions

### Phase 5 Components
- [ ] Extract component state logic
- [ ] Create custom hooks for component state
- [ ] Simplify ProgramBuilder component
- [ ] Test all functionality

---

## Validation Steps

1. **Type Checking**: Run `npm run build` to check for TypeScript errors
2. **Testing**: Run `npm run test` to ensure functionality
3. **Imports**: Verify all imports resolve correctly
4. **Linting**: Run `npm run lint` to check code quality
5. **Performance**: Profile before and after changes

---

## Rollback Plan

If issues arise:
1. Keep original files in a separate branch
2. Revert changes incrementally (phase by phase)
3. Test each revert thoroughly
4. Document findings for future refactoring attempts
