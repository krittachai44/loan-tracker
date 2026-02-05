/**
 * Constants for loan prediction and calculation algorithms
 */

export const PREDICTION = {
  /** Maximum iterations for loan payoff predictions (50 years of monthly payments) */
  MAX_ITERATIONS: 600,
  
  /** Coefficient of variation threshold for high payment variability (30%) */
  HIGH_VARIATION_THRESHOLD: 0.3,
  
  /** Minimum number of payments required for any prediction confidence */
  MIN_CONFIDENCE_PAYMENTS: 3,
  
  /** Number of payments needed for high confidence predictions (12 months) */
  HIGH_CONFIDENCE_PAYMENTS: 12,
  
  /** Number of payments needed for medium confidence predictions (6 months) */
  MEDIUM_CONFIDENCE_PAYMENTS: 6
} as const;

export const INTEREST_CALCULATION = {
  /** Days in a standard year for interest calculations */
  DAYS_PER_YEAR: 365
} as const;
