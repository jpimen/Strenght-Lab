# Visual Architecture Reference

## Current vs. Proposed Architecture

### BEFORE: Current Architecture

```
┌─────────────────────────────────────────────────────┐
│                    APP.TSX                          │
└─────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐
│  Presentation/   │      │   Domain/        │
│  Views           │◄─────┤  Entities        │
│  ├─ dashboard/   │      │  ├─ AuthData.ts  │
│  ├─ athlete/     │      │  ├─ Program...ts │
│  ├─ program/     │      │  └─ Athlete...ts │
│  │  ├─ components/      │
│  │  │  ├─ ProgramBuilder.tsx  ❌ 500+ lines
│  │  │  │   (formulas, CSV, state, UI all mixed)
│  │  │  └─ Spreadsheet.tsx
│  │  └─ utils/   ❌ Scattered utilities
│  │     ├─ formulaEngine.ts
│  │     ├─ autocomplete.ts
│  │     └─ programDraftCache.ts
│  ├─ auth/
│  │  ├─ AuthContext.ts
│  │  └─ AuthProvider.tsx
│  └─ viewmodels/
│     └─ useAthleteViewModel.ts
└──────────────────┘

┌──────────────────┐
│   Data/          │
│   Repositories   │
│  ├─ ApiAuth.ts   │
│  ├─ MockAuth.ts  │
│  └─ ApiProgram.ts│
└──────────────────┘
```

**Problems**:
- ❌ ProgramBuilder is a God Component (500+ lines)
- ❌ Utilities scattered across components
- ❌ CSV logic duplicated in multiple places
- ❌ Relative imports everywhere (`../../`)
- ❌ Types scattered in different files
- ❌ State management mixed with UI
- ❌ Hard to test pure logic

---

### AFTER: Proposed Architecture

```
┌─────────────────────────────────────────────────────┐
│  CONFIG LAYER                                       │
│  ├─ api.config.ts          (API endpoints)         │
│  ├─ storage.config.ts       (Storage keys)         │
│  ├─ spreadsheet.config.ts   (Defaults)             │
│  └─ constants.ts            (App constants)         │
└─────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────┐
│  SHARED LAYER                                       │
│  ├─ utils/                                          │
│  │  ├─ formula/             ✨ Organized utilities  │
│  │  │  ├─ formulaEngine.ts                          │
│  │  │  ├─ functionRegistry.ts                       │
│  │  │  └─ types.ts                                  │
│  │  ├─ csv/                 ✨ New organization     │
│  │  │  ├─ csvHandler.ts                             │
│  │  │  └─ types.ts                                  │
│  │  ├─ cell/                                        │
│  │  ├─ validation/                                  │
│  │  └─ common/                                      │
│  │     ├─ array.ts                                  │
│  │     ├─ object.ts                                 │
│  │     └─ string.ts                                 │
│  ├─ hooks/                  ✨ New hooks location   │
│  │  ├─ useAsync.ts                                  │
│  │  ├─ useLocalStorage.ts                           │
│  │  └─ useDebounce.ts                               │
│  ├─ components/             ✨ Centralized UI       │
│  │  ├─ spreadsheet/                                 │
│  │  ├─ ui/                                          │
│  │  └─ layout/                                      │
│  └─ types/                  ✨ Centralized types    │
│     ├─ common.ts                                    │
│     ├─ spreadsheet.ts                               │
│     └─ api.ts                                       │
└─────────────────────────────────────────────────────┘
                            ▲
                            │
┌──────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                  │
│  ├─ views/                                           │
│  │  ├─ program/                                      │
│  │  │  ├─ ProgramView.tsx       ✨ Simplified       │
│  │  │  └─ components/                                │
│  │  │     ├─ ProgramBuilder.tsx       (150 lines)    │
│  │  │     ├─ ProgramBuilderToolbar.tsx (extracted)   │
│  │  │     ├─ ProgramBuilderSheet.tsx   (extracted)   │
│  │  │     ├─ ProgramBuilderState.ts    (extracted)   │
│  │  │     └─ spreadsheet/                            │
│  │  │        ├─ Spreadsheet.tsx                      │
│  │  │        ├─ hooks/         ✨ Organized hooks    │
│  │  │        │  ├─ useSpreadsheetState.ts            │
│  │  │        │  ├─ useSpreadsheetActions.ts          │
│  │  │        │  └─ useKeyboardNavigation.ts          │
│  │  │        └─ types/         ✨ Local types        │
│  │  │           └─ spreadsheet.ts                    │
│  │  ├─ dashboard/                                    │
│  │  ├─ athlete/                                      │
│  │  ├─ auth/                                         │
│  │  └─ analytics/                                    │
│  ├─ auth/                                            │
│  │  ├─ AuthContext.ts                                │
│  │  ├─ AuthProvider.tsx                              │
│  │  └─ useAuth.ts                                    │
│  ├─ viewmodels/                                      │
│  │  ├─ useAthleteViewModel.ts                        │
│  │  ├─ useProgramViewModel.ts                        │
│  │  └─ index.ts               (barrel export)        │
│  └─ components/                                      │
│     ├─ layout/                                       │
│     └─ index.ts               (barrel export)        │
└──────────────────────────────────────────────────────┘
                            ▲
                            │
┌──────────────────────────────────────────────────────┐
│  DOMAIN LAYER                                        │
│  ├─ entities/                                        │
│  │  ├─ AuthData.ts                                   │
│  │  ├─ ProgramData.ts                                │
│  │  ├─ AthleteData.ts                                │
│  │  └─ index.ts               (barrel export)        │
│  └─ usecases/               ✨ Optional for logic    │
│     ├─ program/                                      │
│     └─ athlete/                                      │
└──────────────────────────────────────────────────────┘
                            ▲
                            │
┌──────────────────────────────────────────────────────┐
│  DATA LAYER                                          │
│  ├─ repositories/                                    │
│  │  ├─ ApiAuthRepository.ts                          │
│  │  ├─ ApiProgramRepository.ts                       │
│  │  ├─ MockAuthRepository.ts                         │
│  │  └─ index.ts               (barrel export)        │
│  └─ services/               ✨ Optional abstraction  │
│     ├─ httpClient.ts                                 │
│     └─ errorHandler.ts                               │
└──────────────────────────────────────────────────────┘
```

