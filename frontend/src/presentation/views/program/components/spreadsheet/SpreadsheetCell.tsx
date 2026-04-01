/**
 * SpreadsheetCell Component
 * Individual cell in the spreadsheet grid
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { CellData } from './types';

interface SpreadsheetCellProps {
  id: string;
  data: CellData;
  isSelected: boolean;
  isActive: boolean;
  isEditing: boolean;
  width: number;
  height: number;
  zoomLevel?: number;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onMouseEnter: (event: React.MouseEvent) => void;
  onChange: (value: string) => void;
}

export const SpreadsheetCell: React.FC<SpreadsheetCellProps> = ({
  id,
  data,
  isSelected,
  isActive,
  isEditing,
  width,
  height,
  zoomLevel = 100,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const displayValue = data.computed || data.value || '';
  const zoomScale = zoomLevel / 100;
  const cellFontSize = Math.max(8, 13 * zoomScale);
  const cellPaddingY = Math.max(1, 2 * zoomScale);
  const cellPaddingX = Math.max(2, 4 * zoomScale);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onClick(event);
  }, [onClick]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onDoubleClick();
  }, [onDoubleClick]);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    onMouseEnter(event);
  }, [onMouseEnter]);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onChange(event.currentTarget.value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.currentTarget.value = data.value || '';
      onChange(data.value || '');
      event.currentTarget.blur();
    }
  }, [data.value, onChange]);

  const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  }, [onChange]);

  const cellStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    fontSize: `${cellFontSize}px`,
    ...data.format
  };

  const getCellClasses = () => {
    const classes = ['spreadsheet-cell'];

    if (isSelected) classes.push('selected');
    if (isActive) classes.push('active');
    if (data.error) classes.push('error');
    if (data.format?.bold) classes.push('bold');
    if (data.format?.italic) classes.push('italic');

    return classes.join(' ');
  };

  return (
    <div
      ref={cellRef}
      className={getCellClasses()}
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      data-cell-id={id}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          defaultValue={data.value || ''}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="cell-input"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            fontWeight: data.format?.bold ? 'bold' : 'normal',
            fontStyle: data.format?.italic ? 'italic' : 'normal',
            textAlign: data.format?.textAlign || 'left'
          }}
        />
      ) : (
        <div
          className="cell-content"
          style={{
            textAlign: data.format?.textAlign || 'left',
            verticalAlign: data.format?.verticalAlign || 'middle',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            padding: `${cellPaddingY}px ${cellPaddingX}px`
          }}
        >
          {displayValue}
        </div>
      )}
    </div>
  );
};
