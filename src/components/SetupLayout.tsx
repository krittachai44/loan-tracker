import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FileUpload from '@mui/icons-material/FileUpload';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Download from '@mui/icons-material/Download';
import Info from '@mui/icons-material/Info';
import { AppHeader } from './AppHeader';
import { LoanSetup } from './LoanSetup';
import { MRRManager } from './MRRManager';
import { useLoanImport, useSnackbar } from '../hooks';
import { ACCEPTED_FILE_TYPES, SAMPLE_CSV_DATA } from '../constants/csv';

export const SetupLayout: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [sampleDialogOpen, setSampleDialogOpen] = React.useState(false);
  const { showSuccess } = useSnackbar();
  const { importFromFile, isImporting } = useLoanImport();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importFromFile(file);
    
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'loan-tracker-sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess('Sample CSV downloaded!');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header Bar */}
      <AppHeader
        loanName="Initial Setup"
        hideActions
        actions={
          <>
            <Tooltip title="View Sample Format">
              <IconButton
                onClick={() => setSampleDialogOpen(true)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: 'primary.main'
                  }
                }}
              >
                <HelpOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import CSV Data">
              <IconButton
                onClick={handleUploadClick}
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.08)'
                  }
                }}
              >
                <FileUpload fontSize="small" />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              disabled={isImporting}
            />
          </>
        }
      />

      {/* Main Content */}
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '650px 1fr' }, gap: 3 }}>
          {/* Left Side - Setup Form */}
          <LoanSetup onComplete={() => { }} />

          {/* Right Side - MRR Manager */}
          <MRRManager />
        </Box>
      </Box>

      {/* Sample Format Dialog */}
      <Dialog
        open={sampleDialogOpen}
        onClose={() => setSampleDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            }
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 2
        }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main'
            }}
          >
            <Info />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              CSV Import Format
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Follow this structure to import your loan data
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: '60vh',
              color: 'text.primary'
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {SAMPLE_CSV_DATA}
            </pre>
          </Paper>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
              📋 Format Guidelines:
            </Typography>
            <Typography variant="body2" component="div" sx={{ color: 'text.secondary' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li><strong>Sections</strong> start with # (LOAN DETAILS, RATE SEGMENTS, REFERENCE RATES, PAYMENT HISTORY)</li>
                <li><strong>Rate Type</strong> can be "fixed" (fixed rate) or "float" (variable rate with margin)</li>
                <li><strong>Date Format</strong> must be YYYY-MM-DD (e.g., 2024-01-01)</li>
                <li><strong>Numbers</strong> should not include commas or currency symbols</li>
                <li><strong>File Types</strong> supported: .csv, .xlsx, .xls</li>
              </ul>
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={handleDownloadSample}
            startIcon={<Download />}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Download Sample
          </Button>
          <Button
            onClick={() => setSampleDialogOpen(false)}
            variant="contained"
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
