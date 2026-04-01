# Refactoring Plan: Strength Lab Frontend Codebase

## Executive Summary

Your frontend codebase already demonstrates good architectural decisions with clean separation between presentation, domain, and data layers. This refactoring plan aims to:

1. **Reduce code duplication** across spreadsheet and program builder components
2. **Improve maintainability** by centralizing shared logic and utilities
3. **Enhance testability** by extracting business logic from components
4. **Strengthen type safety** with better type organization
5. **Optimize imports** and reduce tight coupling

---

## Current Architecture Assessment

### ✅ Strengths
- **Clean Layering**: Presentation/Domain/Data separation is well-established
- **Repository Pattern**: Good abstraction for API/mock data
- **Context API**: Auth management is properly isolated
- **Component Modularity**: Views and components are reasonably well-separated

### ⚠️ Areas for Improvement
- **Scattered Utilities**: Formula engine, CSV, autocomplete logic not well-organized
- **Component Complexity**: `ProgramBuilder.tsx` is 500+ lines with multiple responsibilities
- **Duplicate Logic**: CSV handling exists in both components
- **Type Organization**: Types are scattered across different files
- **Hook Placement**: Custom hooks spread across different folders
- **Configuration**: Constants embedded in components
- **Import Paths**: Heavy reliance on relative paths (`../../`)

---

## Proposed File Structure

```
frontend/src/
├── main.tsx
├── App.tsx
├── index.css
├── App.css
│
├── config/                          # ⭐ NEW: Centralized configuration
│   ├── constants.ts                 # App-wide constants
│   ├── api.config.ts                # API configuration
│   └── spreadsheet.config.ts         # Spreadsheet defaults & presets
│
├── shared/                          # ⭐ REORGANIZED: Shared utilities
│   ├── utils/
│   │   ├── formula/
│   │   │   ├── formulaEngine.ts      # Formula parsing & evaluation (move from utils/)
│   │   │   ├── functionRegistry.ts   # ⭐ NEW: Centralized formula functions
│   │   │   └── types.ts              # Formula-specific types
│   │   ├── csv/
│   │   │   ├── csvParser.ts          # ⭐ NEW: CSV parsing logic
│   │   │   ├── csvExporter.ts        # ⭐ NEW: CSV export logic
│   │   │   └── types.ts              # CSV-specific types
│   │   ├── cell/
│   │   │   ├── cellKeyGenerator.ts   # ⭐ NEW: Cell key patterns
│   │   │   └── cellUtils.ts          # Cell manipulation utilities
│   │   ├── validation/
│   │   │   ├── validators.ts         # ⭐ NEW: Input validators
│   │   │   └── errorFormatter.ts     # ⭐ NEW: Error message formatting
│   │   └── common/
│   │       ├── array.ts              # Array utilities
│   │       ├── object.ts             # Object utilities
│   │       └── string.ts             # String utilities
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── spreadsheet/              # ⭐ MOVED: Shared spreadsheet components
│   │   │   ├── SpreadsheetCell.tsx
│   │   │   ├── SpreadsheetGrid.tsx
│   │   │   ├── SpreadsheetToolbar.tsx
│   │   │   ├── FormulaBar.tsx
│   │   │   └── types.ts
│   │   └── layout/
│   │       └── Layout.tsx            # (move from presentation/components/layout)
│   │
│   ├── hooks/
│   │   ├── useAsync.ts               # ⭐ NEW: Generic async hook
│   │   ├── useLocalStorage.ts         # ⭐ NEW: LocalStorage hook
│   │   ├── useDebounce.ts             # ⭐ NEW: Debounce hook
│   │   ├── useWindowSize.ts           # ⭐ NEW: Window size hook
│   │   └── index.ts                   # Barrel export
│   │
│   └── types/
│       ├── common.ts                  # ⭐ NEW: Common types
│       ├── api.ts                     # API-related types
│       └── ui.ts                      # UI-related types
│
├── presentation/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.tsx
│   │   └── index.ts                   # Barrel exports
│   │
│   ├── viewmodels/                    # ✅ Keep as is
│   │   ├── useAthleteViewModel.ts
│   │   ├── useDashboardViewModel.ts
│   │   ├── useProgramViewModel.ts
│   │   ├── useRosterViewModel.ts
│   │   └── index.ts                   # ⭐ NEW: Barrel exports
│   │
│   ├── views/
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── LoginView.tsx
│   │   │   ├── SignupView.tsx
│   │   │   ├── ForgotPasswordView.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardView.tsx
│   │   │   ├── components/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── RecentActivity.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── athlete/
│   │   │   ├── AthleteView.tsx
│   │   │   ├── components/
│   │   │   │   └── AthleteCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── program/
│   │   │   ├── ProgramView.tsx
│   │   │   ├── RosterSelectorView.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProgramBuilder.tsx
│   │   │   │   ├── ProgramBuilderToolbar.tsx    # ⭐ NEW: Extracted toolbar
│   │   │   │   ├── ProgramBuilderSheet.tsx      # ⭐ NEW: Sheet management
│   │   │   │   ├── ProgramBuilderState.ts       # ⭐ NEW: State management
│   │   │   │   ├── spreadsheet/
│   │   │   │   │   ├── Spreadsheet.tsx
│   │   │   │   │   ├── CSVImportExport.tsx
│   │   │   │   │   └── hooks/                   # ⭐ NEW: Spreadsheet hooks
│   │   │   │   │       ├── useSpreadsheetState.ts
│   │   │   │   │       ├── useSpreadsheetActions.ts
│   │   │   │   │       └── useKeyboardNavigation.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── formulaEngine.ts
│   │   │   │   │   ├── autocomplete.ts
│   │   │   │   │   └── programDraftCache.ts
│   │   │   │   └── types/
│   │   │   │       ├── spreadsheet.ts
│   │   │   │       └── program.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── AnalyticsView.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── InventoryView.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── public/
│   │       ├── PrivacyView.tsx
│   │       ├── SupportView.tsx
│   │       ├── TermsView.tsx
│   │       └── index.ts
│   │
│   └── auth/                          # ✅ Keep as is
│       ├── AuthContext.ts
│       ├── AuthProvider.tsx
│       ├── RequireAuth.tsx
│       ├── useAuth.ts
│       └── index.ts                   # ⭐ NEW: Barrel exports
│
├── domain/
│   ├── entities/
│   │   ├── AthleteData.ts
│   │   ├── AuthData.ts
│   │   ├── DashboardData.ts
│   │   ├── ProgramData.ts
│   │   └── index.ts                   # ⭐ NEW: Barrel exports
│   │
│   └── usecases/                      # ⭐ NEW: Optional - Business logic layer
│       ├── program/
│       │   ├── calculateProgramVolume.ts
│       │   └── validateProgram.ts
│       └── athlete/
│           └── calculateStats.ts
│
├── data/
│   ├── repositories/
│   │   ├── ApiAuthRepository.ts
│   │   ├── ApiProgramRepository.ts
│   │   ├── MockAthleteRepository.ts
│   │   ├── MockAuthRepository.ts
│   │   ├── MockDashboardRepository.ts
│   │   ├── MockProgramRepository.ts
│   │   └── index.ts                   # ⭐ NEW: Barrel exports
│   │
│   └── services/                      # ⭐ NEW: Optional - API/Network layer
│       ├── httpClient.ts
│       └── errorHandler.ts
│
└── assets/                            # ✅ Keep as is
    └── ...
```

