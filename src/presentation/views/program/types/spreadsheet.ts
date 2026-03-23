/**
 * Spreadsheet types and interfaces
 */

export interface CellData {
  raw: string; // raw formula or value (e.g., "=SQ_1RM * 0.75" or "85%")
  resolved: string; // computed/resolved value
  error: string | null; // error message if present
}

export interface CellState {
  [key: string]: CellData;
}

export interface VariableState {
  [key: string]: number | string;
}

export interface SelectionRange {
  start: string; // cell key
  end: string; // cell key
}

export interface SheetState {
  cells: CellState;
  variables: VariableState;
  activeCell: string | null;
  editingCell: string | null;
  formulaBar: string;
  selectionRange: SelectionRange | null;
  errors: { [cellKey: string]: string };
  past: CellState[]; // undo stack
  future: CellState[]; // redo stack
}

export interface ParseFormulaResult {
  resolved: string;
  error: string | null;
}

export interface DependencyGraph {
  [cellKey: string]: string[]; // cells that depend on this cell
}

export interface TemplateDefinition {
  name: string;
  generate: (weeks: number, variables: VariableState) => CellState;
}

export interface ExportData {
  cells: CellState;
  variables: VariableState;
  timestamp: string;
  exportType: 'csv' | 'json' | 'formulas';
}
