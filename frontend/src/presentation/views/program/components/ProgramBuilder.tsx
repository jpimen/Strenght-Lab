/**
 * ProgramBuilder Component
 * Main spreadsheet builder with formula engine
 * Integrates all sub-components into a cohesive program building experience
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RotateCcw,
  RotateCw,
  Download,
  Zap,
  AlertCircle,
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
import { templates } from '../utils/templates';
import type { ProgramBuilderSnapshot } from '../utils/programDraftCache';

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

interface ProgramBuilderProps {
  initialWeeks?: number;
  initialState?: ProgramBuilderSnapshot | null;
  onStateChange?: (state: ProgramBuilderSnapshot) => void;
  onSave?: (state: SheetState) => void;
}

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  initialWeeks = 4,
  initialState = null,
  onStateChange,
}) => {
  const defaultColumns: SheetGridColumn[] = [
    { key: 'week_day', label: 'WEEK/DAY', width: '100px' },
    { key: 'exercise', label: 'EXERCISE', width: '180px' },
    { key: 'sets', label: 'SETS', width: '70px' },
    { key: 'reps', label: 'REPS', width: '70px' },
    { key: 'intensity', label: 'INTENSITY (%)', width: '90px' },
    { key: 'rest', label: 'REST (MIN)', width: '90px' },
    { key: 'load', label: 'LOAD (kg)', width: '90px' },
    { key: 'tonnage', label: 'TONNAGE', width: '100px' },
    { key: 'notes', label: 'NOTES', width: '200px' },
  ];

  const defaultVariables: VariableState = {
    SQ_1RM: 315,
    BP_1RM: 225,
    DL_1RM: 405,
    MASS_KG: 105,
    BASE_VOL: 4,
    WEEK: 1,
  };

  // Core sheet state
  const [cells, setCells] = useState<CellState>(() => initialState?.cells ?? buildInitialCells(initialWeeks));
  const [columns, setColumns] = useState<SheetGridColumn[]>(
    () => (initialState?.columns && initialState.columns.length > 0 ? initialState.columns : defaultColumns)
  );
  const [rowLabels, setRowLabels] = useState<Record<string, string>>(() => initialState?.rowLabels ?? {});
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onStateChange) return;
    onStateChange({
      cells,
      columns,
      rowLabels,
      variables,
    });
  }, [cells, columns, rowLabels, variables, onStateChange]);

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
    },
    [cells, variables]
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

  // Handle template application
  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      const template = templates[templateId];
      if (template) {
        const templateCells = template.generate(initialWeeks, variables);
        const newCells = { ...cells, ...templateCells };
        const resolved = resolveAll(newCells, variables);

        setPast((p) => [...p, cells]);
        setFuture([]);
        setCells(resolved);
      }
    },
    [cells, initialWeeks, variables]
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

  // Get error cells
  const errorCells = getErrorCells(cells);

  // Export as CSV
  const handleExportCSV = () => {
    let csv = 'WEEK,DAY,ROW,SETS,REPS,INTENSITY,REST,LOAD,TONNAGE\n';
    Object.entries(cells).forEach(([key]) => {
      if (key.endsWith('_sets')) {
        const baseKey = key.replace('_sets', '');
        const match = baseKey.match(/W(\d+)_D(\d+)_R(\d+)/);
        if (match) {
          const [, week, day, row] = match;
          const sets = cells[`${baseKey}_sets`]?.resolved || '';
          const reps = cells[`${baseKey}_reps`]?.resolved || '';
          const intensity = cells[`${baseKey}_intensity`]?.resolved || '';
          const rest = cells[`${baseKey}_rest`]?.resolved || '';
          const load = cells[`${baseKey}_load`]?.resolved || '';
          csv += `${week},${day},${row},${sets},${reps},${intensity},${rest},${load}\n`;
        }
      }
    });

    // Copy to clipboard
    navigator.clipboard.writeText(csv).then(() => {
      alert('CSV copied to clipboard');
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-white"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          {/* Undo/Redo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={past.length === 0}
              className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-mono text-gray-500">{past.length}</span>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-mono text-gray-500">{future.length}</span>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Template Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVariablesPanel(!showVariablesPanel)}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              title="Toggle Variables Panel"
            >
              [VAR]
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                <Zap className="w-3 h-3" /> TEMPLATE
              </button>
              <div className="absolute hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg z-40 min-w-[150px]">
                {Object.entries(templates).map(([id, template]) => (
                  <button
                    key={id}
                    onClick={() => handleApplyTemplate(id)}
                    className="block w-full text-left px-3 py-2 text-[10px] font-mono hover:bg-orange-50 border-b border-gray-100 last:border-0"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Download className="w-3 h-3" /> EXPORT
            </button>
          </div>
        </div>

        {/* Error Indicator */}
        {errorCells.length > 0 && (
          <button
            onClick={() => setShowErrorPanel(!showErrorPanel)}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-amber-600 hover:bg-amber-50 transition-colors"
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
      <div className="flex flex-1 min-h-0 overflow-hidden">
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
              setColumns((prev) =>
                prev.map((col) => (col.key === key ? { ...col, ...next } : col))
              );
            }}
            rowLabels={rowLabels}
            onRowLabelChange={(key, label) => {
              setRowLabels((prev) => ({ ...prev, [key]: label }));
            }}
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

      {/* Error Panel */}
      {showErrorPanel && errorCells.length > 0 && (
        <div className="bg-amber-50 border-t border-amber-200 p-4 max-h-[150px] overflow-y-auto">
          <h3 className="text-[11px] font-mono font-bold text-amber-900 mb-2">FORMULA ERRORS</h3>
          <div className="space-y-1">
            {errorCells.map(({ key, error }) => (
              <div key={key} className="text-[10px] font-mono text-amber-800">
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