---

## Detailed Changes by Area

### 1. Configuration Layer (`config/`)

#### `config/constants.ts`
```typescript
// Application-wide constants
export const APP_NAME = 'Strength Lab';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const API_TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ironlog.auth.token',
  PROGRAM_DRAFT: 'ironlog.program.draft',
  USER_PREFERENCES: 'ironlog.user.preferences',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

#### `config/spreadsheet.config.ts`
```typescript
import type { SheetGridColumn } from '../shared/components/spreadsheet/types';

export const SPREADSHEET_DEFAULTS = {
  DEFAULT_WEEKS: 4,
  DEFAULT_COLUMNS: [
    { key: 'week_day', label: 'WEEK/DAY', width: '100px' },
    { key: 'exercise', label: 'EXERCISE', width: '180px' },
    { key: 'sets', label: 'SETS', width: '70px' },
    { key: 'reps', label: 'REPS', width: '70px' },
    { key: 'intensity', label: 'INTENSITY (%)', width: '90px' },
    { key: 'rest', label: 'REST (MIN)', width: '90px' },
    { key: 'load', label: 'LOAD (kg)', width: '90px' },
    { key: 'notes', label: 'NOTES', width: '200px' },
  ] as SheetGridColumn[],
  DEFAULT_VARIABLES: {
    SQ_1RM: 315,
    BP_1RM: 225,
    DL_1RM: 405,
    MASS_KG: 105,
    BASE_VOL: 4,
    WEEK: 1,
  } as Record<string, number>,
  DAYS_PER_WEEK: 3,
  ROWS_PER_DAY: 5,
} as const;

