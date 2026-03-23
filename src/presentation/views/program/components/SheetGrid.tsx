/**
 * SheetGrid Component
 * Main spreadsheet grid with cells, headers, and interactions
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SheetCell } from './SheetCell';
import type { CellState, SelectionRange } from '../types/spreadsheet';
import { buildDependencyGraph, getDependencies, getDependents } from '../utils/formulaEngine';

interface SheetGridColumn {
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
  rowLabels?: Record<string, string>;
  onRowLabelChange?: (key: string, value: string) => void;
  columnLabels?: Record<string, string>;
  onColumnLabelChange?: (key: string, value: string) => void;
  readonlyColumns?: string[];
  columns?: SheetGridColumn[];
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
  rowLabels,
  onRowLabelChange,
  columnLabels,
  onColumnLabelChange,
  readonlyColumns = ['load', 'tonnage'],
  columns = [],
  weekCount = 4,
  dayCount = 3,
  exerciseCount = 5,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const dependencyGraph = buildDependencyGraph(cells);

  const dependencies = useMemo(() => {
    if (!activeCell) return [];
    return getDependencies(activeCell, cells);
  }, [activeCell, cells]);

  const dependents = useMemo(() => {
    if (!activeCell) return [];
    return getDependents(activeCell, dependencyGraph);
  }, [activeCell, dependencyGraph]);
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

  const displayColumns = columns.length > 0 ? columns : defaultColumns;

  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  
  const [resizingCol, setResizingCol] = useState<{ key: string; startX: number; startWidth: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<{ index: number; startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        setColWidths(prev => ({ ...prev, [resizingCol.key]: Math.max(50, resizingCol.startWidth + (e.clientX - resizingCol.startX)) }));
      } else if (resizingRow) {
        setRowHeights(prev => ({ ...prev, [resizingRow.index]: Math.max(24, resizingRow.startHeight + (e.clientY - resizingRow.startY)) }));
      }
    };
    const handleMouseUp = () => {
      setResizingCol(null);
      setResizingRow(null);
    };

    if (resizingCol || resizingRow) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizingRow]);

  const getColWidth = (col: SheetGridColumn) => {
    return colWidths[col.key] || parseInt(col.width, 10) || 100;
  };

  // Generate cell keys for the grid
  const generateGridData = useCallback(() => {
    const data: Array<{
      isFirstInDay: boolean;
      dayKey: string;
      defaultLabel: string;
      cells: Array<{ key: string; field: string }>;
    }> = [];

    for (let w = 1; w <= weekCount; w++) {
      for (let d = 1; d <= dayCount; d++) {
        for (let r = 0; r < exerciseCount; r++) {
          const baseKey = `W${w}_D${d}_R${r}`;
          const dayKey = `W${w}_D${d}`;
          const defaultLabel = `W${w} D${d}`;

          data.push({
            isFirstInDay: r === 0,
            dayKey,
            defaultLabel,
            cells: displayColumns.map((col) => ({
              key: `${baseKey}_${col.key}`,
              field: col.key,
            })),
          });
        }
      }
    }

    return data;
  }, [weekCount, dayCount, exerciseCount, displayColumns]);

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
      case 'ArrowUp': {
        const prevCellIndex = cellIndex - displayColumns.length;
        if (prevCellIndex >= 0) {
          nextKey = gridData.flatMap((r) => r.cells)[prevCellIndex]?.key;
        }
        e.preventDefault();
        break;
      }

      case 'ArrowDown': {
        const nextCellIndex = cellIndex + displayColumns.length;
        if (nextCellIndex < gridData.flatMap((r) => r.cells).length) {
          nextKey = gridData.flatMap((r) => r.cells)[nextCellIndex]?.key;
        }
        e.preventDefault();
        break;
      }

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
                style={{ width: `${getColWidth(col)}px`, minWidth: `${getColWidth(col)}px` }}
                className="relative px-3 py-2 text-left font-mono text-[9px] font-bold tracking-widest uppercase text-gray-700 bg-gray-50 border-r border-gray-200 last:border-0"
              >
                <input
                  type="text"
                  value={columnLabels?.[col.key] ?? col.label}
                  onChange={(e) => onColumnLabelChange?.(col.key, e.target.value)}
                  className="bg-transparent border-none outline-none w-full uppercase placeholder:text-gray-400 focus:ring-1 focus:ring-iron-900 focus:bg-white px-1 -mx-1"
                  placeholder={col.label}
                />
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setResizingCol({ key: col.key, startX: e.clientX, startWidth: getColWidth(col) });
                  }}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-orange-500 z-10"
                />
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {gridData.map((row, rowIdx) => (
            <tr
              key={`row-${rowIdx}`}
              style={{ height: rowHeights[rowIdx] ? `${rowHeights[rowIdx]}px` : undefined }}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              {/* Row label */}
              <td className="relative w-12 px-2 py-2 bg-gray-50 border-r border-gray-200 text-center">
                {row.isFirstInDay && (
                  <input
                    type="text"
                    value={rowLabels?.[row.dayKey] ?? row.defaultLabel}
                    onChange={(e) => onRowLabelChange?.(row.dayKey, e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-mono text-[9px] font-bold text-gray-500 text-center focus:ring-1 focus:ring-iron-900 focus:bg-white px-1 -mx-1"
                    placeholder={row.defaultLabel}
                  />
                )}
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const currentHeight = rowHeights[rowIdx] || e.currentTarget.parentElement?.offsetHeight || 36;
                    setResizingRow({ index: rowIdx, startY: e.clientY, startHeight: currentHeight });
                  }}
                  className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-orange-500 z-10"
                />
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
                    width={colDef ? `${getColWidth(colDef)}px` : undefined}
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
