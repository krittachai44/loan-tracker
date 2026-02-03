import { useState } from 'react';

interface UseNumberInputOptions {
  min?: number;
  max?: number;
  initialValue?: string | number;
  allowNegative?: boolean;
}

interface UseNumberInputReturn {
  value: string;
  numericValue: number;
  setValue: (value: string) => void;
  setNumericValue: (value: number) => void;
  reset: () => void;
  isValid: boolean;
  error?: string;
}

/**
 * Custom hook for handling number inputs with validation
 * Only allows numbers and one decimal point
 */
export const useNumberInput = (options: UseNumberInputOptions = {}): UseNumberInputReturn => {
  const { min, max, initialValue = '', allowNegative = false } = options;
  const [value, setValue] = useState(() =>
    typeof initialValue === 'number' ? initialValue.toString() : initialValue
  );

  const numericValue = parseFloat(value) || 0;

  const isValid =
    (!min || numericValue >= min) &&
    (!max || numericValue <= max) &&
    !isNaN(numericValue);

  let error: string | undefined;
  if (value && !isValid) {
    if (min !== undefined && numericValue < min) {
      error = `Value must be at least ${min}`;
    } else if (max !== undefined && numericValue > max) {
      error = `Value must be at most ${max}`;
    }
  }

  const handleSetValue = (val: string) => {
    // Remove any character that's not a digit, decimal point, or minus (if allowed)
    const pattern = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
    const cleaned = val.replace(pattern, '');

    // Handle negative sign - only allow at the start
    let processed = cleaned;
    if (allowNegative) {
      const minusCount = (cleaned.match(/-/g) || []).length;
      if (minusCount > 0) {
        const hasLeadingMinus = cleaned.startsWith('-');
        processed = cleaned.replace(/-/g, '');
        if (hasLeadingMinus) {
          processed = '-' + processed;
        }
      }
    }

    // Ensure only one decimal point
    const parts = processed.split('.');
    const sanitized = parts.length > 2
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : processed;

    setValue(sanitized);
  };

  const setNumericValue = (num: number) => {
    setValue(num.toString());
  };

  const reset = () => {
    setValue(typeof initialValue === 'number' ? initialValue.toString() : initialValue);
  };

  return {
    value,
    numericValue,
    setValue: handleSetValue,
    setNumericValue,
    reset,
    isValid,
    error,
  };
};

interface UseDateInputReturn {
  isoDate: string;
  dateValue: Date;
  setIsoDate: (date: string) => void;
  setDateValue: (date: Date) => void;
  reset: () => void;
}

/**
 * Custom hook for handling date inputs
 */
export const useDateInput = (initialDate?: Date): UseDateInputReturn => {
  const [isoDate, setIsoDate] = useState(() =>
    initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );

  const setDateValue = (date: Date) => {
    setIsoDate(date.toISOString().split('T')[0]);
  };

  const reset = () => {
    const defaultDate = initialDate || new Date();
    setIsoDate(defaultDate.toISOString().split('T')[0]);
  };

  const dateValue = new Date(isoDate);

  return {
    isoDate,
    dateValue,
    setIsoDate,
    setDateValue,
    reset,
  };
};
