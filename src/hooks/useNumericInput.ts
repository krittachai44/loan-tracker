import * as React from 'react';

export interface UseNumericInputOptions {
  /**
   * Allow negative numbers (minus sign)
   * @default false
   */
  allowNegative?: boolean;
  
  /**
   * Allow decimal point
   * @default true
   */
  allowDecimal?: boolean;
  
  /**
   * Custom regex pattern for allowed characters
   * If provided, this overrides allowNegative and allowDecimal
   */
  pattern?: RegExp;
}

export interface UseNumericInputReturn {
  /**
   * Handler for keyDown event to prevent non-numeric input
   */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  
  /**
   * Handler for paste event to filter non-numeric characters
   */
  handlePaste: (
    e: React.ClipboardEvent<HTMLElement>,
    currentValue: string,
    setValue: (value: string) => void
  ) => void;
}

/**
 * Custom hook for numeric input validation
 * 
 * Provides keyDown and paste handlers that:
 * - Allow navigation keys (arrows, home, end, tab, etc.)
 * - Allow editing keys (backspace, delete, escape, enter)
 * - Allow common shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X)
 * - Allow decimal point (optional)
 * - Allow minus sign (optional)
 * - Block all other non-numeric characters
 * 
 * @example
 * ```tsx
 * const { handleKeyDown, handlePaste } = useNumericInput({ allowNegative: true });
 * const [value, setValue] = useState('');
 * 
 * <Input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   onKeyDown={handleKeyDown}
 *   onPaste={(e) => handlePaste(e, value, setValue)}
 * />
 * ```
 */
export function useNumericInput(options: UseNumericInputOptions = {}): UseNumericInputReturn {
  const {
    allowNegative = false,
    allowDecimal = true,
    pattern
  } = options;

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    // Build allowed special characters
    const specialChars = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];
    if (allowDecimal) specialChars.push('.');
    if (allowNegative) specialChars.push('-');

    // Allow special characters
    if (specialChars.includes(e.key)) {
      return;
    }

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }

    // Allow: arrow keys, home, end
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      return;
    }

    // Prevent if not a number
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }, [allowDecimal, allowNegative]);

  const handlePaste = React.useCallback((
    e: React.ClipboardEvent<HTMLElement>,
    currentValue: string,
    setValue: (value: string) => void
  ) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text');
    const target = e.target as HTMLInputElement;
    const selectionStart = target.selectionStart || 0;
    const selectionEnd = target.selectionEnd || 0;

    // Build regex pattern for filtering
    let filterPattern: RegExp;
    if (pattern) {
      filterPattern = pattern;
    } else {
      const chars = ['0-9'];
      if (allowDecimal) chars.push('.');
      if (allowNegative) chars.push('-');
      filterPattern = new RegExp(`[^${chars.join('')}]`, 'g');
    }

    // Filter pasted text
    const numericOnly = pastedText.replace(filterPattern, '');
    
    // Insert filtered text at cursor position
    const newValue = 
      currentValue.slice(0, selectionStart) + 
      numericOnly + 
      currentValue.slice(selectionEnd);
    
    setValue(newValue);
  }, [allowDecimal, allowNegative, pattern]);

  return {
    handleKeyDown,
    handlePaste
  };
}
