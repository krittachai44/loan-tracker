import * as React from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import Brightness4Outlined from '@mui/icons-material/Brightness4Outlined';
import Brightness7Outlined from '@mui/icons-material/Brightness7Outlined';
import { resetDatabase } from '../db';
import { DataExportImport } from './DataExportImport';
import { useThemeMode } from '../ThemeContext';
import type { Loan } from '../types';

interface AppHeaderProps {
  loanName: string;
  loan?: Loan;
  hideActions?: boolean;
  actions?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ loanName, loan, hideActions = false, actions }) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const { mode, toggleTheme } = useThemeMode();

  const handleResetClick = () => {
    setConfirmOpen(true);
  };

  const handleResetConfirm = async () => {
    setConfirmOpen(false);
    await resetDatabase();
    window.location.reload();
  };

  const handleResetCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {/* Logo Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <AccountBalanceOutlined sx={{ fontSize: 22 }} />
          </Box>

          {/* Title */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Loan Tracker
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.2
              }}
            >
              {loanName}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {!hideActions && loan && <DataExportImport loan={loan} />}

          {/* Theme Toggle Button - Always visible */}
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(99, 102, 241, 0.08)'
              }
            }}
            aria-label="toggle theme"
          >
            {mode === 'dark' ? <Brightness7Outlined fontSize="small" /> : <Brightness4Outlined fontSize="small" />}
          </IconButton>

          {!hideActions && (
            <IconButton
              onClick={handleResetClick}
              size="small"
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)'
                }
              }}
            >
              <RefreshOutlined fontSize="small" />
            </IconButton>
          )}

          {actions}
        </Box>
      </Toolbar>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleResetCancel}
        maxWidth="xs"
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
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'error.main'
            }}
          >
            <WarningAmberOutlined />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Reset All Data?
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            This will permanently delete:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3, color: 'text.secondary' }}>
            <li>
              <Typography variant="body2">All loan details and rates</Typography>
            </li>
            <li>
              <Typography variant="body2">Complete payment history</Typography>
            </li>
            <li>
              <Typography variant="body2">Reference rate data (MRR)</Typography>
            </li>
          </Box>
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'error.main',
              fontWeight: 600
            }}
          >
            ⚠️ This action cannot be undone
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleResetCancel}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResetConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Reset All Data
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
