import { useState, useCallback } from 'react';
import { formatNumberInput, parseFormattedNumber } from '../utils';

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
 * Custom hook for handling formatted number inputs with validation
 */
export const useNumberInput = (options: UseNumberInputOptions = {}): UseNumberInputReturn => {
  const { min, max, initialValue = '' } = options;
  const [value, setValue] = useState(() => 
    typeof initialValue === 'number' ? initialValue.toString() : initialValue
  );

  const numericValue = parseFloat(parseFormattedNumber(value)) || 0;

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

  const setNumericValue = useCallback((num: number) => {
    setValue(formatNumberInput(num.toString()));
  }, []);

  const reset = useCallback(() => {
    setValue(typeof initialValue === 'number' ? initialValue.toString() : initialValue);
  }, [initialValue]);

  return {
    value,
    numericValue,
    setValue: (val: string) => setValue(formatNumberInput(val)),
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
