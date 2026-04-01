/**
 * VariablesPanel Component
 * Collapsible left sidebar for named variables
 */

import React, { useState } from 'react';
import { ChevronUp, Plus } from 'lucide-react';
import type { VariableState } from '../types/spreadsheet';

interface VariablesPanelProps {
  variables: VariableState;
  onVariableChange: (name: string, value: string | number) => void;
  onAddVariable?: (name: string, value: string | number) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables,
  onVariableChange,
  onAddVariable,
  isOpen = true,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [editingVar, setEditingVar] = useState<string | null>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const handleAddVariable = () => {
    if (newVarName.trim() && newVarValue.trim()) {
      const numValue = parseFloat(newVarValue) || newVarValue;
      onAddVariable?.(newVarName.toUpperCase(), numValue);
      setNewVarName('');
      setNewVarValue('');
    }
  };

  const handleVariableEdit = (name: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || value : value;
    onVariableChange(name, numValue);
    setEditingVar(null);
  };

  const sortedVars = Object.entries(variables).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div
      className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-300 animate-slideLeft ${
        isExpanded ? 'w-56' : 'w-12'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 bg-gray-100 animate-slideLeft delay-50">
        {isExpanded && (
          <h3 className="text-[9px] font-mono font-bold tracking-widest text-gray-700 uppercase animate-fadeIn">
            Named Variables
          </h3>
        )}
        <button
          onClick={handleToggle}
          className="p-1 hover:bg-gray-200 hover:scale-110 active:scale-95 transition-all duration-300"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronUp
            className={`w-4 h-4 text-gray-600 transition-all duration-300 ${
              isExpanded ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto animate-slideRight delay-100">
          {/* Variables Table */}
          <div className="divide-y divide-gray-200">
            {sortedVars.map(([name, value], idx) => (
              <div
                key={name}
                style={{ animationDelay: `${(idx + 2) * 50}ms` }}
                className="px-3 py-2 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 animate-fadeIn"
              >
                <div className="text-[9px] font-mono font-bold text-orange-600 mb-1">
                  {name}
                </div>
                <div className="flex items-center gap-2">
                  {editingVar === name ? (
                    <input
                      type="text"
                      defaultValue={value}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleVariableEdit(name, (e.target as HTMLInputElement).value);
                        } else if (e.key === 'Escape') {
                          setEditingVar(null);
                        }
                      }}
                      onBlur={(e) => {
                        handleVariableEdit(name, e.target.value);
                      }}
                      className="flex-1 px-2 py-0.5 text-[13px] font-bold font-sans border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingVar(name)}
                      className="flex-1 text-left px-2 py-0.5 text-[13px] font-black tracking-wide font-sans text-gray-900 hover:bg-white hover:border hover:border-gray-300 hover:shadow-sm hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200"
                    >
                      {value}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Variable */}
          <div className="px-3 py-3 border-t border-gray-200 bg-gray-100 animate-slideUp">
            <button className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-700 uppercase mb-2 hover:text-gray-900 hover:scale-110 active:scale-95 transition-all duration-200">
              <Plus className="w-3 h-3" /> Add Variable
            </button>
            <div className="space-y-1">
              <input
                type="text"
                placeholder="NAME"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className="w-full px-2 py-1 text-[10px] font-mono border border-gray-300 rounded hover:border-gray-400 focus:ring-2 focus:ring-orange-500 transition-all duration-200"
              />
              <input
                type="text"
                placeholder="VALUE"
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddVariable();
                  }
                }}
                className="w-full px-2 py-1 text-[10px] font-mono border border-gray-300 rounded hover:border-gray-400 focus:ring-2 focus:ring-orange-500 transition-all duration-200"
              />
              <button
                onClick={handleAddVariable}
                className="w-full px-2 py-1 text-[9px] font-mono font-bold bg-orange-600 text-white rounded hover:bg-orange-700 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
              >
                ADD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
