/**
 * ProgramBuilder Component
 * Main spreadsheet builder with formula engine
 * Integrates all sub-components into a cohesive program building experience
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RotateCcw,
  RotateCw,
  AlertCircle,
  Save,
  Upload,
  Download,
  Moon,
  Sun
} from 'lucide-react';
import { FormulaBar } from './FormulaBar';
import { VariablesPanel } from './VariablesPanel';
import { SheetGrid } from './SheetGrid';
import type { SheetGridColumn } from './SheetGrid';
import { ColumnSummaryBar } from './ColumnSummaryBar';
import { AutocompleteDropdown } from './AutocompleteDropdown';
import { ContextMenu } from './ContextMenu';
import type {
  CellState,
  VariableState,
  SelectionRange,
  SheetState,
} from '../types/spreadsheet';
import {
  parseFormula,
  resolveAll,
  getErrorCells,
} from '../utils/formulaEngine';
import { getAutocompleteSuggestions } from '../utils/autocomplete';
import type { AutocompleteOption } from '../utils/autocomplete';
import type { ProgramBuilderSnapshot, ProgramSheet } from '../utils/programDraftCache';

const buildInitialCells = (weeks: number): CellState => {
  const newCells: CellState = {};
  for (let w = 1; w <= weeks; w++) {
    for (let d = 1; d <= 3; d++) {
      for (let r = 0; r < 5; r++) {
        const baseKey = `W${w}_D${d}_R${r}`;
        newCells[`${baseKey}_sets`] = { raw: '', resolved: '', error: null };
        newCells[`${baseKey}_reps`] = { raw: '', resolved: '', error: null };
        newCells[`${baseKey}_intensity`] = { raw: '', resolved: '', error: null };
        newCells[`${baseKey}_rest`] = { raw: '', resolved: '', error: null };
        newCells[`${baseKey}_load`] = { raw: '', resolved: '', error: null };
      }
    }
  }
  return newCells;
};

function getDefaultColumns(): SheetGridColumn[] {
  return [
    { key: 'week_day', label: 'WEEK/DAY', width: '100px' },
    { key: 'exercise', label: 'EXERCISE', width: '180px' },
    { key: 'sets', label: 'SETS', width: '70px' },
    { key: 'reps', label: 'REPS', width: '70px' },
    { key: 'intensity', label: 'INTENSITY (%)', width: '90px' },
    { key: 'rest', label: 'REST (MIN)', width: '90px' },
    { key: 'load', label: 'LOAD (kg)', width: '90px' },
    { key: 'notes', label: 'NOTES', width: '200px' },
  ];
}

interface ProgramBuilderProps {
  initialWeeks?: number;
  initialState?: ProgramBuilderSnapshot | null;
  startEmpty?: boolean;
  onStateChange?: (state: ProgramBuilderSnapshot) => void;
  onSave?: (state: SheetState) => void;
}

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  initialWeeks = 4,
  initialState = null,
  startEmpty = false,
  onStateChange,
}) => {
  const defaultColumns = getDefaultColumns();

  const defaultVariables: VariableState = startEmpty
    ? {}
    : {
        SQ_1RM: 315,
        BP_1RM: 225,
        DL_1RM: 405,
        MASS_KG: 105,
        BASE_VOL: 4,
        WEEK: 1,
      };

  const initialSheet: ProgramSheet = {
    id: 'sheet-1',
    name: 'Sheet 1',
    cells: initialState?.cells ?? buildInitialCells(initialWeeks),
    columns: initialState?.columns && initialState.columns.length > 0 ? initialState.columns : defaultColumns,
    rowLabels: initialState?.rowLabels ?? {},
  };

  // Initialize sheets from saved state or create default single sheet
  const initialSheets = initialState?.sheets && initialState.sheets.length > 0 
    ? initialState.sheets 
    : [initialSheet];
  
  const initialActiveSheetIndex = initialState?.activeSheetIndex ?? 0;
  const activeSheet = initialSheets[initialActiveSheetIndex] ?? initialSheets[0];

  const [sheets, setSheets] = useState<ProgramSheet[]>(initialSheets);
  const [activeSheetIndex, setActiveSheetIndex] = useState(initialActiveSheetIndex);

  // Core display state (current active sheet)
  const [cells, setCells] = useState<CellState>(activeSheet?.cells ?? initialSheet.cells);
  const [columns, setColumns] = useState<SheetGridColumn[]>(activeSheet?.columns ?? initialSheet.columns);
  const [rowLabels, setRowLabels] = useState<Record<string, string>>(activeSheet?.rowLabels ?? initialSheet.rowLabels);
  const [variables, setVariables] = useState<VariableState>(() => initialState?.variables ?? defaultVariables);

  // UI state
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [, setEditingCell] = useState<string | null>(null);
  const [formulaBar, setFormulaBar] = useState('');
  const [selectionRange] = useState<SelectionRange | null>(null);

  // Undo/redo state
  const [past, setPast] = useState<CellState[]>([]);
  const [future, setFuture] = useState<CellState[]>([]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Autocomplete state
  const [autocompleteOptions, setAutocompleteOptions] = useState<AutocompleteOption[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePos] = useState({ x: 0, y: 0 });

  // UI panels
  const [showVariablesPanel, setShowVariablesPanel] = useState(true);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (darkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [darkMode]);

  const containerRef = useRef<HTMLDivElement>(null);

  const updateActiveSheet = useCallback(
    (patch: Partial<ProgramSheet>) => {
      setSheets((prev) =>
        prev.map((sheet, index) =>
          index === activeSheetIndex
            ? {
                ...sheet,
                ...patch,
              }
            : sheet
        )
      );
    },
    [activeSheetIndex]
  );

  const selectSheet = (index: number) => {
    const sheet = sheets[index];
    if (!sheet) return;
    setActiveSheetIndex(index);
    setCells(sheet.cells);
    setColumns(sheet.columns);
    setRowLabels(sheet.rowLabels);
    setActiveCell(null);
    setFormulaBar('');
  };

  const addNewSheet = () => {
    const newSheetIndex = sheets.length;
    const newSheet: ProgramSheet = {
      id: `sheet-${Date.now()}`,
      name: `Sheet ${newSheetIndex + 1}`,
      cells: buildInitialCells(initialWeeks),
      columns: getDefaultColumns(),
      rowLabels: {},
    };
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetIndex(newSheetIndex);
    setCells(newSheet.cells);
    setColumns(newSheet.columns);
    setRowLabels(newSheet.rowLabels);
    setActiveCell(null);
    setFormulaBar('');
  };

  useEffect(() => {
    if (!onStateChange) return;
    const activeSheet = sheets[activeSheetIndex] ?? initialSheet;

    onStateChange({
      cells: activeSheet.cells,
      columns: activeSheet.columns,
      rowLabels: activeSheet.rowLabels,
      variables,
      sheets,
      activeSheetIndex,
    });
  }, [sheets, activeSheetIndex, variables, onStateChange, initialSheet]);

  // Sync grid selection with formula bar
  const handleSelectCell = useCallback(
    (key: string) => {
      setActiveCell(key);
      if (cells[key]) {
        setFormulaBar(cells[key].raw);
        setEditingCell(key);
      }
    },
    [cells]
  );

  // Handle cell value changes
  const handleValueChange = useCallback(
    (key: string, value: string) => {
      const newCells = { ...cells };

      // Parse and resolve the new value
      const result = parseFormula(value, newCells, variables);
      newCells[key] = {
        raw: value,
        resolved: result.resolved,
        error: result.error,
      };

      // Resolve all dependent cells
      const resolved = resolveAll(newCells, variables);

      // Add to undo stack
      setPast((p) => [...p, cells]);
      setFuture([]);

      setCells(resolved);
      updateActiveSheet({ cells: resolved });
    },
    [cells, variables, updateActiveSheet]
  );

  // Handle formula bar commit
  const handleFormulaCommit = useCallback(
    (value: string) => {
      if (activeCell) {
        handleValueChange(activeCell, value);
        setEditingCell(null);
        setFormulaBar('');
        setShowAutocomplete(false);
      }
    },
    [activeCell, handleValueChange]
  );

  // Handle formula bar change (for autocomplete)
  const handleFormulaChange = useCallback((value: string) => {
    setFormulaBar(value);

    // Show autocomplete if formula starts with =
    if (value.startsWith('=')) {
      const suggestions = getAutocompleteSuggestions(value, variables);
      setAutocompleteOptions(suggestions);
      setShowAutocomplete(suggestions.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  }, [variables]);

  // Handle autocomplete selection
  const handleAutocompleteSelect = (option: AutocompleteOption) => {
    let newFormula = '';

    if (formulaBar.includes('(')) {
      // Already typing a function, just add the value
      newFormula = formulaBar + option.value;
    } else if (option.type === 'function') {
      newFormula = '=' + option.value;
    } else {
      newFormula = '=' + option.value;
    }

    setFormulaBar(newFormula);
    setShowAutocomplete(false);
  };

  // Handle variable changes
  const handleVariableChange = useCallback(
    (name: string, value: string | number) => {
      const newVariables = { ...variables, [name]: value };
      setVariables(newVariables);

      // Re-resolve all cells with new variables
      const resolved = resolveAll(cells, newVariables);
      setCells(resolved);
    },
    [cells, variables]
  );

  // Undo
  const handleUndo = () => {
    if (past.length > 0) {
      const newPast = past.slice(0, -1);
      const prev = past[past.length - 1];
      setFuture((f) => [cells, ...f]);
      setPast(newPast);
      setCells(prev);
    }
  };

  // Redo
  const handleRedo = () => {
    if (future.length > 0) {
      const next = future[0];
      setPast((p) => [...p, cells]);
      setFuture((f) => f.slice(1));
      setCells(next);
    }
  };

  const STORAGE_KEY = 'program_builder_sheet_v1';

  const saveToLocal = () => {
    const payload = {
      sheets,
      activeSheetIndex,
      variables,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setShowErrorPanel(false);
  };

  const loadFromLocal = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const loadedSheets: ProgramSheet[] = parsed.sheets ?? [initialSheet];
      const loadedIndex = Math.min(parsed.activeSheetIndex ?? 0, loadedSheets.length - 1);

      setSheets(loadedSheets);
      setActiveSheetIndex(loadedIndex);
      const active = loadedSheets[loadedIndex];
      setCells(active.cells);
      setColumns(active.columns);
      setRowLabels(active.rowLabels);
      setVariables(parsed.variables ?? defaultVariables);
    } catch (error) {
      console.error('Error loading program builder data', error);
    }
  };

  const exportToCSV = () => {
    const rows: string[] = [];
    const header = columns.map((col) => col.label).join(',');
    rows.push(header);

    const maxRows = Math.max(100, initialWeeks * 3 * 5);
    for (let r = 0; r < maxRows; r++) {
      const rowCells = columns.map((col) => {
        const cellKey = `${r}_${col.key}`;
        const cell = cells[cellKey];
        const value = cell?.resolved || cell?.raw || '';
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      rows.push(rowCells.join(','));
    }

    const csvData = rows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'program-builder.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
      if (!lines.length) return;

      const newCells: CellState = {};

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        values.forEach((value, colIndex) => {
          const key = `${i - 1}_${columns[colIndex]?.key ?? `col${colIndex}`}`;
          newCells[key] = { raw: value, resolved: value, error: null };
        });
      }

      setCells(newCells);
    };

    reader.readAsText(file);
  };

  // Get error cells
  const errorCells = getErrorCells(cells);


  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full w-full ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 animate-slideDown">
        <div className="flex items-center gap-4">
          {/* Undo/Redo */}
          <div className="flex items-center gap-2 animate-slideRight delay-100">
            <button
              onClick={handleUndo}
              disabled={past.length === 0}
              className="p-2 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-mono text-gray-500">{past.length}</span>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-2 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-mono text-gray-500">{future.length}</span>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Template Options */}
          <div className="flex items-center gap-2 animate-slideRight delay-150">
            <button
              onClick={saveToLocal}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300"
              title="Save to local storage"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={loadFromLocal}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300"
              title="Load from local storage"
            >
              <Upload className="w-4 h-4" />
              Load
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

            <label className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-gray-700 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300">
              Import
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importFromCSV(file);
                }}
              />
            </label>

            <button
              onClick={() => setDarkMode((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowVariablesPanel(!showVariablesPanel)}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300"
              title="Toggle Variables Panel"
            >
              [VAR]
            </button>
          </div>
        </div>

        {/* Error Indicator */}
        {errorCells.length > 0 && (
          <button
            onClick={() => setShowErrorPanel(!showErrorPanel)}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-amber-600 hover:bg-amber-50 hover:shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 animate-shake"
          >
            <AlertCircle className="w-4 h-4" /> {errorCells.length} ERRORS
          </button>
        )}
      </div>

      {/* Formula Bar */}
      <FormulaBar
        activeCell={activeCell}
        formulaBar={formulaBar}
        variables={variables}
        onFormulaChange={handleFormulaChange}
        onFormulaCommit={handleFormulaCommit}
        showVariablesDropdown
      />

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden animate-fadeIn delay-200">
        {/* Variables Panel */}
        {showVariablesPanel && (
          <VariablesPanel
            variables={variables}
            onVariableChange={handleVariableChange}
            isOpen={showVariablesPanel}
            onToggle={() => setShowVariablesPanel(!showVariablesPanel)}
          />
        )}

        {/* Grid + Sidebar */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sheet Grid */}
          <SheetGrid
            cells={cells}
            activeCell={activeCell}
            selectionRange={selectionRange}
            onCellClick={handleSelectCell}
            onCellDoubleClick={handleSelectCell}
            onValueChange={handleValueChange}
            columns={columns}
            onColumnChange={(key, next) => {
              const nextColumns = columns.map((col) => (col.key === key ? { ...col, ...next } : col));
              setColumns(nextColumns);
              updateActiveSheet({ columns: nextColumns });
            }}
            rowLabels={rowLabels}
            onRowLabelChange={(key, label) => {
              const nextRowLabels = { ...rowLabels, [key]: label };
              setRowLabels(nextRowLabels);
              updateActiveSheet({ rowLabels: nextRowLabels });
            }}
            showDefaultRowLabels
            weekCount={initialWeeks}
            dayCount={3}
            exerciseCount={5}
          />

          {/* Column Summary Bar */}
          <ColumnSummaryBar
            cells={cells}
            selectionRange={selectionRange}
            activeCell={activeCell}
          />
        </div>
      </div>

      {/* Bottom sheet tab + new-sheet button */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-300 bg-white flex-wrap animate-slideUp delay-300">
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.id}
            onClick={() => selectSheet(idx)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition-all duration-200 ${idx === activeSheetIndex ? 'bg-slate-300 text-slate-900 border-slate-400 hover:shadow-md' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:shadow-sm hover:scale-105'} active:scale-95`}
            title={`Switch to ${sheet.name}`}
          >
            {sheet.name}
          </button>
        ))}

        <button
          onClick={addNewSheet}
          className="px-4 py-2 rounded text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
          title="Add new sheet"
        >
          + New Sheet
        </button>
      </div>

      {/* Error Panel */}
      {showErrorPanel && errorCells.length > 0 && (
        <div className="bg-amber-50 border-t border-amber-200 p-4 max-h-[150px] overflow-y-auto animate-slideUp delay-400">
          <h3 className="text-[11px] font-mono font-bold text-amber-900 mb-2">FORMULA ERRORS</h3>
          <div className="space-y-1">
            {errorCells.map(({ key, error }, idx) => (
              <div key={key} style={{ animationDelay: `${idx * 30}ms` }} className="text-[10px] font-mono text-amber-800 animate-fadeIn delay-500">
                <span className="text-amber-600 font-bold">{key}</span>: {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      <AutocompleteDropdown
        key={autocompleteOptions.map((opt) => opt.value).join('|')}
        options={autocompleteOptions}
        visible={showAutocomplete}
        onSelect={handleAutocompleteSelect}
        x={autocompletePos.x}
        y={autocompletePos.y}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={[
            {
              label: 'Copy Cell',
              onClick: () => {
                if (activeCell && cells[activeCell]) {
                  navigator.clipboard.writeText(cells[activeCell].resolved);
                }
              },
            },
            {
              label: 'Clear Contents',
              onClick: () => {
                if (activeCell) {
                  handleValueChange(activeCell, '');
                }
              },
              divider: true,
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
