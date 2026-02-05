import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import { modernTheme, darkTheme } from './modernTheme';
import { ThemeContextProvider, useThemeMode } from './ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SnackbarProvider } from './components/SnackbarProvider';
import App from './App.tsx';

const ThemedApp = () => {
  const { mode } = useThemeMode();
  const theme = mode === 'dark' ? darkTheme : modernTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeContextProvider>
      <ThemedApp />
    </ThemeContextProvider>
  </StrictMode>,
);
