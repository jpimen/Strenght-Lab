/**
 * useSpreadsheetActions Hook
 * Provides spreadsheet action functions
 */

import { useCallback, useRef } from 'react';
import type { SpreadsheetData, CellData, CellFormat } from '../components/spreadsheet/types';

interface UseSpreadsheetActionsProps {
  data: SpreadsheetData;
  dispatch: React.Dispatch<any>;
}

export function useSpreadsheetActions({ data, dispatch }: UseSpreadsheetActionsProps) {
  const clipboardRef = useRef<{ cells: Record<string, CellData>; range: string[] } | null>(null);

  const updateCell = useCallback((cellId: string, updates: Partial<CellData>) => {
    dispatch({ type: 'UPDATE_CELL', cellId, data: updates });
  }, [dispatch]);

  const selectCell = useCallback((cellId: string) => {
    dispatch({ type: 'SELECT_CELL', cellId });
  }, [dispatch]);

  const selectRange = useCallback((startCell: string, endCell: string) => {
    const range = getCellRange(startCell, endCell);
    dispatch({ type: 'SELECT_RANGE', cellIds: range });
  }, [dispatch]);

  const startEditing = useCallback((cellId: string) => {
    dispatch({ type: 'START_EDITING', cellId });
  }, [dispatch]);

  const stopEditing = useCallback(() => {
    dispatch({ type: 'STOP_EDITING' });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  const addRow = useCallback(() => {
    dispatch({ type: 'ADD_ROW' });
  }, [dispatch]);

  const addColumn = useCallback(() => {
    dispatch({ type: 'ADD_COLUMN' });
  }, [dispatch]);

  const deleteRow = useCallback((rowIndex: number) => {
    dispatch({ type: 'DELETE_ROW', rowIndex });
  }, [dispatch]);

  const deleteColumn = useCallback((colIndex: number) => {
    dispatch({ type: 'DELETE_COLUMN', colIndex });
  }, [dispatch]);

  const formatCell = useCallback((cellId: string, format: Partial<CellFormat>) => {
    const currentCell = data.cells[cellId] || { value: '' };
    const currentFormat = currentCell.format || {};

    updateCell(cellId, {
      format: { ...currentFormat, ...format }
    });
  }, [data.cells, updateCell]);

  const copy = useCallback(() => {
    // Copy selected cells to clipboard
    const selectedCells: Record<string, CellData> = {};
    const range: string[] = [];

    data.selection?.forEach(cellId => {
      if (data.cells[cellId]) {
        selectedCells[cellId] = { ...data.cells[cellId] };
        range.push(cellId);
      }
    });

    clipboardRef.current = { cells: selectedCells, range };
  }, [data.selection, data.cells]);

  const paste = useCallback(() => {
    if (!clipboardRef.current || !data.activeCell) return;

    const { cells: clipboardCells, range } = clipboardRef.current;
    const targetCell = data.activeCell;

    // Simple paste - just paste to target cell for now
    // In a full implementation, you'd handle range pasting
    const sourceCellId = range[0];
    if (clipboardCells[sourceCellId]) {
      updateCell(targetCell, { ...clipboardCells[sourceCellId] });
    }
  }, [data.activeCell, updateCell]);

  const cut = useCallback(() => {
    copy();
    // Clear selected cells
    data.selection?.forEach(cellId => {
      updateCell(cellId, { value: '' });
    });
  }, [copy, data.selection, updateCell]);

  const clear = useCallback(() => {
    data.selection?.forEach(cellId => {
      updateCell(cellId, { value: '' });
    });
  }, [data.selection, updateCell]);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem('spreadsheet-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save spreadsheet data:', error);
    }
  }, [data]);

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('spreadsheet-data');
      if (saved) {
        const parsedData = JSON.parse(saved);
        dispatch({ type: 'SET_DATA', data: parsedData });
      }
    } catch (error) {
      console.error('Failed to load spreadsheet data:', error);
    }
  }, [dispatch]);

  const exportToCSV = useCallback((): string => {
    const { columns, rows, cells } = data;
    const csvRows: string[] = [];

    // Add header row
    const headers: string[] = [];
    for (let col = 0; col < columns; col++) {
      headers.push(numberToColumnLabel(col));
    }
    csvRows.push(headers.join(','));

    // Add data rows
    for (let row = 0; row < rows; row++) {
      const rowData: string[] = [];
      for (let col = 0; col < columns; col++) {
        const cellId = `${numberToColumnLabel(col)}${row + 1}`;
        const cell = cells[cellId];
        const value = cell?.computed || cell?.value || '';
        // Escape commas and quotes
        const escaped = value.replace(/"/g, '""');
        rowData.push(value.includes(',') || value.includes('"') || value.includes('\n')
          ? `"${escaped}"`
          : escaped);
      }
      csvRows.push(rowData.join(','));
    }

    return csvRows.join('\n');
  }, [data]);

  const importFromCSV = useCallback((csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    const newCells: Record<string, CellData> = {};
    let maxCol = 0;
    let maxRow = 0;

    lines.forEach((line, rowIndex) => {
      const columns = parseCSVLine(line);
      maxRow = Math.max(maxRow, rowIndex);

      columns.forEach((value, colIndex) => {
        if (value.trim()) {
          const cellId = `${numberToColumnLabel(colIndex)}${rowIndex + 1}`;
          newCells[cellId] = { value: value.trim() };
          maxCol = Math.max(maxCol, colIndex);
        }
      });
    });

    const newData: SpreadsheetData = {
      cells: newCells,
      columns: Math.max(maxCol + 1, 26),
      rows: Math.max(maxRow + 1, 100),
      columnWidths: {},
      rowHeights: {},
      undoStack: [],
      redoStack: []
    };

    dispatch({ type: 'SET_DATA', data: newData });
  }, [dispatch]);

  return {
    updateCell,
    selectCell,
    selectRange,
    startEditing,
    stopEditing,
    undo,
    redo,
    copy,
    paste,
    cut,
    clear,
    formatCell,
    addRow,
    addColumn,
    deleteRow,
    deleteColumn,
    saveToStorage,
    loadFromStorage,
    exportToCSV,
    importFromCSV
  };
}

// Helper functions
function getCellRange(startCell: string, endCell: string): string[] {
  const start = parseCellId(startCell);
  const end = parseCellId(endCell);

  const cells: string[] = [];
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      cells.push(`${numberToColumnLabel(col)}${row + 1}`);
    }
  }

  return cells;
}

function parseCellId(cellId: string): { row: number; col: number } {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: 0, col: 0 };

  const colLabel = match[1];
  const rowNum = parseInt(match[2], 10) - 1;
  const colNum = columnLabelToNumber(colLabel);

  return { row: rowNum, col: colNum };
}

function numberToColumnLabel(num: number): string {
  let label = '';
  let n = num;

  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }

  return label;
}

function columnLabelToNumber(label: string): number {
  let result = 0;
  for (let i = 0; i < label.length; i++) {
    result = result * 26 + (label.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}