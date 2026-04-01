/**
 * Spreadsheet Component
 * A fully functional spreadsheet application similar to Google Sheets
 * Features: editable grid, formulas, cell selection, keyboard navigation, toolbar, save/load, CSV import/export
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  Save,
  Upload
} from 'lucide-react';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { SpreadsheetToolbar } from './SpreadsheetToolbar';
import { FormulaBar } from './FormulaBar';
import { CSVImportExport } from './CSVImportExport';
import { useSpreadsheetState } from '../../hooks/useSpreadsheetState';
import { useSpreadsheetActions } from '../../hooks/useSpreadsheetActions';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import type { CellFormat, SpreadsheetData } from './types';
import './Spreadsheet.css';

interface SpreadsheetProps {
  initialData?: SpreadsheetData;
  onDataChange?: (data: SpreadsheetData) => void;
  className?: string;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({
  initialData,
  onDataChange,
  className = ''
}) => {
  const {
    data,
    activeCell,
    selection,
    isEditing,
    undoStack,
    redoStack,
    darkMode,
    dispatch
  } = useSpreadsheetState(initialData);

  const {
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
  } = useSpreadsheetActions({ data, dispatch });

  const gridRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useKeyboardNavigation({
    activeCell,
    onCellSelect: selectCell,
    onRangeSelect: selectRange,
    onStartEdit: startEditing,
    onStopEdit: stopEditing,
    gridRef: gridRef as React.RefObject<HTMLDivElement>
  });

  // Notify parent of data changes
  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

  const handleCellClick = useCallback((cellId: string, event: React.MouseEvent) => {
    if (event.shiftKey && activeCell) {
      selectRange(activeCell, cellId);
    } else {
      selectCell(cellId);
    }
  }, [activeCell, selectCell, selectRange]);

  const handleCellDoubleClick = useCallback((cellId: string) => {
    startEditing(cellId);
  }, [startEditing]);

  const handleCellChange = useCallback((cellId: string, value: string) => {
    updateCell(cellId, { value });
    stopEditing();
  }, [updateCell, stopEditing]);

  const handleFormatChange = useCallback((format: Partial<CellFormat>) => {
    if (selection) {
      selection.forEach(cellId => formatCell(cellId, format));
    } else if (activeCell) {
      formatCell(activeCell, format);
    }
  }, [activeCell, selection, formatCell]);

  const handleSave = useCallback(() => {
    saveToStorage();
  }, [saveToStorage]);

  const handleLoad = useCallback(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleExportCSV = useCallback(() => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportToCSV]);

  const handleImportCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      importFromCSV(csv);
    };
    reader.readAsText(file);
  }, [importFromCSV]);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, [dispatch]);

  return (
    <div className={`spreadsheet-container ${darkMode ? 'dark' : ''} ${className}`}>
      <div className="spreadsheet-header">
        <SpreadsheetToolbar
          onFormat={handleFormatChange}
          onAddRow={addRow}
          onAddColumn={addColumn}
          onDeleteRow={() => deleteRow(0)} // TODO: Get current row
          onDeleteColumn={() => deleteColumn(0)} // TODO: Get current column
          onCopy={copy}
          onPaste={paste}
          onCut={cut}
          onClear={clear}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={undo}
          onRedo={redo}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <div className="spreadsheet-actions">
          <button
            onClick={handleSave}
            className="action-button"
            title="Save to local storage"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={handleLoad}
            className="action-button"
            title="Load from local storage"
          >
            <Upload size={16} />
            Load
          </button>

          <CSVImportExport
            onExport={handleExportCSV}
            onImport={handleImportCSV}
          />
        </div>
      </div>

      <FormulaBar
        value={isEditing && activeCell ? data.cells[activeCell]?.value || '' : ''}
        onChange={(value) => {
          if (activeCell) {
            updateCell(activeCell, { value });
          }
        }}
        onCommit={(value) => {
          if (activeCell) {
            handleCellChange(activeCell, value);
          }
        }}
        activeCell={activeCell}
        isEditing={isEditing}
      />

      <div className="spreadsheet-grid-container" ref={gridRef}>
        <SpreadsheetGrid
          data={data}
          activeCell={activeCell}
          selection={selection}
          isEditing={isEditing}
          onCellClick={handleCellClick}
          onCellDoubleClick={handleCellDoubleClick}
          onCellChange={handleCellChange}
        />
      </div>
    </div>
  );
};