export const CELL_DIMENSIONS = {
  HEADER_HEIGHT: 32,
  ROW_HEIGHT: 28,
  MIN_COLUMN_WIDTH: 50,
  MAX_COLUMN_WIDTH: 400,
} as const;
```

---

### 2. Shared Utility Functions

#### `shared/utils/formula/formulaEngine.ts`
```typescript
/**
 * Formula Engine
 * Handles parsing, validation, and evaluation of spreadsheet formulas
 * 
 * Examples:
 * - =SQ_1RM * 0.8
 * - =BASE_VOL + WEEK
 * - =IF(WEEK > 4, 10, 5)
 */

import type { CellData, CellState } from '../../../shared/components/spreadsheet/types';

export interface FormulaResult {
  resolved: string;
  error: string | null;
  isDirty: boolean;
}

export class FormulaEvaluationError extends Error {
  constructor(
    message: string,
    public cellKey: string,
    public formulaText: string,
  ) {
    super(message);
    this.name = 'FormulaEvaluationError';
  }
}

/**
 * Parse and evaluate a formula string
 * @param formula The raw formula string (may start with =)
 * @param cells Current cell state for dependencies
 * @param variables Variable context for formula evaluation
 * @returns Evaluation result with resolved value or error
 */
export function parseFormula(
  formula: string,
  cells: CellState,
  variables: Record<string, number>,
): FormulaResult {
  try {
    // Trim and check if empty
    const trimmed = formula.trim();
    if (!trimmed) {
      return { resolved: '', error: null, isDirty: false };
    }

    // If not a formula, return as-is
    if (!trimmed.startsWith('=')) {
      return { resolved: trimmed, error: null, isDirty: false };
    }

    // Parse and evaluate formula
    const expression = trimmed.slice(1); // Remove leading =
    const result = evaluateExpression(expression, cells, variables);
    
    return {
      resolved: String(result),
      error: null,
      isDirty: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      resolved: '',
      error: message,
      isDirty: true,
    };
  }
}

/**
 * Resolve all cells dependently
 * Updates cells that have formula references to other cells
 */
export function resolveAll(
  cells: CellState,
  variables: Record<string, number>,
): CellState {
  const resolved = { ...cells };
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops

  while (iterations < maxIterations) {
    let changed = false;
    
    for (const [key, data] of Object.entries(resolved)) {
      if (!data.raw.startsWith('=')) continue;
      
      const result = parseFormula(data.raw, resolved, variables);
      if (result.resolved !== data.resolved || result.error !== data.error) {
        resolved[key] = {
          ...data,
          resolved: result.resolved,
          error: result.error,
        };
        changed = true;
      }
    }

    if (!changed) break;
    iterations++;
  }

  return resolved;
}

/**
 * Get all cells with errors
 */
export function getErrorCells(cells: CellState): string[] {
  return Object.entries(cells)
    .filter(([, data]) => data.error !== null)
    .map(([key]) => key);
}

// Private helper
function evaluateExpression(
  expr: string,
  cells: CellState,
  variables: Record<string, number>,
): number {
  // Implementation of expression evaluation
  // Using safe mathjs or custom parser
  // This is a simplified example
  
  let result = expr;
  
  // Replace variable references
  for (const [varName, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(value));
  }

  // Replace cell references
  for (const [cellKey, data] of Object.entries(cells)) {
    const resolvedValue = data.resolved || '0';
    result = result.replace(new RegExp(`\\b${cellKey}\\b`, 'g'), resolvedValue);
  }

  // Safely evaluate the expression
  return Function('"use strict"; return (' + result + ')')();
}
```

#### `shared/utils/csv/csvParser.ts`
```typescript
/**
 * CSV Parser
 * Handles parsing CSV files into data structures
 */

export interface CSVParseOptions {
  hasHeader?: boolean;
  delimiter?: string;
  ignoreEmptyLines?: boolean;
}

export interface ParsedCSV {
  headers?: string[];
  rows: string[][];
  errors: ParseError[];
}

export interface ParseError {
  line: number;
  message: string;
}

/**
 * Parse CSV file content
 */
export function parseCSV(
  content: string,
  options: CSVParseOptions = {},
): ParsedCSV {
  const {
    hasHeader = true,
    delimiter = ',',
    ignoreEmptyLines = true,
  } = options;

  const errors: ParseError[] = [];
  const lines = content.split('\n');
  const rows: string[][] = [];
  let headers: string[] | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (ignoreEmptyLines && !line.trim()) {
      continue;
    }

    try {
      const row = parseCSVLine(line, delimiter);
      
      if (i === 0 && hasHeader) {
        headers = row;
      } else {
        rows.push(row);
      }
    } catch (error) {
      errors.push({
        line: i + 1,
        message: error instanceof Error ? error.message : 'Parse error',
      });
    }
  }

  return { headers, rows, errors };
}

