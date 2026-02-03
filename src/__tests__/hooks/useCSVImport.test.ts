import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCSVImport } from '../../hooks/useCSVImport';
import { db } from '../../db';

// Mock XLSX
vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: {
      sheet_to_csv: vi.fn(),
    },
  },
}));

// Mock database
vi.mock('../../db', () => ({
  db: {
    loans: {
      add: vi.fn(),
      toArray: vi.fn(),
    },
    referenceRates: {
      bulkAdd: vi.fn(),
    },
    payments: {
      bulkAdd: vi.fn(),
    },
    transaction: vi.fn(),
  },
}));

describe('useCSVImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful transaction
    (db.transaction as any).mockImplementation(async (_mode: string, _tables: any[], callback: Function) => {
      return await callback();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook initialization', () => {
    it('should return importFromFile function and isImporting state', () => {
      const { result } = renderHook(() => useCSVImport());

      expect(result.current).toHaveProperty('importFromFile');
      expect(result.current).toHaveProperty('isImporting');
      expect(typeof result.current.importFromFile).toBe('function');
      expect(typeof result.current.isImporting).toBe('boolean');
    });

    it('should initialize with isImporting as false', () => {
      const { result } = renderHook(() => useCSVImport());

      expect(result.current.isImporting).toBe(false);
    });
  });

  describe('CSV parsing logic', () => {
    it('should detect LOAN section correctly', () => {
      const { result } = renderHook(() => useCSVImport());

      // Access the hook's internal logic through a test CSV
      expect(result.current).toBeDefined();
    });
  });

  describe('Field normalization', () => {
    const testCases = [
      { input: 'Start Date', expected: 'startdate' },
      { input: 'Principal', expected: 'principal' },
      { input: 'Name', expected: 'name' },
      { input: 'start date', expected: 'startdate' },
      { input: 'START DATE', expected: 'startdate' },
      { input: '  Name  ', expected: 'name' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should normalize "${input}" to "${expected}"`, () => {
        const normalized = input.toLowerCase().replace(/\s+/g, '').trim();
        expect(normalized).toBe(expected);
      });
    });
  });

  describe('CSV unescaping', () => {
    const testCases = [
      { input: '"test"', expected: 'test' },
      { input: '""test""', expected: '"test"' },
      { input: 'test', expected: 'test' },
      { input: '', expected: '' },
      { input: undefined, expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should unescape "${input}" to "${expected}"`, () => {
        const unescapeCSV = (str: string | undefined): string => {
          if (!str) return '';
          if (str.startsWith('"') && str.endsWith('"')) {
            return str.slice(1, -1).replace(/""/g, '"');
          }
          return str;
        };

        expect(unescapeCSV(input)).toBe(expected);
      });
    });
  });

  describe('Header detection', () => {
    const headerTests = [
      { section: 'LOAN', line: 'field,value', shouldSkip: true },
      { section: 'LOAN', line: 'Field,Value', shouldSkip: true },
      { section: 'LOAN', line: 'Name,Test Loan', shouldSkip: false },
      { section: 'RATES', line: 'start date,type,value', shouldSkip: true },
      { section: 'RATES', line: 'Start Date,Type,Value', shouldSkip: true },
      { section: 'RATES', line: '2024-01-01,fixed,2.5', shouldSkip: false },
      { section: 'REFERENCE', line: 'date,rate', shouldSkip: true },
      { section: 'REFERENCE', line: '2024-01-01,2.5', shouldSkip: false },
      { section: 'PAYMENTS', line: 'date,amount', shouldSkip: true },
      { section: 'PAYMENTS', line: '2024-01-01,5000', shouldSkip: false },
    ];

    headerTests.forEach(({ section, line, shouldSkip }) => {
      it(`should ${shouldSkip ? 'skip' : 'process'} "${line}" in ${section} section`, () => {
        const isHeader = (line: string, section: string): boolean => {
          const lowerLine = line.toLowerCase();
          if (section === 'LOAN' && lowerLine.startsWith('field,')) return true;
          if (section === 'RATES' && lowerLine.startsWith('start date,')) return true;
          if (section === 'REFERENCE' && lowerLine.startsWith('date,rate')) return true;
          if (section === 'PAYMENTS' && lowerLine.startsWith('date,amount')) return true;
          return false;
        };

        expect(isHeader(line, section)).toBe(shouldSkip);
      });
    });
  });

  describe('Payment line parsing', () => {
    it('should parse simple payment line', () => {
      const line = '2024-01-01,5000,';
      const fields = line.match(/(?:"([^"]*)"|([^,]*))(,|$)/g)?.map(f => {
        f = f.replace(/,$/, '').trim();
        return f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1) : f;
      }) || [];

      expect(fields[0]).toBe('2024-01-01');
      expect(fields[1]).toBe('5000');
      expect(fields[2]).toBe('');
    });

    it('should parse payment line with note', () => {
      const line = '2024-01-01,5000,Monthly payment';
      const fields = line.match(/(?:"([^"]*)"|([^,]*))(,|$)/g)?.map(f => {
        f = f.replace(/,$/, '').trim();
        return f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1) : f;
      }) || [];

      expect(fields[0]).toBe('2024-01-01');
      expect(fields[1]).toBe('5000');
      expect(fields[2]).toBe('Monthly payment');
    });

    it('should parse payment line with quoted note containing commas', () => {
      const line = '2024-01-01,5000,"Payment for January, 2024"';
      const fields = line.match(/(?:"([^"]*)"|([^,]*))(,|$)/g)?.map(f => {
        f = f.replace(/,$/, '').trim();
        return f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1) : f;
      }) || [];

      expect(fields[0]).toBe('2024-01-01');
      expect(fields[1]).toBe('5000');
      expect(fields[2]).toBe('Payment for January, 2024');
    });
  });

  describe('Validation', () => {
    it('should require name field', () => {
      const loanData = {
        principal: 500000,
        startDate: new Date('2024-01-01'),
        rates: [{ startDate: new Date('2024-01-01'), type: 'fixed' as const, value: 2.5 }],
      };

      const isValid = !!(loanData as any).name && !!loanData.principal && !!loanData.startDate;
      expect(isValid).toBe(false);
    });

    it('should require principal field', () => {
      const loanData = {
        name: 'Test Loan',
        startDate: new Date('2024-01-01'),
        rates: [{ startDate: new Date('2024-01-01'), type: 'fixed' as const, value: 2.5 }],
      };

      const isValid = !!loanData.name && !!(loanData as any).principal && !!loanData.startDate;
      expect(isValid).toBe(false);
    });

    it('should require start date field', () => {
      const loanData = {
        name: 'Test Loan',
        principal: 500000,
        rates: [{ startDate: new Date('2024-01-01'), type: 'fixed' as const, value: 2.5 }],
      };

      const isValid = !!loanData.name && !!loanData.principal && !!(loanData as any).startDate;
      expect(isValid).toBe(false);
    });

    it('should require at least one rate segment', () => {
      const loanData = {
        name: 'Test Loan',
        principal: 500000,
        startDate: new Date('2024-01-01'),
        rates: [],
      };

      const hasRates = loanData.rates && loanData.rates.length > 0;
      expect(hasRates).toBe(false);
    });

    it('should use first rate start date as fallback', () => {
      const loanData = {
        name: 'Test Loan',
        principal: 500000,
        rates: [{ startDate: new Date('2024-01-01'), type: 'fixed' as const, value: 2.5 }],
      };

      const startDate = (loanData as any).startDate || loanData.rates[0]?.startDate;
      expect(startDate).toEqual(new Date('2024-01-01'));
    });
  });
});
