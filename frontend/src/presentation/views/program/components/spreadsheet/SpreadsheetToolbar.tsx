/**
 * SpreadsheetToolbar Component
 * Toolbar with formatting and action buttons
 */

import React from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Copy,
  Scissors,
  Clipboard,
  Undo,
  Redo,
  Sun,
  Moon
} from 'lucide-react';
import type { ToolbarFormat } from './types';

interface SpreadsheetToolbarProps {
  onFormat: (format: Partial<ToolbarFormat>) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  onFormat,
  onAddRow,
  onAddColumn,
  onDeleteRow,
  onDeleteColumn,
  onCopy,
  onPaste,
  onCut,
  onClear,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <div className="spreadsheet-toolbar">
      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onFormat({ bold: true })}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => onFormat({ italic: true })}
          title="Italic"
        >
          <Italic size={16} />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onFormat({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => onFormat({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => onFormat({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Row/Column Operations */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onAddRow}
          title="Add Row"
        >
          <Plus size={16} />
          Row
        </button>
        <button
          className="toolbar-button"
          onClick={onAddColumn}
          title="Add Column"
        >
          <Plus size={16} />
          Col
        </button>
        <button
          className="toolbar-button"
          onClick={onDeleteRow}
          title="Delete Row"
        >
          <Minus size={16} />
          Row
        </button>
        <button
          className="toolbar-button"
          onClick={onDeleteColumn}
          title="Delete Column"
        >
          <Minus size={16} />
          Col
        </button>
      </div>

      {/* Clipboard Operations */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onCopy}
          title="Copy"
        >
          <Copy size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={onCut}
          title="Cut"
        >
          <Scissors size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={onPaste}
          title="Paste"
        >
          <Clipboard size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={onClear}
          title="Clear"
        >
          Clear
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};