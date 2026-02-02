import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Modern design tokens
export const designTokens = {
  colors: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrast: '#ffffff'
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669'
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626'
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706'
    },
    info: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb'
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
      elevated: '#ffffff'
    },
    surface: {
      glass: 'rgba(255, 255, 255, 0.7)',
      glassDark: 'rgba(255, 255, 255, 0.9)'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
  }
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.colors.primary.main,
      light: designTokens.colors.primary.light,
      dark: designTokens.colors.primary.dark,
      contrastText: designTokens.colors.primary.contrast
    },
    success: {
      main: designTokens.colors.success.main,
      light: designTokens.colors.success.light,
      dark: designTokens.colors.success.dark
    },
    error: {
      main: designTokens.colors.error.main,
      light: designTokens.colors.error.light,
      dark: designTokens.colors.error.dark
    },
    warning: {
      main: designTokens.colors.warning.main,
      light: designTokens.colors.warning.light,
      dark: designTokens.colors.warning.dark
    },
    info: {
      main: designTokens.colors.info.main,
      light: designTokens.colors.info.light,
      dark: designTokens.colors.info.dark
    },
    background: {
      default: designTokens.colors.background.default,
      paper: designTokens.colors.background.paper
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b' // Slate 500
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em'
    }
  },
  shape: {
    borderRadius: designTokens.borderRadius.md
  },
  shadows: [
    'none',
    designTokens.shadows.sm,
    designTokens.shadows.sm,
    designTokens.shadows.md,
    designTokens.shadows.md,
    designTokens.shadows.lg,
    designTokens.shadows.lg,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl,
    designTokens.shadows.xl
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.md,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: designTokens.shadows.md
          }
        },
        contained: {
          '&:hover': {
            boxShadow: designTokens.shadows.lg
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.sm,
          border: '1px solid rgba(148, 163, 184, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: designTokens.shadows.md
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.sm
        },
        elevation1: {
          boxShadow: designTokens.shadows.sm
        },
        elevation2: {
          boxShadow: designTokens.shadows.md
        },
        elevation3: {
          boxShadow: designTokens.shadows.lg
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designTokens.borderRadius.md,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: designTokens.colors.primary.light
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px'
              }
            }
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(148, 163, 184, 0.05)',
          color: '#64748b'
        }
      }
    }
  }
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8', // Lighter indigo for dark mode
      light: '#a5b4fc',
      dark: '#6366f1',
      contrastText: '#ffffff'
    },
    success: {
      main: '#34d399', // Lighter emerald
      light: '#6ee7b7',
      dark: '#10b981'
    },
    error: {
      main: '#f87171', // Lighter red
      light: '#fca5a5',
      dark: '#ef4444'
    },
    warning: {
      main: '#fbbf24', // Lighter amber
      light: '#fcd34d',
      dark: '#f59e0b'
    },
    info: {
      main: '#60a5fa', // Lighter blue
      light: '#93c5fd',
      dark: '#3b82f6'
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b' // Slate 800
    },
    text: {
      primary: '#f1f5f9', // Slate 100
      secondary: '#94a3b8' // Slate 400
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em'
    }
  },
  shape: {
    borderRadius: designTokens.borderRadius.md
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.md,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.3)'
        },
        elevation1: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.3)'
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designTokens.borderRadius.md,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#818cf8'
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px'
              }
            }
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          color: '#94a3b8'
        }
      }
    }
  }
};

// Create themes
export const modernTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