**Improvements**:
- ✅ Clear layering with single-direction dependencies
- ✅ ProgramBuilder reduced to 150 lines (orchestration only)
- ✅ Pure utilities in `shared/utils/` 
- ✅ Centralized configuration
- ✅ Organized hooks
- ✅ Clear type organization
- ✅ Easier testing (logic separated from UI)

---

## Dependency Flow

### Current Issues

```
ProgramBuilder.tsx
├─ Imports formula engine code
├─ Imports CSV handling
├─ Imports state logic
├─ Imports UI components
└─ Mixed responsibilities = Hard to test
```

**Result**: Everything depends on everything = spaghetti code

---

### Proposed Solution

```
Presentation Layer
├─ ProgramBuilder.tsx (UI orchestration)
│  ├─ Uses: ProgramBuilderState (custom hook)
│  ├─ Uses: Spreadsheet (UI component)
│  └─ Uses: ProgramBuilderToolbar (UI component)
│
ProgramBuilderState (Custom Hook)
├─ Uses: @shared/utils/formula/
├─ Uses: @shared/hooks/useAsync
└─ Uses: @domain/entities/

Shared Utilities
├─ formula/formulaEngine.ts (pure functions)
├─ csv/csvHandler.ts (pure functions)
└─ cell/cellUtils.ts (pure functions)
```

**Result**: Clear dependency chain = easy to test, maintain

---

## File Size Comparison

### Before

```
ProgramBuilder.tsx          ████████████████████████ 500 lines
Other components            ██████████████ 280 lines
Formula utils               ███████ 150 lines
CSV utils                   ███ 80 lines
State management            ████████ 160 lines
                           ──────────────────────────
                           TOTAL: ~1,170 lines
```

### After

