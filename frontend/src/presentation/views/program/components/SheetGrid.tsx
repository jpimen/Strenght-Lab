/**
 * SheetGrid Component
 * Main spreadsheet grid with cells, headers, and interactions
 */

import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
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
  showDefaultRowLabels?: boolean;
  weekCount?: number;
  dayCount?: number;
  exerciseCount?: number;
  zoomLevel?: number;
}

export const SheetGrid: React.FC<SheetGridProps> = ({
  cells,
  activeCell,
  selectionRange,
  onCellClick,
  onCellDoubleClick,
  onValueChange,
  readonlyColumns = [],
  columns = [],
  onColumnChange,
  rowLabels = {},
  onRowLabelChange,
  showDefaultRowLabels = true,
  weekCount = 4,
  dayCount = 3,
  exerciseCount = 5,
  zoomLevel = 100,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [editingColumnKey, setEditingColumnKey] = useState<string | null>(null);
  const [columnEditValue, setColumnEditValue] = useState('');
  const [columnWidthValue, setColumnWidthValue] = useState('');
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [rowEditValue, setRowEditValue] = useState('');
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  const [dragEndCell, setDragEndCell] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, string>>({});
  const [rowHeights, setRowHeights] = useState<Record<string, string>>({});
  const [resizingColumn, setResizingColumn] = useState<null | { key: string; startX: number; startWidth: number }>(null);
  const [resizingRow, setResizingRow] = useState<null | { rowKey: string; startY: number; startHeight: number }>(null);
  
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
  const zoomScale = zoomLevel / 100;
  const textScale = zoomScale * 1.1;
  const rowLabelWidth = Math.max(60, Math.round(80 * zoomScale));
  const cellMinHeight = Math.max(28, Math.round(40 * zoomScale));
  const headerFontSize = Math.max(9, Math.round(9 * textScale));
  const rowLabelFontSize = Math.max(9, Math.round(9 * textScale));

  const scaleSize = useCallback((value: string | undefined, fallback: number) => {
    if (!value) return `${Math.round(fallback * zoomScale)}px`;
    const numeric = Number.parseFloat(value);
    if (!Number.isFinite(numeric)) return value;
    return `${Math.round(numeric * zoomScale)}px`;
  }, [zoomScale]);

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
          const rowLabel = rowLabels[baseKey] ?? (showDefaultRowLabels && r === 0 ? `W${w} D${d}` : '');

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
  }, [weekCount, dayCount, exerciseCount, displayColumns, rowLabels, showDefaultRowLabels]);

  const gridData = useMemo(() => generateGridData(), [generateGridData]);

  // Get flat list of all cell keys in order
  const allCellKeys = useMemo(() => {
    return gridData.flatMap((row) => row.cells.map((cell) => cell.key));
  }, [gridData]);

  // Calculate the range between two cells
  const getCellRange = useCallback(
    (start: string, end: string) => {
      const startIdx = allCellKeys.indexOf(start);
      const endIdx = allCellKeys.indexOf(end);
      if (startIdx === -1 || endIdx === -1) return [];

      const [minIdx, maxIdx] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
      return allCellKeys.slice(minIdx, maxIdx + 1);
    },
    [allCellKeys]
  );

  // Check if cell is in selection (either drag selection or formula bar selection)
  const isCellSelected = useCallback(
    (cellKey: string): boolean => {
      // Check drag selection
      if (dragStartCell && dragEndCell) {
        const selectedCells = getCellRange(dragStartCell, dragEndCell);
        return selectedCells.includes(cellKey);
      }
      if (dragStartCell && !dragEndCell) {
        return dragStartCell === cellKey;
      }
      // Check formula bar selection
      if (selectionRange) {
        return cellKey >= selectionRange.start && cellKey <= selectionRange.end;
      }
      return false;
    },
    [selectionRange, dragStartCell, dragEndCell, getCellRange]
  );

  // Handle cell mouse down - start drag selection
  const handleCellMouseDown = useCallback(
    (cellKey: string, e: React.MouseEvent) => {
      if (e.button !== 0 || resizingColumn || resizingRow) return; // Only left mouse button and no resize in progress
      setIsDragging(true);
      setDragStartCell(cellKey);
      setDragEndCell(cellKey);
      onCellClick(cellKey);
    },
    [onCellClick, resizingColumn, resizingRow]
  );

  const handleColResizeMouseDown = useCallback(
    (colKey: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const widthValue = columnWidths[colKey] || displayColumns.find((col) => col.key === colKey)?.width || '90px';
      const initialWidth = Number(widthValue.replace('px', '')) || 90;
      setIsDragging(false);
      setResizingColumn({ key: colKey, startX: e.clientX, startWidth: initialWidth });
    },
    [columnWidths, displayColumns]
  );

  const handleRowResizeMouseDown = useCallback(
    (rowKey: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(false);
      const currentHeight = Number((rowHeights[rowKey] || '40px').replace('px', '')) || 40;
      setResizingRow({ rowKey, startY: e.clientY, startHeight: currentHeight });
    },
    [rowHeights]
  );

  // Handle cell mouse enter - update drag selection
  const handleCellMouseEnter = useCallback(
    (cellKey: string) => {
      if (isDragging && dragStartCell) {
        setDragEndCell(cellKey);
      }
    },
    [isDragging, dragStartCell]
  );

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (resizingColumn) {
        const deltaX = event.clientX - resizingColumn.startX;
        const nextWidth = Math.max(40, resizingColumn.startWidth + deltaX);
        setColumnWidths((prev) => ({ ...prev, [resizingColumn.key]: `${nextWidth}px` }));
      }

      if (resizingRow) {
        const deltaY = event.clientY - resizingRow.startY;
        const nextHeight = Math.max(24, resizingRow.startHeight + deltaY);
        setRowHeights((prev) => ({ ...prev, [resizingRow.rowKey]: `${nextHeight}px` }));
      }
    },
    [resizingColumn, resizingRow]
  );

  // Handle mouse up - end drag selection or resize
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizingColumn(null);
    setResizingRow(null);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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
            <th
              className="bg-gray-50 border-r border-gray-200"
              style={{ width: `${rowLabelWidth}px` }}
            />
            {displayColumns.map((col) => (
              <th
                key={col.key}
                style={{ width: scaleSize(columnWidths[col.key] || col.width, 90), position: 'relative' }}
                className="px-3 py-2 text-left font-mono font-bold tracking-widest uppercase text-gray-700 bg-gray-50 border-r border-gray-200 last:border-0"
              >
              <div style={{ fontSize: `${headerFontSize}px` }}>
              <div
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                onMouseDown={(e) => handleColResizeMouseDown(col.key, e)}
              />
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
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {gridData.map((row, rowIdx) => (
            <tr
              key={`row-${rowIdx}`}
              className="border-b border-gray-100 hover:bg-gray-50/50 hover:shadow-sm transition-all duration-200"
              style={{ minHeight: scaleSize(rowHeights[row.rowKey] || '40px', 40) }}
            >
              {/* Row label */}
              <td
                className="px-2 py-2 bg-gray-50 border-r border-gray-200 text-left relative hover:bg-gray-100 transition-colors duration-200"
                style={{ height: scaleSize(rowHeights[row.rowKey] || '40px', 40), width: `${rowLabelWidth}px` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize"
                  onMouseDown={(e) => handleRowResizeMouseDown(row.rowKey, e)}
                  title="Drag to resize row height"
                />
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
                    className="w-full text-left font-mono font-bold text-gray-500"
                    style={{ fontSize: `${rowLabelFontSize}px`, minHeight: `${cellMinHeight}px` }}
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
                    onMouseDown={handleCellMouseDown}
                    onMouseEnter={handleCellMouseEnter}
                    width={scaleSize(columnWidths[cellItem.field] || colDef?.width, 90)}
                    zoomLevel={zoomLevel}
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
