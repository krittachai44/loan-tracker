import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSnackbar, type SnackbarMessage } from '../hooks/useSnackbar';

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const SnackbarContext = React.createContext<SnackbarContextValue | undefined>(undefined);

export function useSnackbarContext() {
  const context = React.useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbarContext must be used within SnackbarProvider');
  }
  return context;
}

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const { snackbars, showSuccess, showError, showWarning, showInfo, closeSnackbar } = useSnackbar();

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      {snackbars.map((snackbar: SnackbarMessage) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => closeSnackbar(snackbar.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => closeSnackbar(snackbar.id)}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};
