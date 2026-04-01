/**
 * ContextMenu Component
 * Right-click menu for spreadsheet operations
 */

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

export interface ContextMenuOption {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuOption[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg min-w-[200px] py-1 animate-scaleIn origin-top-left"
    >
      {options.map((option, idx) => (
        <React.Fragment key={idx}>
          {option.divider ? (
            <div className="my-1 border-t border-gray-200 animate-fadeIn" style={{ animationDelay: `${idx * 30}ms` }} />
          ) : (
            <button
              onClick={() => {
                option.onClick();
                onClose();
              }}
              disabled={option.disabled}
              style={{ animationDelay: `${idx * 30}ms` }}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 text-left text-[11px] font-mono animate-fadeIn transition-all duration-200 active:scale-95',
                option.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:shadow-sm cursor-pointer'
              )}
            >
              {option.icon && <span className="w-4 h-4 transition-transform hover:scale-110">{option.icon}</span>}
              <span className="flex-1">{option.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
