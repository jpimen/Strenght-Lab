/**
 * SpreadsheetCell Component
 * Individual cell in the spreadsheet grid
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CellData } from './types';

interface SpreadsheetCellProps {
  id: string;
  data: CellData;
  isSelected: boolean;
  isActive: boolean;
  width: number;
  height: number;
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
  width,
  height,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const displayValue = data.computed || data.value || '';

  // Handle cell activation
  useEffect(() => {
    if (isActive && !isEditing) {
      setIsEditing(true);
      setEditValue(data.value || '');
    } else if (!isActive && isEditing) {
      setIsEditing(false);
      setEditValue('');
    }
  }, [isActive, isEditing, data.value]);

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

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value);
  }, []);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onChange(editValue);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsEditing(false);
      setEditValue('');
    }
  }, [editValue, onChange]);

  const handleInputBlur = useCallback(() => {
    onChange(editValue);
  }, [editValue, onChange]);

  const cellStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
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
          value={editValue}
          onChange={handleInputChange}
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
            padding: '0 4px'
          }}
        >
          {displayValue}
        </div>
      )}
    </div>
  );
};