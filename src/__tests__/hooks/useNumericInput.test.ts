import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNumericInput } from '../../hooks/useNumericInput';

describe('useNumericInput', () => {
  describe('handleKeyDown', () => {
    it('allows numeric keys', () => {
      const { result } = renderHook(() => useNumericInput());
      const mockEvent = {
        key: '5',
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLElement>;

      // Should not throw or prevent default
      result.current.handleKeyDown(mockEvent);
    });

    it('allows navigation keys', () => {
      const { result } = renderHook(() => useNumericInput());
      const keys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

      keys.forEach(key => {
        const mockEvent = {
          key,
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLElement>;

        result.current.handleKeyDown(mockEvent);
      });
    });

    it('allows decimal point when allowDecimal is true', () => {
      const { result } = renderHook(() => useNumericInput({ allowDecimal: true }));
      const mockEvent = {
        key: '.',
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLElement>;

      result.current.handleKeyDown(mockEvent);
    });

    it('allows minus sign when allowNegative is true', () => {
      const { result } = renderHook(() => useNumericInput({ allowNegative: true }));
      const mockEvent = {
        key: '-',
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLElement>;

      result.current.handleKeyDown(mockEvent);
    });

    it('prevents non-numeric keys', () => {
      const { result } = renderHook(() => useNumericInput());
      let preventDefaultCalled = false;

      const mockEvent = {
        key: 'a',
        preventDefault: () => { preventDefaultCalled = true; },
      } as React.KeyboardEvent<HTMLElement>;

      result.current.handleKeyDown(mockEvent);
      expect(preventDefaultCalled).toBe(true);
    });

    it('allows Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X', () => {
      const { result } = renderHook(() => useNumericInput());
      const keys = ['a', 'c', 'v', 'x'];

      keys.forEach(key => {
        let preventDefaultCalled = false;
        const mockEvent = {
          key,
          ctrlKey: true,
          preventDefault: () => { preventDefaultCalled = true; },
        } as React.KeyboardEvent<HTMLElement>;

        result.current.handleKeyDown(mockEvent);
        expect(preventDefaultCalled).toBe(false);
      });
    });
  });

  describe('handlePaste', () => {
    it('filters non-numeric characters', () => {
      const { result } = renderHook(() => useNumericInput());
      let newValue = '';
      const setValue = (val: string) => { newValue = val; };

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => 'abc123def456',
        },
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      result.current.handlePaste(mockEvent, '', setValue);
      expect(newValue).toBe('123456');
    });

    it('preserves decimal point when allowDecimal is true', () => {
      const { result } = renderHook(() => useNumericInput({ allowDecimal: true }));
      let newValue = '';
      const setValue = (val: string) => { newValue = val; };

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => '12.34',
        },
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      result.current.handlePaste(mockEvent, '', setValue);
      expect(newValue).toBe('12.34');
    });

    it('preserves minus sign when allowNegative is true', () => {
      const { result } = renderHook(() => useNumericInput({ allowNegative: true }));
      let newValue = '';
      const setValue = (val: string) => { newValue = val; };

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => '-123',
        },
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      result.current.handlePaste(mockEvent, '', setValue);
      expect(newValue).toBe('-123');
    });

    it('inserts pasted text at cursor position', () => {
      const { result } = renderHook(() => useNumericInput());
      let newValue = '';
      const setValue = (val: string) => { newValue = val; };

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => '999',
        },
        target: {
          selectionStart: 2,
          selectionEnd: 2,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      result.current.handlePaste(mockEvent, '1234', setValue);
      expect(newValue).toBe('1299934');
    });

    it('replaces selected text with pasted text', () => {
      const { result } = renderHook(() => useNumericInput());
      let newValue = '';
      const setValue = (val: string) => { newValue = val; };

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => '999',
        },
        target: {
          selectionStart: 1,
          selectionEnd: 3,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      result.current.handlePaste(mockEvent, '1234', setValue);
      expect(newValue).toBe('19994');
    });
  });

  describe('options', () => {
    it('respects allowDecimal option', () => {
      const { result: withDecimal } = renderHook(() => useNumericInput({ allowDecimal: true }));
      const { result: withoutDecimal } = renderHook(() => useNumericInput({ allowDecimal: false }));

      let newValue1 = '';
      let newValue2 = '';

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => '12.34',
        },
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      withDecimal.current.handlePaste(mockEvent, '', (val) => { newValue1 = val; });
      withoutDecimal.current.handlePaste(mockEvent, '', (val) => { newValue2 = val; });

      expect(newValue1).toBe('12.34');
      expect(newValue2).toBe('1234');
    });

    it('respects allowNegative option', () => {
      const { result: withNegative } = renderHook(() => useNumericInput({ allowNegative: true }));
      const { result: withoutNegative } = renderHook(() => useNumericInput({ allowNegative: false }));

      let newValue1 = '';
      let newValue2 = '';

      const mockEvent = {
        preventDefault: () => {},
        clipboardData: {
          getData: () => '-123',
        },
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      } as unknown as React.ClipboardEvent<HTMLElement>;

      withNegative.current.handlePaste(mockEvent, '', (val) => { newValue1 = val; });
      withoutNegative.current.handlePaste(mockEvent, '', (val) => { newValue2 = val; });

      expect(newValue1).toBe('-123');
      expect(newValue2).toBe('123');
    });
  });
});
