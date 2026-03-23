/**
 * AutocompleteDropdown Component
 * Suggestion list for formula input
 */

import React, { useEffect, useRef, useState } from 'react';
import type { AutocompleteOption } from '../utils/autocomplete';
import clsx from 'clsx';

interface AutocompleteDropdownProps {
  options: AutocompleteOption[];
  visible: boolean;
  onSelect: (option: AutocompleteOption) => void;
  x?: number;
  y?: number;
}

export const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
  options,
  visible,
  onSelect,
  x = 0,
  y = 0,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset selected index when options change
    // This is safe here as we're syncing with external state
  }, [options]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      switch (e.key) {
        case 'ArrowDown':
          setSelectedIndex((prev) => (prev + 1) % options.length);
          e.preventDefault();
          break;
        case 'ArrowUp':
          setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
          e.preventDefault();
          break;
        case 'Enter':
        case 'Tab':
          if (options[selectedIndex]) {
            onSelect(options[selectedIndex]);
          }
          e.preventDefault();
          break;
        case 'Escape':
          // Let parent handle Escape
          break;
        default:
          break;
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, options, selectedIndex, onSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!visible || options.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
      }}
      className="bg-white border border-gray-300 rounded shadow-lg max-h-[240px] overflow-y-auto z-50"
    >
      {options.map((option, idx) => (
        <div
          key={idx}
          ref={(el) => {
            if (el) itemsRef.current[idx] = el;
          }}
          onClick={() => onSelect(option)}
          className={clsx(
            'px-3 py-2 text-[11px] font-mono border-b border-gray-100 cursor-pointer last:border-0',
            idx === selectedIndex
              ? 'bg-orange-50 border-l-2 border-l-orange-600'
              : 'hover:bg-gray-50'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">{option.label}</span>
            <span className="text-[9px] text-gray-500 uppercase">{option.type}</span>
          </div>
          <div className="text-[9px] text-gray-600 mt-0.5">{option.description}</div>
          {option.currentValue !== undefined && (
            <div className="text-[9px] text-gray-500 mt-1">
              = <span className="text-gray-700">{option.currentValue}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
