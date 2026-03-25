/**
 * SheetCell Component
 * Individual cell in the spreadsheet grid
 */

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import type { CellData } from '../types/spreadsheet';

interface SheetCellProps {
  cellKey: string;
  cellData: CellData | undefined;
  isActive: boolean;
  isSelected: boolean;
  isReadonly?: boolean;
  isFormula?: boolean;
  hasError?: boolean;
  isDependency?: boolean;
  isDependent?: boolean;
  onCellClick: (key: string) => void;
  onCellDoubleClick: (key: string) => void;
  onValueChange: (key: string, value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, key: string) => void;
  width?: string;
}

export const SheetCell: React.FC<SheetCellProps> = ({
  cellKey,
  cellData,
  isActive,
  isSelected,
  isReadonly = false,
  isFormula = false,
  hasError = false,
  isDependency = false,
  isDependent = false,
  onCellClick,
  onCellDoubleClick,
  onValueChange,
  onKeyDown,
  width = 'auto',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(cellData?.raw || '');
  const [livePreview, setLivePreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCellClick(cellKey);
    if (!isReadonly) {
      setIsEditing(true);
      setEditValue(cellData?.raw || '');
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReadonly) {
      setIsEditing(true);
      setEditValue(cellData?.raw || '');
      onCellDoubleClick(cellKey);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    setLivePreview(newValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e, cellKey);
    }

    if (e.key === 'Enter') {
      commitEdit();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(cellData?.raw || '');
      setLivePreview('');
    } else if (e.key === 'Tab') {
      commitEdit();
      e.preventDefault();
    }
  };

  const handleInputBlur = () => {
    commitEdit();
  };

  const commitEdit = () => {
    if (editValue !== cellData?.raw) {
      onValueChange(cellKey, editValue);
    }
    setIsEditing(false);
    setLivePreview('');
  };

  const displayValue = livePreview || cellData?.resolved || '';
  const isFormulaBased = cellData?.raw.startsWith('=') || false;

  return (
    <td
      style={{ width }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={clsx(
        'relative px-3 py-2 text-[11px] font-sans border border-gray-200 transition-colors',
        isReadonly && 'bg-gray-50 cursor-default',
        !isReadonly && 'cursor-cell',
        isActive && 'ring-2 ring-orange-500 ring-inset z-10',
        isSelected && !isActive && 'bg-blue-50',
        hasError && 'bg-amber-50 ring-1 ring-amber-500',
        isFormula && !hasError && 'bg-orange-50/5',
        isDependency && !isActive && 'ring-1 ring-blue-400',
        isDependent && !isActive && 'ring-1 ring-orange-400'
      )}
    >
      {isEditing ? (
        // Edit mode
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="w-full px-0 py-0 font-mono text-[11px] bg-white border-0 outline-none"
          />
          {/* Live preview tooltip */}
          {editValue.startsWith('=') && livePreview && (
            <div
              ref={previewRef}
              className="absolute top-full left-0 mt-1 px-2 py-1 text-[10px] bg-gray-900 text-white rounded whitespace-nowrap z-50"
            >
              → {livePreview}
            </div>
          )}
        </div>
      ) : (
        // Display mode
        <div className="flex items-center justify-between">
          <span
            className={clsx(
              'font-mono',
              isReadonly && 'font-bold text-gray-700',
              hasError && 'text-amber-600',
              !hasError && 'text-gray-900'
            )}
          >
            {displayValue}
          </span>

          {/* Formula indicator (red triangle) */}
          {isFormulaBased && !hasError && (
            <div className="ml-1 w-2 h-2 bg-orange-600 rounded-tr-sm" title={cellData?.raw} />
          )}

          {/* Error indicator */}
          {hasError && (
            <div
              className="ml-1 text-amber-600 font-bold cursor-help"
              title={cellData?.error || 'Unknown error'}
            >
              !
            </div>
          )}
        </div>
      )}
    </td>
  );
};
