/**
 * FormulaBar Component
 * Formula input bar for editing cell formulas
 */

import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  activeCell?: string;
  isEditing: boolean;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  value,
  onChange,
  onCommit,
  activeCell,
  isEditing
}) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  const handleCommit = () => {
    onCommit(inputValue);
  };

  const handleCancel = () => {
    setInputValue(value);
    onChange(value);
  };

  return (
    <div className="formula-bar">
      <div className="formula-bar-label">
        {activeCell && (
          <span className="cell-reference">{activeCell}:</span>
        )}
      </div>

      <div className="formula-bar-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="formula-bar-input"
          placeholder="Enter a value or formula (start with =)"
          disabled={!isEditing}
        />

        {isEditing && (
          <div className="formula-bar-actions">
            <button
              className="formula-bar-button commit"
              onClick={handleCommit}
              title="Commit (Enter)"
            >
              <Check size={14} />
            </button>
            <button
              className="formula-bar-button cancel"
              onClick={handleCancel}
              title="Cancel (Escape)"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};