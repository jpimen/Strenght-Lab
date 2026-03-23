/**
 * FormulaBar Component
 * Top bar showing active cell reference and formula input
 * Mimics Excel's formula bar exactly
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X as CloseIcon } from 'lucide-react';
import type { VariableState } from '../types/spreadsheet';

interface FormulaBarProps {
  activeCell: string | null;
  formulaBar: string;
  variables: VariableState;
  onFormulaChange: (value: string) => void;
  onFormulaCommit: (value: string) => void;
  onVariableClick?: (varName: string) => void;
  showVariablesDropdown?: boolean;
}

interface VariableDropdownItem {
  name: string;
  value: string | number;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCell,
  formulaBar,
  variables,
  onFormulaChange,
  onFormulaCommit,
  onVariableClick,
  showVariablesDropdown = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Get sorted variable list
  const varList: VariableDropdownItem[] = Object.entries(variables)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameBoxClick = () => {
    if (showVariablesDropdown) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleVariableSelect = (varName: string) => {
    onVariableClick?.(varName);
    setDropdownOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFormulaCommit(formulaBar);
    } else if (e.key === 'Escape') {
      onFormulaChange(formulaBar); // reset to previous
    }
  };

  const handleCommit = () => {
    onFormulaCommit(formulaBar);
  };

  const handleCancel = () => {
    onFormulaChange(formulaBar);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
      {/* Name Box */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-1 w-[120px]">
          <input
            type="text"
            value={activeCell || ''}
            readOnly
            onClick={handleNameBoxClick}
            className="flex-1 px-2 py-1.5 font-mono text-[11px] border border-gray-300 rounded bg-gray-50 cursor-pointer text-gray-900 hover:bg-gray-100"
            placeholder="SELECT_CELL"
          />
          {showVariablesDropdown && (
            <button
              onClick={handleNameBoxClick}
              className="p-1 hover:bg-gray-100 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Variables Dropdown */}
        {dropdownOpen && showVariablesDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 w-max max-h-[300px] overflow-y-auto">
            {varList.map((variable) => (
              <button
                key={variable.name}
                onClick={() => handleVariableSelect(variable.name)}
                className="block w-full text-left px-3 py-2 hover:bg-red-50 text-[11px] font-mono border-b border-gray-100 last:border-0"
              >
                <span className="text-orange-600 font-bold">{variable.name}</span>
                <span className="text-gray-500 ml-3">=</span>
                <span className="text-gray-700 ml-2">{variable.value}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* fx Label */}
      <div className="text-[12px] font-mono font-bold text-gray-500 pr-3 border-r border-gray-200">
        fx
      </div>

      {/* Formula Input */}
      <input
        ref={inputRef}
        type="text"
        value={formulaBar}
        onChange={(e) => onFormulaChange(e.target.value)}
        onKeyDown={handleInputKeyDown}
        className="flex-1 px-3 py-1.5 font-mono text-[12px] bg-gray-50 border-0 outline-none"
        placeholder="ENTER_FORMULA_OR_VALUE"
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={handleCommit}
          title="Commit formula (Enter)"
          className="p-1.5 hover:bg-green-50 text-green-600 hover:text-green-700"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={handleCancel}
          title="Cancel (Escape)"
          className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
