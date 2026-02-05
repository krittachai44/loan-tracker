import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import { type Loan } from '../types';
import { useLoanExport, useLoanImport } from '../hooks';

interface Props {
  loan: Loan;
}

export const DataExportImport: React.FC<Props> = ({ loan }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { exportToCSV } = useLoanExport();
  const { importFromFile, isImporting } = useLoanImport();

  const handleExport = () => {
    exportToCSV(loan);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromFile(file);
    }
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {/* Export Button */}
      <Tooltip title="Export Data" arrow>
        <IconButton
          onClick={handleExport}
          size="small"
          sx={{
            color: 'success.main',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.08)'
            }
          }}
        >
          <FileDownloadOutlined fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Import Button */}
      <Tooltip title="Import Data" arrow>
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          size="small"
          sx={{
            color: 'info.main',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.08)'
            }
          }}
        >
          <FileUploadOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );
};
