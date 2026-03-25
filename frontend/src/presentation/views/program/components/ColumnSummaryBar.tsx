/**
 * ColumnSummaryBar Component
 * Shows live aggregates for selected cells or column
 */

import React, { useMemo } from 'react';
import type { CellState, SelectionRange } from '../types/spreadsheet';

interface ColumnSummaryBarProps {
  cells: CellState;
  selectionRange: SelectionRange | null;
  activeCell: string | null;
}

interface SummaryStats {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export const ColumnSummaryBar: React.FC<ColumnSummaryBarProps> = ({
  cells,
  selectionRange,
  activeCell,
}) => {
  const summary = useMemo<SummaryStats | null>(() => {
    let selectedCells: string[] = [];

    if (selectionRange) {
      // Get cells in range
      const allCells = Object.keys(cells);
      selectedCells = allCells.filter(
        (key) => key >= selectionRange.start && key <= selectionRange.end
      );
    } else if (activeCell) {
      selectedCells = [activeCell];
    }

    if (selectedCells.length === 0) {
      return null;
    }

    const values: number[] = [];
    selectedCells.forEach((key) => {
      const cell = cells[key];
      if (cell) {
        const val = parseFloat(cell.resolved);
        if (!isNaN(val)) {
          values.push(val);
        }
      }
    });

    if (values.length === 0) {
      return null;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      sum: Math.round(sum * 100) / 100,
      avg: Math.round((sum / values.length) * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [cells, selectionRange, activeCell]);

  if (!summary) {
    return (
      <div className="px-4 py-2 text-[10px] font-mono text-gray-400 border-t border-gray-200 bg-gray-50">
        NO_SELECTION
      </div>
    );
  }

  return (
    <div className="px-4 py-2 text-[10px] font-mono text-gray-700 border-t border-gray-200 bg-gray-50 flex items-center gap-8">
      <div>
        SELECTION: <span className="text-orange-600 font-bold">{selectionRange?.start || activeCell}</span>
      </div>
      <div className="flex items-center gap-6">
        <div>
          COUNT: <span className="text-gray-900 font-bold">{summary.count}</span>
        </div>
        <div>
          SUM: <span className="text-gray-900 font-bold">{summary.sum}</span>
        </div>
        <div>
          AVG: <span className="text-gray-900 font-bold">{summary.avg}</span>
        </div>
        <div>
          MIN: <span className="text-gray-900 font-bold">{summary.min}</span>
        </div>
        <div>
          MAX: <span className="text-gray-900 font-bold">{summary.max}</span>
        </div>
      </div>
    </div>
  );
};
