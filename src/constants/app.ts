/**
 * Application-wide constants
 */

// Theme
export const THEME_VERSION = 'v1';
export const THEME_STORAGE_KEY = `themeMode:${THEME_VERSION}`;
export const DEFAULT_THEME = 'dark' as const;

// Date formats
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
export const DAYS_IN_YEAR = 365;

// Number formatting
export const DECIMAL_SEPARATOR = '.';
export const THOUSANDS_SEPARATOR = ',';
export const MAX_DECIMAL_PLACES = 2;

// Database
export const DB_NAME = 'LoanDatabase';
export const DB_VERSION = 1;

// CSV Export
export const CSV_ENCODING = 'text/csv;charset=utf-8;';
export const EXCEL_EXTENSIONS = ['.xlsx', '.xls'] as const;

// Keyboard shortcuts
export const ALLOWED_NUMBER_KEYS = [
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  '.',
] as const;

export const ALLOWED_CTRL_KEYS = ['a', 'c', 'v', 'x'] as const;

export const ALLOWED_NAVIGATION_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
] as const;

// Loading messages
export const LOADING_MESSAGES = {
  LOAN_DATA: 'Loading your loan data...',
  IMPORTING: 'Importing data...',
  EXPORTING: 'Exporting data...',
  CALCULATING: 'Calculating...',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  EXPORT_FAILED: 'Failed to export data. Please try again.',
  IMPORT_FAILED: 'Failed to import data. Please check the file format.',
  CALCULATION_FAILED: 'Failed to calculate loan data.',
  DB_ERROR: 'Database error occurred.',
} as const;

// Validation
export const VALIDATION = {
  MIN_PRINCIPAL: 0,
  MAX_PRINCIPAL: 999999999999,
  MIN_RATE: -100,
  MAX_RATE: 100,
  MIN_PAYMENT: 0,
} as const;
