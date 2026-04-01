/**
 * CSVImportExport Component
 * Handles CSV import and export functionality
 */

import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';

interface CSVImportExportProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export const CSVImportExport: React.FC<CSVImportExportProps> = ({
  onExport,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="csv-import-export">
      <button
        onClick={onExport}
        className="action-button"
        title="Export to CSV"
      >
        <Download size={16} />
        Export CSV
      </button>

      <button
        onClick={handleImportClick}
        className="action-button"
        title="Import from CSV"
      >
        <Upload size={16} />
        Import CSV
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};