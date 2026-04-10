/**
 * MenuBar Component
 * Google Sheets-like menu bar with File, Edit, View, Insert, Format, Data, Tools, Extensions, Help menus
 */

import React, { useState } from 'react';

interface MenuItemProps {
  label?: string;
  onClick?: () => void;
  divider?: boolean;
}

interface MenuProps {
  items: MenuItemProps[];
  onClose: () => void;
}

const MenuDropdown: React.FC<MenuProps> = ({ items, onClose }) => {
  return (
    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-max">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.divider ? (
            <div className="h-px bg-gray-200 my-1" />
          ) : (
            <button
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-[13px] text-gray-800 hover:bg-blue-50 transition-colors duration-150"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface MenuBarProps {
  fileName?: string;
  onSaveFile?: () => void;
  onShareFile?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  showGridlines?: boolean;
  onGridlinesToggle?: (show: boolean) => void;
  onSort?: () => void;
  onFilter?: () => void;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  fileName = 'Untitled spreadsheet',
  onSaveFile,
  onUndo,
  onRedo,
  showGridlines = true,
  onGridlinesToggle,
  onSort,
  onFilter,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [editedFileName, setEditedFileName] = useState(fileName);

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedFileName(e.target.value);
  };

  const handleFileNameBlur = () => {
    setIsEditingFileName(false);
    // Could save the new name here
  };

  const menuItems: Record<string, MenuItemProps[]> = {
    File: [
      { label: 'New' },
      { label: 'Open' },
      { label: 'Open recent' },
      { divider: true },
      { label: 'Make a copy' },
      { label: 'Download' },
      { label: 'Email' },
      { divider: true },
      { label: 'Version history' },
      { divider: true },
      { label: 'Settings' },
    ],
    Edit: [
      { label: 'Undo', onClick: onUndo },
      { label: 'Redo', onClick: onRedo },
      { divider: true },
      { label: 'Cut' },
      { label: 'Copy' },
      { label: 'Paste' },
      { divider: true },
      { label: 'Find and replace' },
      { label: 'Delete row' },
      { label: 'Delete column' },
      { divider: true },
      { label: 'Clear contents' },
    ],
    View: [
      { label: 'Show formula bar' },
      { label: 'Show gridlines', onClick: () => onGridlinesToggle?.(!showGridlines) },
      { label: 'Show row and column headers' },
      { divider: true },
      { label: 'Freeze rows' },
      { label: 'Freeze columns' },
      { divider: true },
      { label: 'Zoom' },
    ],
    Insert: [
      { label: 'Rows above' },
      { label: 'Rows below' },
      { label: 'Columns left' },
      { label: 'Columns right' },
      { divider: true },
      { label: 'Function' },
      { label: 'Chart' },
      { label: 'Pivot table' },
      { label: 'Image' },
      { label: 'Link' },
      { label: 'Comment' },
    ],
    Format: [
      { label: 'Number format' },
      { label: 'Alignment' },
      { label: 'Text wrapping' },
      { label: 'Text rotation' },
      { divider: true },
      { label: 'Paint format' },
      { label: 'Clear formatting' },
      { divider: true },
      { label: 'Conditional formatting' },
      { label: 'Alternating colors' },
    ],
    Data: [
      { label: 'Sort range', onClick: onSort },
      { label: 'Create a filter', onClick: onFilter },
      { label: 'Split text to columns' },
      { divider: true },
      { label: 'Data validation' },
      { divider: true },
      { label: 'Named ranges and expressions' },
    ],
    Tools: [
      { label: 'Spelling' },
      { label: 'Word count' },
      { label: 'Keyboard shortcuts' },
      { divider: true },
      { label: 'Script editor' },
      { label: 'Add-ons' },
    ],
    Extensions: [
      { label: 'Add-ons' },
      { label: 'Install add-on' },
    ],
    Help: [
      { label: 'Help center' },
      { label: 'Keyboard shortcuts' },
      { label: 'Report a bug' },
    ],
  };

  const menuNames = ['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions', 'Help'];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Title Section */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4 flex-1">
          {isEditingFileName ? (
            <input
              type="text"
              value={editedFileName}
              onChange={handleFileNameChange}
              onBlur={handleFileNameBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFileNameBlur();
                }
              }}
              autoFocus
              className="text-[22px] font-medium text-gray-900 px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h1
              onClick={() => setIsEditingFileName(true)}
              className="text-[22px] font-medium text-gray-900 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-150"
            >
              {fileName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveFile}
            className="px-4 py-1.5 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-150"
          >
            Share
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="px-4 py-2 flex items-center gap-8 bg-white">
        {menuNames.map((menuName) => (
          <div key={menuName} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
              className="text-[13px] text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-150 hover:text-gray-900"
            >
              {menuName}
            </button>
            {activeMenu === menuName && (
              <MenuDropdown
                items={menuItems[menuName] || []}
                onClose={() => setActiveMenu(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Close menu when clicking outside */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};
