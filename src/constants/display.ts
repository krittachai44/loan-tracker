/**
 * Display-related constants for UI components
 */

export const TABLE_CONFIG = {
  /** Maximum number of visible rows in scrollable tables */
  MAX_VISIBLE_ROWS: 20,
  /** Height of each table row in pixels */
  ROW_HEIGHT_PX: 53,
  /** Calculated max height for tables (MAX_VISIBLE_ROWS * ROW_HEIGHT_PX) */
  get MAX_HEIGHT() {
    return `calc(${this.MAX_VISIBLE_ROWS} * ${this.ROW_HEIGHT_PX}px)`;
  }
} as const;

export const SIDEBAR = {
  /** Width of the sidebar in pixels */
  WIDTH_PX: 280
} as const;