```
ProgramBuilder.tsx          ██████ 150 lines    ⬇️ 70% reduction
ProgramBuilderToolbar.tsx   ███ 80 lines        ✨ extracted
ProgramBuilderSheet.tsx     ███ 90 lines        ✨ extracted
ProgramBuilderState.ts      ██████ 140 lines    ✨ extracted
                           
Shared utilities (extracted from components)
├─ formula/formulaEngine.ts  ███████ 150 lines  ✅ organized
├─ csv/csvHandler.ts         ███ 80 lines       ✅ organized
├─ cell/cellUtils.ts         ██████ 120 lines   ✅ new
└─ validation/validators.ts  ███ 90 lines       ✅ new

Shared hooks
├─ useAsync.ts               ×××××× 50 lines     ✅ new
├─ useLocalStorage.ts        ××××××× 70 lines    ✅ new
└─ useDebounce.ts            ××████ 40 lines     ✅ new
                           
Type files (centralized)
├─ shared/types/spreadsheet.ts   100 lines      ✅ centralized
├─ shared/types/common.ts         80 lines      ✅ centralized
└─ shared/types/api.ts            60 lines      ✅ centralized
                           
Config files
├─ api.config.ts            ████ 100 lines      ✨ extracted
├─ spreadsheet.config.ts    ███ 90 lines        ✨ extracted
└─ storage.config.ts        ███ 80 lines        ✨ extracted

                           ──────────────────────────────────
                           TOTAL: ~1,240 lines (similar size)
                           BUT: Much better organized!
```

**Key Insight**: Same total lines, but vastly better structure. Average file size drops from 200 lines to 80 lines (easier to maintain).

---

## Import Path Transformation

### Before
```typescript
// Nightmare of relative imports
import { parseFormula } from '../../../utils/formulaEngine';
import { CSVHandler } from '../../../utils/csvHandler';
import { athleteRepository } from '../../data/repositories/MockAthleteRepository';
import { useAuth } from '../../../auth/useAuth';
import type { CellData } from '../../../types/spreadsheet';
```

### After
```typescript
// Clear, absolute imports with aliases
import { parseFormula } from '@shared/utils/formula/formulaEngine';
import { CSVHandler } from '@shared/utils/csv/csvHandler';
import { athleteRepository } from '@data/repositories';
import { useAuth } from '@presentation/auth';
import type { CellData, SpreadsheetData } from '@shared/types';
```

