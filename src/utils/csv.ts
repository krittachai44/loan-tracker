/**
 * CSV utility functions
 * Consolidated from duplicate implementations in DataExportImport and useCSVImport
 */

/**
 * Escape a string value for CSV format
 * Handles commas, quotes, and newlines by wrapping in quotes and escaping internal quotes
 * @param value String to escape
 * @returns Escaped string suitable for CSV
 */
export function escapeCSV(value: string): string {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Unescape a CSV value by removing wrapping quotes and unescaping internal quotes
 * @param str String to unescape
 * @returns Unescaped string
 */
export function unescapeCSV(str: string | undefined): string {
  if (!str) return '';
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1).replace(/""/g, '"');
  }
  return str;
}

/**
 * Parse a CSV line handling quoted values correctly
 * Handles commas within quotes and escaped quotes (double quotes)
 * @param line CSV line to parse
 * @returns Array of field values
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator outside quotes
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
