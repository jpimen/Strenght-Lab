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
  onMouseDown?: (key: string, e: React.MouseEvent) => void;
  onMouseEnter?: (key: string) => void;
  zoomLevel?: number;
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
  onMouseDown,
  onMouseEnter,
  zoomLevel = 100,
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
  const zoomScale = zoomLevel / 100;
  const textScale = zoomScale * 1.1;
  const cellFontSize = Math.max(10, Math.round(11 * textScale));
  const indicatorSize = Math.max(6, Math.round(8 * zoomScale));

  return (
    <td
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={(e) => {
        if (onMouseDown) {
          onMouseDown(cellKey, e);
        }
      }}
      onMouseEnter={() => {
        if (onMouseEnter) {
          onMouseEnter(cellKey);
        }
      }}
      className={clsx(
        'relative px-2 py-1 font-sans border-r border-b border-gray-200 transition-all duration-75 select-none h-8',
        isReadonly && 'bg-gray-50 cursor-default',
        !isReadonly && 'cursor-cell hover:bg-gray-50',
        isActive && 'ring-2 ring-blue-500 ring-inset z-10 bg-white',
        isSelected && !isActive && 'bg-white',
        hasError && 'bg-white ring-2 ring-red-500 animate-pulse',
        isFormula && !hasError && 'bg-white',
        isDependency && !isActive && 'ring-1 ring-blue-300',
        isDependent && !isActive && 'ring-1 ring-orange-300'
      )}
    >
      {isEditing ? (
        // Edit mode
        <div className="relative w-full h-full">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="w-full h-full px-1 py-0 font-sans bg-white border-0 outline-none focus:ring-0"
            style={{ fontSize: `${cellFontSize}px` }}
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
        <div className="flex items-center justify-between gap-1 text-ellipsis overflow-hidden">
          <span
            className={clsx(
              'font-mono truncate',
              isReadonly && 'font-semibold text-gray-700',
              hasError && 'text-red-600',
              !hasError && 'text-gray-900'
            )}
            style={{ fontSize: `${cellFontSize}px` }}
            title={displayValue}
          >
            {displayValue}
          </span>

          {/* Formula indicator (small orange square) */}
          {isFormulaBased && !hasError && (
            <div
              className="ml-auto flex-shrink-0 bg-orange-500 rounded"
              style={{ width: `${indicatorSize}px`, height: `${indicatorSize}px` }}
              title={cellData?.raw}
            />
          )}
        </div>
      )}
    </td>
  );
};