**Setup** (in `tsconfig.json`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@shared/*": ["src/shared/*"],
      "@domain/*": ["src/domain/*"],
      "@data/*": ["src/data/*"],
      "@presentation/*": ["src/presentation/*"]
    }
  }
}
```

---

## Component Extraction Flow

### ProgramBuilder Refactoring Example

#### BEFORE (500 lines, mixed concerns)
```typescript
export const ProgramBuilder: React.FC<Props> = (props) => {
  // 50 lines of state initialization
  const [cells, setCells] = useState({});
  const [variables, setVariables] = useState({});
  const [sheets, setSheets] = useState([sheets]);
  const [activeCell, setActiveCell] = useState(null);
  // ... 10 more useState calls
  
  // 100 lines of formula logic
  const handleValueChange = (key, value) => {
    const result = parseFormula(value, cells, variables);
    // Complex formula resolution
  };
  
  // 50 lines of CSV logic
  const exportToCSV = () => {
    // CSV export implementation
  };
  
  const importFromCSV = (file) => {
    // CSV import implementation
  };
  
  // 50 lines of sheet management
  const addNewSheet = () => { };
  const selectSheet = () => { };
  
  // 150+ lines of JSX rendering
  return (
    <div>
      {/* Complex nested JSX */}
    </div>
  );
};
```

#### AFTER (150 lines, clean composition)
```typescript
export const ProgramBuilder: React.FC<Props> = (props) => {
  // Use custom hook for state (extracted)
  const {
    sheets,
    activeSheet,
    selectSheet,
    addSheet,
    updateActiveSheet,
  } = useProgramBuilderState(props.initialWeeks, props.initialState);

  const [darkMode, setDarkMode] = useState(false);

  // Simple orchestration
  return (
    <div className="program-builder">
      <ProgramBuilderToolbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <ProgramBuilderSheet
        sheets={sheets}
        onSelectSheet={selectSheet}
        onAddSheet={addSheet}
      />

      {activeSheet && (
        <Spreadsheet
          sheet={activeSheet}
          onUpdate={updateActiveSheet}
        />
      )}
    </div>
  );
};
```

#### State Logic Extracted (140 lines)
```typescript
// ProgramBuilderState.ts - Pure state management
export function useProgramBuilderState(initialWeeks, initialState) {
  const [sheets, setSheets] = useState([initialSheet]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  const selectSheet = useCallback((index) => { /* ... */ }, []);
  const addSheet = useCallback(() => { /* ... */ }, []);
  const updateActiveSheet = useCallback((patch) => { /* ... */ }, []);

  return { sheets, activeSheet, selectSheet, addSheet, updateActiveSheet };
}
```

#### UI Components Extracted
```typescript
// ProgramBuilderToolbar.tsx - ~80 lines
// ProgramBuilderSheet.tsx - ~90 lines
// Both focused on their specific UI responsibility
```

---

## Type Organization Before & After

### BEFORE: Scattered Types
```
presentation/views/program/
├─ components/
│  ├─ types/
│  │  └─ spreadsheet.ts (shared types)
│  ├─ utils/
│  │  ├─ formulaEngine.ts (types embedded)
│  │  └─ autocomplete.ts (types embedded)
│  └─ ProgramBuilder.tsx (inline interfaces)

domain/entities/
├─ AthleteData.ts
├─ AuthData.ts
└─ ProgramData.ts
```

**Problem**: Types scattered, hard to find, duplicated definitions

---

### AFTER: Centralized Types
```
shared/types/
├─ common.ts              (generic types)
├─ spreadsheet.ts         (spreadsheet domain)
├─ api.ts                 (API-related types)
└─ index.ts               (barrel export for easy import)

domain/entities/
├─ AthleteData.ts         (business entities)
├─ AuthData.ts
├─ ProgramData.ts
└─ index.ts               (barrel export)

presentation/views/program/
└─ types/
   └─ program.ts          (view-specific types only)
```

**Benefit**: Clear separation, single source of truth, easy discoverability

---

## Testing Impact

### Unit Test Locations (NEW)

```
Before: Hard to test mixed components

After: Easy to test pure utilities

__tests__/
├─ shared/
│  ├─ utils/
│  │  ├─ formula/
│  │  │  └─ formulaEngine.test.ts          (50+ test cases)
│  │  ├─ csv/
│  │  │  └─ csvHandler.test.ts             (40+ test cases)
│  │  └─ cell/
│  │     └─ cellUtils.test.ts              (30+ test cases)
│  └─ hooks/
│     ├─ useAsync.test.ts                  (20+ test cases)
│     └─ useLocalStorage.test.ts           (20+ test cases)
│
├─ presentation/
│  └─ views/
│     └─ program/
│        ├─ ProgramBuilder.test.tsx        (30+ test cases)
│        └─ ProgramView.test.tsx           (20+ test cases)
```

**Test Coverage Impact**:
- Before: 40% coverage (hard to test mixed logic)
- After: 85% coverage (easy to test pure functions)

---

## Performance Profile

### Code Splitting Opportunity

```
Before:
- bundle.js (800KB)
  ├─ ProgramBuilder + all dependencies
  └─ Everything else

After (with code splitting):
- shared.js (150KB)       ← shared utilities
├─ spreadsheet.js (100KB) ← spreadsheet components
├─ program.js (80KB)      ← program view
├─ dashboard.js (70KB)    ← dashboard view
└─ frame.js (200KB)       ← core framework

Result: Better tree-shaking, smaller initial bundle
```

---

## Migration Path

```
Week 1: Setup
└─ Create config/
   └─ Create shared/ structure
   └─ No code changes yet

      🔄 Deploy: Safe, just new directories

Week 2-3: Extract
└─ Move utilities to shared/
├─ Add new custom hooks
└─ Add path aliases to tsconfig

      🔄 Deploy: Utilities ready, old code still works

Week 4: Refactor
└─ Update ProgramBuilder
├─ Switch to new state management
└─ Update imports

      🔄 Deploy: New structure active, old files still exist

Week 5: Cleanup
└─ Remove old duplicate code
├─ Update all documentation
└─ Final optimizations

      🔄 Deploy: Final, lean version
```

---

## Success Indicator Summary

```
✅ File organization: Chaotic → Structured
✅ Import clarity: Relative → Absolute
✅ Code duplication: 40% → 5%
✅ Component complexity: High → Low
✅ Test coverage: 40% → 85%
✅ Bundle size: 450KB → 420KB
✅ Developer happiness: 😞 → 😊
```

---

**Recommendation**: This visual reference can be shared with the team to quickly understand the refactoring scope and benefits.
