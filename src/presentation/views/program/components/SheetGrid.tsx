/**
 * SheetGrid Component
 * Main spreadsheet grid with cells, headers, and interactions
 */

import { useRef, useCallback, useMemo, useState } from 'react';
import { SheetCell } from './SheetCell';
import type { CellState, SelectionRange } from '../types/spreadsheet';
import { buildDependencyGraph, getDependencies, getDependents } from '../utils/formulaEngine';

export interface SheetGridColumn {
  key: string;
  label: string;
  width: string;
}

interface SheetGridProps {
  cells: CellState;
  activeCell: string | null;
  selectionRange: SelectionRange | null;
  onCellClick: (key: string) => void;
  onCellDoubleClick: (key: string) => void;
  onValueChange: (key: string, value: string) => void;
  readonlyColumns?: string[];
  columns?: SheetGridColumn[];
  onColumnChange?: (key: string, next: Partial<SheetGridColumn>) => void;
  rowLabels?: Record<string, string>;
  onRowLabelChange?: (key: string, nextLabel: string) => void;
  weekCount?: number;
  dayCount?: number;
  exerciseCount?: number;
}

export const SheetGrid: React.FC<SheetGridProps> = ({
  cells,
  activeCell,
  selectionRange,
  onCellClick,
  onCellDoubleClick,
  onValueChange,
  readonlyColumns = ['load', 'tonnage'],
  columns = [],
  onColumnChange,
  rowLabels = {},
  onRowLabelChange,
  weekCount = 4,
  dayCount = 3,
  exerciseCount = 5,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [editingColumnKey, setEditingColumnKey] = useState<string | null>(null);
  const [columnEditValue, setColumnEditValue] = useState('');
  const [columnWidthValue, setColumnWidthValue] = useState('');
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [rowEditValue, setRowEditValue] = useState('');
  
  const dependencyGraph = buildDependencyGraph(cells);

  const dependencies = useMemo(() => {
    if (!activeCell) return [];
    return getDependencies(activeCell, cells);
  }, [activeCell, cells]);

  const dependents = useMemo(() => {
    if (!activeCell) return [];
    return getDependents(activeCell, dependencyGraph);
  }, [activeCell, dependencyGraph]);
  const displayColumns = useMemo(() => (columns.length > 0 ? columns : []), [columns]);

  const startEditColumn = (col: SheetGridColumn) => {
    if (!onColumnChange) return;
    setEditingColumnKey(col.key);
    setColumnEditValue(col.label);
    setColumnWidthValue(col.width);
  };

  const commitEditColumn = () => {
    if (editingColumnKey && onColumnChange) {
      const next: Partial<SheetGridColumn> = { label: columnEditValue.trim() || ' ' };
      if (columnWidthValue.trim()) {
        next.width = columnWidthValue.trim();
      }
      onColumnChange(editingColumnKey, next);
    }
    setEditingColumnKey(null);
    setColumnEditValue('');
    setColumnWidthValue('');
  };

  const cancelEditColumn = () => {
    setEditingColumnKey(null);
    setColumnEditValue('');
    setColumnWidthValue('');
  };

  const startEditRow = (rowKey: string, currentLabel: string) => {
    if (!onRowLabelChange) return;
    setEditingRowKey(rowKey);
    setRowEditValue(currentLabel);
  };

  const commitEditRow = () => {
    if (editingRowKey && onRowLabelChange) {
      onRowLabelChange(editingRowKey, rowEditValue.trim());
    }
    setEditingRowKey(null);
    setRowEditValue('');
  };

  const cancelEditRow = () => {
    setEditingRowKey(null);
    setRowEditValue('');
  };

  // Generate cell keys for the grid
  const generateGridData = useCallback(() => {
    const data: Array<{
      rowLabel: string;
      rowKey: string;
      cells: Array<{ key: string; field: string }>;
    }> = [];

    for (let w = 1; w <= weekCount; w++) {
      for (let d = 1; d <= dayCount; d++) {
        for (let r = 0; r < exerciseCount; r++) {
          const baseKey = `W${w}_D${d}_R${r}`;
          const rowLabel = rowLabels[baseKey] ?? (r === 0 ? `W${w} D${d}` : '');

          data.push({
            rowLabel,
            rowKey: baseKey,
            cells: displayColumns.map((col) => ({
              key: `${baseKey}_${col.key}`,
              field: col.key,
            })),
          });
        }
      }
    }

    return data;
  }, [weekCount, dayCount, exerciseCount, displayColumns, rowLabels]);

  const gridData = useMemo(() => generateGridData(), [generateGridData]);

  // Check if cell is in selection
  const isCellSelected = useCallback(
    (cellKey: string): boolean => {
      if (!selectionRange) return false;
      // Simple range check - assumes sequential ordering
      return cellKey >= selectionRange.start && cellKey <= selectionRange.end;
    },
    [selectionRange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, cellKey: string) => {
    const cellIndex = gridData.flatMap((r) => r.cells).findIndex((c) => c.key === cellKey);
    if (cellIndex === -1) return;

    let nextKey: string | null = null;

    switch (e.key) {
      case 'ArrowUp':
        {
          const prevCellIndex = cellIndex - displayColumns.length;
          if (prevCellIndex >= 0) {
            nextKey = gridData.flatMap((r) => r.cells)[prevCellIndex]?.key;
          }
          e.preventDefault();
        }
        break;

      case 'ArrowDown':
        {
          const nextCellIndex = cellIndex + displayColumns.length;
          if (nextCellIndex < gridData.flatMap((r) => r.cells).length) {
            nextKey = gridData.flatMap((r) => r.cells)[nextCellIndex]?.key;
          }
          e.preventDefault();
        }
        break;

      case 'ArrowLeft':
        // Move to previous column
        if (cellIndex % displayColumns.length > 0) {
          nextKey = gridData.flatMap((r) => r.cells)[cellIndex - 1]?.key;
        }
        e.preventDefault();
        break;

      case 'ArrowRight':
        // Move to next column
        if (cellIndex % displayColumns.length < displayColumns.length - 1) {
          nextKey = gridData.flatMap((r) => r.cells)[cellIndex + 1]?.key;
        }
        e.preventDefault();
        break;

      default:
        break;
    }

    if (nextKey) {
      onCellClick(nextKey);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto bg-white"
    >
      <table className="border-collapse w-full">
        {/* Header */}
        <thead className="sticky top-0 z-20 bg-white">
          <tr className="border-b-2 border-gray-300">
            <th className="w-12 bg-gray-50 border-r border-gray-200" />
            {displayColumns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-3 py-2 text-left font-mono text-[9px] font-bold tracking-widest uppercase text-gray-700 bg-gray-50 border-r border-gray-200 last:border-0"
              >
                {editingColumnKey === col.key ? (
                  <div className="flex flex-col gap-1">
                    <input
                      value={columnEditValue}
                      onChange={(e) => setColumnEditValue(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-[10px] font-mono px-1 py-0.5 uppercase"
                      autoFocus
                    />
                    <input
                      value={columnWidthValue}
                      onChange={(e) => setColumnWidthValue(e.target.value)}
                      placeholder="e.g. 120px"
                      className="w-full bg-white border border-gray-300 text-[10px] font-mono px-1 py-0.5"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEditColumn();
                        if (e.key === 'Escape') cancelEditColumn();
                      }}
                      onBlur={commitEditColumn}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onDoubleClick={() => startEditColumn(col)}
                    className="w-full text-left"
                    title="Double-click to rename or resize column"
                  >
                    {col.label}
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {gridData.map((row, rowIdx) => (
            <tr
              key={`row-${rowIdx}`}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              {/* Row label */}
              <td className="w-20 px-2 py-2 bg-gray-50 border-r border-gray-200 text-left">
                {editingRowKey === row.rowKey ? (
                  <input
                    value={rowEditValue}
                    onChange={(e) => setRowEditValue(e.target.value)}
                    onBlur={commitEditRow}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEditRow();
                      if (e.key === 'Escape') cancelEditRow();
                    }}
                    className="w-full bg-white border border-gray-300 text-[10px] font-mono px-1 py-0.5"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onDoubleClick={() => startEditRow(row.rowKey, row.rowLabel || row.rowKey)}
                    className="w-full text-left font-mono text-[9px] font-bold text-gray-500"
                    title="Double-click to rename row"
                  >
                    {row.rowLabel}
                  </button>
                )}
              </td>

              {/* Cells */}
              {row.cells.map((cellItem) => {
                const isReadonly = readonlyColumns.includes(cellItem.field);
                const cellData = cells[cellItem.key];
                const isActive = activeCell === cellItem.key;
                const isSelected = isCellSelected(cellItem.key);
                const isDep = dependencies.includes(cellItem.key);
                const isDepList = dependents.includes(cellItem.key);
                const hasError = cellData?.error !== null;
                const isFormula = cellData?.raw.startsWith('=') || false;

                const colDef = displayColumns.find((c) => c.key === cellItem.field);

                return (
                  <SheetCell
                    key={cellItem.key}
                    cellKey={cellItem.key}
                    cellData={cellData}
                    isActive={isActive}
                    isSelected={isSelected}
                    isReadonly={isReadonly}
                    isFormula={isFormula}
                    hasError={hasError}
                    isDependency={isDep && isActive}
                    isDependent={isDepList && isActive}
                    onCellClick={onCellClick}
                    onCellDoubleClick={onCellDoubleClick}
                    onValueChange={onValueChange}
                    onKeyDown={handleKeyDown}
                    width={colDef?.width}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
