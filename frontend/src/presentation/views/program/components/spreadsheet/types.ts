/**
 * Spreadsheet Types
 * Type definitions for the spreadsheet application
 */

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface CellData {
  value: string;
  formula?: string;
  computed?: string;
  format?: CellFormat;
  error?: string;
}

export interface SpreadsheetData {
  cells: Record<string, CellData>;
  columns: number;
  rows: number;
  columnWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  activeCell?: string;
  selection?: string[];
  undoStack: SpreadsheetData[];
  redoStack: SpreadsheetData[];
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}

export interface FormulaResult {
  value: string;
  error?: string;
}

export interface ToolbarFormat {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
}

export interface CSVData {
  headers: string[];
  rows: string[][];
}