/**
 * useSpreadsheetState Hook
 * Manages spreadsheet state with reducer pattern
 */

import { useReducer } from 'react';
import { updateComputedValues } from '../utils/spreadsheetFormulaEngine';
import type { SpreadsheetData, CellData } from '../components/spreadsheet/types';

interface SpreadsheetState {
  data: SpreadsheetData;
  activeCell?: string;
  selection: string[];
  isEditing: boolean;
  undoStack: SpreadsheetData[];
  redoStack: SpreadsheetData[];
  darkMode: boolean;
}

type SpreadsheetAction =
  | { type: 'UPDATE_CELL'; cellId: string; data: Partial<CellData> }
  | { type: 'SELECT_CELL'; cellId: string }
  | { type: 'SELECT_RANGE'; cellIds: string[] }
  | { type: 'START_EDITING'; cellId: string }
  | { type: 'STOP_EDITING' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_ROW' }
  | { type: 'ADD_COLUMN' }
  | { type: 'DELETE_ROW'; rowIndex: number }
  | { type: 'DELETE_COLUMN'; colIndex: number }
  | { type: 'SET_DATA'; data: SpreadsheetData }
  | { type: 'TOGGLE_DARK_MODE' };

const createInitialData = (): SpreadsheetData => ({
  cells: {},
  columns: 26, // A-Z
  rows: 100,
  columnWidths: {},
  rowHeights: {},
  undoStack: [],
  redoStack: []
});

const initialState: SpreadsheetState = {
  data: createInitialData(),
  selection: [],
  isEditing: false,
  undoStack: [],
  redoStack: [],
  darkMode: false
};

function spreadsheetReducer(state: SpreadsheetState, action: SpreadsheetAction): SpreadsheetState {
  switch (action.type) {
    case 'UPDATE_CELL': {
      const newCells = {
        ...state.data.cells,
        [action.cellId]: {
          ...state.data.cells[action.cellId],
          ...action.data
        }
      };

      // Update computed values for all cells that might be affected
      const updatedData = updateComputedValues({
        ...state.data,
        cells: newCells
      });

      return {
        ...state,
        data: {
          ...updatedData,
          undoStack: [...state.data.undoStack, state.data],
          redoStack: []
        }
      };
    }

    case 'SELECT_CELL':
      return {
        ...state,
        activeCell: action.cellId,
        selection: [action.cellId],
        isEditing: false
      };

    case 'SELECT_RANGE':
      return {
        ...state,
        selection: action.cellIds,
        isEditing: false
      };

    case 'START_EDITING':
      return {
        ...state,
        activeCell: action.cellId,
        isEditing: true
      };

    case 'STOP_EDITING':
      return {
        ...state,
        isEditing: false
      };

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;

      const previousData = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);

      return {
        ...state,
        data: previousData,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, state.data]
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;

      const nextData = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);

      return {
        ...state,
        data: nextData,
        redoStack: newRedoStack,
        undoStack: [...state.undoStack, state.data]
      };
    }

    case 'ADD_ROW': {
      const newData = {
        ...state.data,
        rows: state.data.rows + 1
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, state.data],
        redoStack: []
      };
    }

    case 'ADD_COLUMN': {
      const newData = {
        ...state.data,
        columns: state.data.columns + 1
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, state.data],
        redoStack: []
      };
    }

    case 'DELETE_ROW': {
      if (state.data.rows <= 1) return state;

      const newData = {
        ...state.data,
        rows: state.data.rows - 1,
        cells: Object.fromEntries(
          Object.entries(state.data.cells).filter(([cellId]) => {
            const rowNum = parseInt(cellId.match(/\d+/)?.[0] || '0');
            return rowNum !== action.rowIndex + 1;
          })
        )
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, state.data],
        redoStack: []
      };
    }

    case 'DELETE_COLUMN': {
      if (state.data.columns <= 1) return state;

      const newData = {
        ...state.data,
        columns: state.data.columns - 1,
        cells: Object.fromEntries(
          Object.entries(state.data.cells).filter(([cellId]) => {
            const colLabel = cellId.match(/[A-Z]+/)?.[0] || '';
            const colNum = columnLabelToNumber(colLabel);
            return colNum !== action.colIndex;
          })
        )
      };

      return {
        ...state,
        data: newData,
        undoStack: [...state.undoStack, state.data],
        redoStack: []
      };
    }

    case 'SET_DATA':
      return {
        ...state,
        data: action.data
      };

    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode
      };

    default:
      return state;
  }
}

export function useSpreadsheetState(initialData?: SpreadsheetData) {
  const [state, dispatch] = useReducer(spreadsheetReducer, {
    ...initialState,
    data: initialData || initialState.data
  });

  return {
    ...state,
    dispatch
  };
}

// Helper function
function columnLabelToNumber(label: string): number {
  let result = 0;
  for (let i = 0; i < label.length; i++) {
    result = result * 26 + (label.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
}