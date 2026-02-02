import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { THEME_STORAGE_KEY, DEFAULT_THEME } from './constants';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Module-level cache to avoid repeated localStorage reads
let cachedThemeMode: ThemeMode | null = null;

/**
 * Get theme from localStorage with caching
 */
const getStoredTheme = (): ThemeMode => {
  if (cachedThemeMode !== null) {
    return cachedThemeMode;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    cachedThemeMode = (stored as ThemeMode) || DEFAULT_THEME;
  } catch {
    // localStorage disabled or quota exceeded
    cachedThemeMode = DEFAULT_THEME;
  }

  return cachedThemeMode;
};

/**
 * Save theme to localStorage and update cache
 */
const setStoredTheme = (mode: ThemeMode): void => {
  cachedThemeMode = mode;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Fail silently if localStorage is unavailable
  }
};

export const ThemeContextProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    setStoredTheme(mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export hook separately to avoid Fast Refresh warning
export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
}
