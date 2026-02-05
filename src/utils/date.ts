/**
 * Date utility functions
 * Consolidated from 29+ duplicate occurrences across the codebase
 */

/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 * @param date Date object to convert
 * @returns ISO date string without time component
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get current date as ISO string (YYYY-MM-DD)
 * @returns Current date in ISO format
 */
export function getCurrentISODate(): string {
  return toISODate(new Date());
}

/**
 * Check if a value is a valid date
 * @param d Date, string, number, or nullish value
 * @returns true if the value represents a valid date
 */
export function isValidDate(d: Date | string | number | null | undefined): boolean {
  if (!d) return false;
  const date = d instanceof Date ? d : new Date(d);
  return !isNaN(date.getTime());
}

/**
 * Ensure a value is a valid Date object, throw if invalid
 * @param d Date, string, or number
 * @returns Valid Date object
 * @throws Error if date is invalid
 */
export function ensureValidDate(d: Date | string | number): Date {
  if (!d) {
    throw new Error(`Invalid date value: ${d}`);
  }
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${d}`);
  }
  return date;
}

/**
 * Format date for CSV export (ISO format)
 * @param d Date to format
 * @returns ISO date string
 */
export function formatDateForCSV(d: Date | string | number): string {
  return toISODate(ensureValidDate(d));
}

/**
 * Get time value safely from a date
 * @param d Date to get time from
 * @returns Time in milliseconds
 */
export function getTime(d: Date | string | number): number {
  return ensureValidDate(d).getTime();
}

/**
 * Format date for display (DD/MM/YYYY)
 * @param d Date or ISO string
 * @returns Date string in DD/MM/YYYY format
 */
export function formatDateForDisplay(d: Date | string): string {
  if (!d) return '';
  
  // Handle ISO strings directly
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [year, month, day] = d.split('-');
    return `${day}/${month}/${year}`;
  }

  // Handle Date objects or other strings
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return typeof d === 'string' ? d : '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Convert DD/MM/YYYY format to ISO date (YYYY-MM-DD)
 */
export function parseDateFromInput(dateStr: string): string {
  if (!dateStr) return '';
  
  const cleaned = dateStr.replace(/\//g, '');
  
  // Early return if user hasn't finished typing
  if (cleaned.length < 8) return dateStr;
  
  const day = cleaned.substring(0, 2);
  const month = cleaned.substring(2, 4);
  const year = cleaned.substring(4, 8);
  
  // Validate format
  if (!/^\d{2}$/.test(day) || !/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) {
    return dateStr;
  }
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  
  // Validate ranges
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
    return dateStr;
  }
  
  return `${year}-${month}-${day}`;
}

/**
 * Format date input as user types (DD/MM/YYYY)
 */
export function formatDateInput(value: string): string {
  const digitsOnly = value.replace(/[^\d]/g, '');
  
  // Early returns for shorter inputs
  if (digitsOnly.length === 0) return '';
  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 4) return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2)}`;
  
  return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}/${digitsOnly.substring(4, 8)}`;
}
