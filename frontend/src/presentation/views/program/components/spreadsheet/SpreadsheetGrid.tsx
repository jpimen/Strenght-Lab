/**
 * SpreadsheetGrid Component
 * Renders the main grid of cells with headers and selection
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { SpreadsheetCell } from './SpreadsheetCell';
import type { SpreadsheetData, CellPosition } from './types';

interface SpreadsheetGridProps {
  data: SpreadsheetData;
  activeCell?: string;
  selection?: string[];
  onCellClick: (cellId: string, event: React.MouseEvent) => void;
  onCellDoubleClick: (cellId: string) => void;
  onCellChange: (cellId: string, value: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  data,
  activeCell,
  selection = [],
  onCellClick,
  onCellDoubleClick,
  onCellChange
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { cells, columns, rows, columnWidths, rowHeights } = data;

  // Generate column headers (A, B, C, ..., Z, AA, AB, etc.)
  const columnHeaders = useMemo(() => {
    const headers: string[] = [];
    for (let i = 0; i < columns; i++) {
      headers.push(numberToColumnLabel(i));
    }
    return headers;
  }, [columns]);

  // Generate row headers (1, 2, 3, ...)
  const rowHeaders = useMemo(() => {
    const headers: string[] = [];
    for (let i = 1; i <= rows; i++) {
      headers.push(i.toString());
    }
    return headers;
  }, [rows]);

  const getCellId = useCallback((row: number, col: number): string => {
    return `${numberToColumnLabel(col)}${row + 1}`;
  }, []);

  const parseCellId = useCallback((cellId: string): CellPosition => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (!match) return { row: 0, col: 0 };

    const colLabel = match[1];
    const rowNum = parseInt(match[2], 10) - 1;
    const colNum = columnLabelToNumber(colLabel);

    return { row: rowNum, col: colNum };
  }, []);

  const isCellSelected = useCallback((cellId: string): boolean => {
    return selection.includes(cellId) || activeCell === cellId;
  }, [selection, activeCell]);

  const getCellData = useCallback((cellId: string) => {
    return cells[cellId] || { value: '' };
  }, [cells]);

  // Handle mouse selection
  const handleMouseDown = useCallback((cellId: string, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left click

    onCellClick(cellId, event);
  }, [onCellClick]);

  const handleMouseEnter = useCallback((cellId: string, event: React.MouseEvent) => {
    // Handle range selection during drag
    if (event.buttons === 1 && activeCell) {
      const startPos = parseCellId(activeCell);
      const endPos = parseCellId(cellId);

      const newSelection: string[] = [];
      const minRow = Math.min(startPos.row, endPos.row);
      const maxRow = Math.max(startPos.row, endPos.row);
      const minCol = Math.min(startPos.col, endPos.col);
      const maxCol = Math.max(startPos.col, endPos.col);

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          newSelection.push(getCellId(row, col));
        }
      }

      // Update selection through parent component
      onCellClick(cellId, { ...event, shiftKey: true } as React.MouseEvent);
    }
  }, [activeCell, parseCellId, getCellId, onCellClick]);

  return (
    <div className="spreadsheet-grid" ref={gridRef}>
      {/* Corner cell (empty) */}
      <div className="grid-corner"></div>

      {/* Column headers */}
      <div className="grid-column-headers">
        {columnHeaders.map((header, index) => (
          <div
            key={`col-${index}`}
            className="grid-header grid-column-header"
            style={{ width: columnWidths[index] || 100 }}
          >
            {header}
          </div>
        ))}
      </div>

      {/* Row headers and cells */}
      <div className="grid-body">
        {/* Row headers */}
        <div className="grid-row-headers">
          {rowHeaders.map((header, index) => (
            <div
              key={`row-${index}`}
              className="grid-header grid-row-header"
              style={{ height: rowHeights[index] || 24 }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Cells grid */}
        <div className="grid-cells">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid-row">
              {Array.from({ length: columns }, (_, colIndex) => {
                const cellId = getCellId(rowIndex, colIndex);
                const cellData = getCellData(cellId);
                const isSelected = isCellSelected(cellId);
                const isActive = activeCell === cellId;

                return (
                  <SpreadsheetCell
                    key={cellId}
                    id={cellId}
                    data={cellData}
                    isSelected={isSelected}
                    isActive={isActive}
                    width={columnWidths[colIndex] || 100}
                    height={rowHeights[rowIndex] || 24}
                    onClick={(event) => handleMouseDown(cellId, event)}
                    onDoubleClick={() => onCellDoubleClick(cellId)}
                    onMouseEnter={(event) => handleMouseEnter(cellId, event)}
                    onChange={(value) => onCellChange(cellId, value)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions for column labeling
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