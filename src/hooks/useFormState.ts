import { useState, useCallback } from 'react';

interface UseNumberInputOptions {
  min?: number;
  max?: number;
  initialValue?: string | number;
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
  const { min, max, initialValue = '' } = options;
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

  const handleSetValue = useCallback((val: string) => {
    // Remove any character that's not a digit or decimal point
    const cleaned = val.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    const sanitized = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}` 
      : cleaned;
    
    setValue(sanitized);
  }, []);

  const setNumericValue = useCallback((num: number) => {
    setValue(num.toString());
  }, []);

  const reset = useCallback(() => {
    setValue(typeof initialValue === 'number' ? initialValue.toString() : initialValue);
  }, [initialValue]);

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

  const setDateValue = useCallback((date: Date) => {
    setIsoDate(date.toISOString().split('T')[0]);
  }, []);

  const reset = useCallback(() => {
    const defaultDate = initialDate || new Date();
    setIsoDate(defaultDate.toISOString().split('T')[0]);
  }, [initialDate]);

  const dateValue = new Date(isoDate);

  return {
    isoDate,
    dateValue,
    setIsoDate,
    setDateValue,
    reset,
  };
};
