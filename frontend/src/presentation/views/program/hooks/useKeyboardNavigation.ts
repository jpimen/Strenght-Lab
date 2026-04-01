/**
 * useKeyboardNavigation Hook
 * Handles keyboard navigation for the spreadsheet
 */

import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  activeCell?: string;
  onCellSelect: (cellId: string) => void;
  onRangeSelect: (startCell: string, endCell: string) => void;
  onStartEdit: (cellId: string) => void;
  onStopEdit: () => void;
  gridRef: React.RefObject<HTMLDivElement>;
}

export function useKeyboardNavigation({
  activeCell,
  onCellSelect,
  onRangeSelect,
  onStartEdit,
  onStopEdit,
  gridRef
}: UseKeyboardNavigationProps) {

  const getAdjacentCell = useCallback((cellId: string, direction: 'up' | 'down' | 'left' | 'right'): string => {
    const position = parseCellId(cellId);
    let newRow = position.row;
    let newCol = position.col;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, position.row - 1);
        break;
      case 'down':
        newRow = position.row + 1;
        break;
      case 'left':
        newCol = Math.max(0, position.col - 1);
        break;
      case 'right':
        newCol = position.col + 1;
        break;
    }

    return `${numberToColumnLabel(newCol)}${newRow + 1}`;
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!activeCell) return;

    const { key, shiftKey, ctrlKey, metaKey } = event;
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = (isMac && metaKey) || (!isMac && ctrlKey);

    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        if (shiftKey && activeCell) {
          const endCell = getAdjacentCell(activeCell, 'up');
          onRangeSelect(activeCell, endCell);
        } else {
          const nextCell = getAdjacentCell(activeCell, 'up');
          onCellSelect(nextCell);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (shiftKey && activeCell) {
          const endCell = getAdjacentCell(activeCell, 'down');
          onRangeSelect(activeCell, endCell);
        } else {
          const nextCell = getAdjacentCell(activeCell, 'down');
          onCellSelect(nextCell);
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (shiftKey && activeCell) {
          const endCell = getAdjacentCell(activeCell, 'left');
          onRangeSelect(activeCell, endCell);
        } else {
          const nextCell = getAdjacentCell(activeCell, 'left');
          onCellSelect(nextCell);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (shiftKey && activeCell) {
          const endCell = getAdjacentCell(activeCell, 'right');
          onRangeSelect(activeCell, endCell);
        } else {
          const nextCell = getAdjacentCell(activeCell, 'right');
          onCellSelect(nextCell);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (activeCell) {
          onStartEdit(activeCell);
        }
        break;

      case 'Tab':
        event.preventDefault();
        if (shiftKey) {
          const nextCell = getAdjacentCell(activeCell, 'left');
          onCellSelect(nextCell);
        } else {
          const nextCell = getAdjacentCell(activeCell, 'right');
          onCellSelect(nextCell);
        }
        break;

      case 'Escape':
        event.preventDefault();
        onStopEdit();
        break;

      case 'F2':
        event.preventDefault();
        if (activeCell) {
          onStartEdit(activeCell);
        }
        break;

      // Copy/paste shortcuts
      case 'c':
      case 'C':
        if (cmdOrCtrl) {
          event.preventDefault();
          // Copy functionality would be handled by parent component
          document.execCommand('copy');
        }
        break;

      case 'v':
      case 'V':
        if (cmdOrCtrl) {
          event.preventDefault();
          // Paste functionality would be handled by parent component
          document.execCommand('paste');
        }
        break;

      case 'x':
      case 'X':
        if (cmdOrCtrl) {
          event.preventDefault();
          // Cut functionality would be handled by parent component
          document.execCommand('cut');
        }
        break;

      case 'z':
      case 'Z':
        if (cmdOrCtrl) {
          event.preventDefault();
          if (shiftKey) {
            // Redo - handled by parent
          } else {
            // Undo - handled by parent
          }
        }
        break;

      case 'y':
      case 'Y':
        if (cmdOrCtrl) {
          event.preventDefault();
          // Redo - handled by parent
        }
        break;

      case 'a':
      case 'A':
        if (cmdOrCtrl) {
          event.preventDefault();
          // Select all - could be implemented
        }
        break;
    }
  }, [activeCell, onCellSelect, onRangeSelect, onStartEdit, onStopEdit, getAdjacentCell]);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    gridElement.addEventListener('keydown', handleKeyDown);
    return () => {
      gridElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, gridRef]);
}

// Helper functions
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
