import { useState, useCallback } from 'react';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarMessage {
  message: string;
  severity: SnackbarSeverity;
  id: number;
}

let messageId = 0;

/**
 * Hook for showing toast/snackbar notifications
 * Replaces browser alert() calls with better UX
 */
export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity) => {
    const id = messageId++;
    setSnackbars(prev => [...prev, { message, severity, id }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setSnackbars(prev => prev.filter(s => s.id !== id));
    }, 5000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  const closeSnackbar = useCallback((id: number) => {
    setSnackbars(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    snackbars,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar
  };
}