/**
 * Parse a single CSV line
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
```

#### `shared/utils/csv/csvExporter.ts`
```typescript
/**
 * CSV Exporter
 * Handles exporting data structures to CSV format
 */

import type { SpreadsheetData } from '../../../shared/components/spreadsheet/types';

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

/**
 * Export spreadsheet data to CSV format
 */
export function spreadsheetToCSV(
  data: SpreadsheetData,
  options: ExportOptions = {},
): string {
  const { includeTimestamp = true } = options;
  
  const headers = data.columns.map(col => escapeCSVField(col.label));
  const headerRow = headers.join(',');

  const dataRows = data.rows.map(row =>
    row.map(cell => escapeCSVField(String(cell))).join(',')
  );

  let csv = headerRow + '\n' + dataRows.join('\n');

  if (includeTimestamp) {
    const timestamp = new Date().toISOString().split('T')[0];
    csv = `# Exported: ${timestamp}\n${csv}`;
  }

  return csv;
}

/**
 * Escape a CSV field value
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download CSV as file
 */
export function downloadCSV(csv: string, filename: string = 'export.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
```

---

### 3. Shared Hooks

#### `shared/hooks/useAsync.ts`
```typescript
/**
 * Generic Async Hook
 * Manages loading, error, and data states for async operations
 */

import { useCallback, useEffect, useReducer } from 'react';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

type AsyncAction<T> =
  | { type: 'PENDING' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' };

function asyncReducer<T>(
  state: AsyncState<T>,
  action: AsyncAction<T>,
): AsyncState<T> {
  switch (action.type) {
    case 'PENDING':
      return { status: 'pending' };
    case 'SUCCESS':
      return { status: 'success', data: action.data };
    case 'ERROR':
      return { status: 'error', error: action.error };
    case 'RESET':
      return { status: 'idle' };
  }
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  deps: unknown[] = [],
) {
  const [state, dispatch] = useReducer(asyncReducer<T>, {
    status: 'idle',
  } as AsyncState<T>);

  const execute = useCallback(async () => {
    dispatch({ type: 'PENDING' });
    try {
      const data = await asyncFunction();
      dispatch({ type: 'SUCCESS', data });
    } catch (error) {
      dispatch({
        type: 'ERROR',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      void execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
```

---

### 4. Refactored Components

#### `presentation/views/program/components/ProgramBuilder.tsx` (Simplified)
```typescript
/**
 * ProgramBuilder Component
 * Main container for program building interface
 * 
 * Responsibilities:
 * - Coordinate sheet management
 * - Manage toolbar interactions
 * - Coordinate spreadsheet and formula bar
 */

import { useState, useCallback } from 'react';
import { ProgramBuilderToolbar } from './ProgramBuilderToolbar';
import { ProgramBuilderSheet } from './ProgramBuilderSheet';
import { Spreadsheet } from './spreadsheet/Spreadsheet';
import type { ProgramSheet, ProgramBuilderProps } from './types/program';
import { useProgramBuilderState } from './ProgramBuilderState';

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  initialWeeks = 4,
  initialState = null,
  startEmpty = false,
  onStateChange,
}) => {
  const {
    sheets,
    activeSheetIndex,
    activeSheet,
    addSheet,
    selectSheet,
    updateActiveSheet,
  } = useProgramBuilderState(initialWeeks, initialState, startEmpty);

  const [darkMode, setDarkMode] = useState(false);

  const handleSave = useCallback(async () => {
    // Save logic here
  }, [activeSheet]);

  return (
    <div className={`program-builder ${darkMode ? 'dark' : ''}`}>
      <ProgramBuilderToolbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onSave={handleSave}
      />

      <div className="builder-container">
        <ProgramBuilderSheet
          sheets={sheets}
          activeIndex={activeSheetIndex}
          onSelectSheet={selectSheet}
          onAddSheet={addSheet}
        />

        {activeSheet && (
          <Spreadsheet
            initialData={activeSheet.cells}
            columns={activeSheet.columns}
            variables={activeSheet.variables}
            onStateChange={onStateChange}
          />
        )}
      </div>
    </div>
  );
};
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Create `config/` directory with constants
2. Create `shared/utils/` structure
3. Create `shared/hooks/` directory
4. Add barrel exports to each module

### Phase 2: Refactor Utilities (Week 2)
1. Extract formula engine utilities
2. Extract CSV handling utilities
3. Extract cell utilities
4. Update imports in existing components

### Phase 3: Reorganize Components (Week 3)
1. Move shared components to `shared/components/`
2. Move spreadsheet-specific hooks
3. Extract toolbar from ProgramBuilder
4. Add barrel exports

### Phase 4: Update State Management (Week 4)
1. Extract state logic to `ProgramBuilderState.ts`
2. Create custom hooks for spreadsheet state
3. Update component props
4. Test all functionality

### Phase 5: Testing & Documentation (Week 5)
1. Write unit tests for utilities
2. Write integration tests for components
3. Update JSDoc comments
4. Create developer guide

---

## Benefits of This Refactoring

| Aspect | Before | After |
|--------|--------|-------|
| **Maintainability** | Large monolithic components | Clear separation of concerns |
| **Reusability** | Duplicated logic in multiple places | Shared utilities and components |
| **Testability** | Business logic mixed with UI | Pure functions and isolated components |
| **Type Safety** | Scattered type definitions | Centralized, well-organized types |
| **Import Paths** | Many relative imports (`../../`) | Shorter, clearer paths |
| **Performance** | Monolithic bundles | Better tree-shaking potential |
| **Scalability** | Difficult to add features | Easy to extend and add modules |

---

## Implementation Examples

### Before (Current)
```typescript
// ProgramBuilder.tsx - 500+ lines with mixed concerns
const ProgramBuilder: React.FC<Props> = (props) => {
  const [cells, setCells] = useState({});
  const [variables, setVariables] = useState({});
  const [sheets, setSheets] = useState([]);
  
  // Formula parsing inline
  const handleValueChange = (key, value) => {
    const result = parseFormula(value, cells, variables);
    // Complex logic here
  };
  
  // CSV export inline
  const exportToCSV = () => {
    // CSV logic here
  };
  
  return (/* Complex JSX */);
};
```

### After (Refactored)
```typescript
// ProgramBuilder.tsx - ~100 lines, focused on composition
import { useProgramBuilderState } from './ProgramBuilderState';
import { ProgramBuilderToolbar } from './ProgramBuilderToolbar';

export const ProgramBuilder: React.FC<Props> = (props) => {
  const { sheets, activeSheet, selectSheet, addSheet } = 
    useProgramBuilderState(props);

  return (
    <div className="program-builder">
      <ProgramBuilderToolbar />
      <ProgramBuilderSheet sheets={sheets} onSelect={selectSheet} />
      <Spreadsheet sheet={activeSheet} />
    </div>
  );
};
```

And separate utility files:

```typescript
// shared/utils/formula/formulaEngine.ts
export function parseFormula(formula, cells, variables) {
  // Pure formula logic
}

// shared/utils/csv/csvExporter.ts
export function spreadsheetToCSV(data, options) {
  // CSV export logic
}

// ProgramBuilderState.ts
export function useProgramBuilderState(initialWeeks, initialState) {
  const [sheets, setSheets] = useState([]);
  // State management logic
  return { sheets, selectSheet, addSheet, ... };
}
```

---

## Key Files to Update

| File | Change Type | Priority |
|------|-------------|----------|
| `App.tsx` | Import paths | Medium |
| `ProgramBuilder.tsx` | Extract logic → ~50 lines | High |
| `ProgramView.tsx` | Import updates | Medium |
| All view files | Barrel imports | Low |
| Repository files | Add barrel exports | Low |

---

## Testing Strategy

### Unit Tests
- Formula parser functions
- CSV parser/exporter
- Cell utilities

### Component Tests
- Spreadsheet grid rendering
- Toolbar interactions
- Sheet management

### Integration Tests
- ProgramBuilder with all sub-components
- Form validation flows

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking existing functionality | Comprehensive testing before deployment |
| Large refactor scope | Phase-based approach with checkpoints |
| Import path confusion | Clear documentation + TypeScript strict mode |
| Performance regression | Profile before/after |

---

## Success Criteria

✅ All existing functionality works unchanged  
✅ Codebase is more testable (each file has single responsibility)  
✅ Import paths are shorter and clearer  
✅ Utilities are reusable across components  
✅ Type safety is improved  
✅ Documentation is comprehensive  
✅ No performance regression  

---

## Next Steps

1. Review and approve this plan
2. Create `config/` directory structure
3. Begin Phase 1 implementation
4. Test incrementally after each phase
5. Update team documentation
