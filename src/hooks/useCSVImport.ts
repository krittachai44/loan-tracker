import { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../db';
import type { Loan, ReferenceRate, Payment } from '../types';
import { CSV_SECTIONS, CSV_SECTION_HEADERS, CSV_FIELD_HEADERS, LOAN_FIELDS } from '../constants/csv';

interface ImportResult {
  success: boolean;
  error?: string;
}

export const useCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);

  const parseCSVLine = (line: string): string[] => {
    return line.split(',').map(f => f.trim());
  };

  const normalizeFieldName = (field: string | undefined): string => {
    return field?.toLowerCase().replace(/\s+/g, '') || '';
  };

  const unescapeCSV = (str: string | undefined): string => {
    if (!str) return '';
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1).replace(/""/g, '"');
    }
    return str;
  };

  const detectSection = (line: string): keyof typeof CSV_SECTIONS | null => {
    if (line.includes(CSV_SECTION_HEADERS.LOAN)) return CSV_SECTIONS.LOAN;
    if (line.includes(CSV_SECTION_HEADERS.RATES)) return CSV_SECTIONS.RATES;
    if (line.includes(CSV_SECTION_HEADERS.REFERENCE)) return CSV_SECTIONS.REFERENCE;
    if (line.includes(CSV_SECTION_HEADERS.PAYMENTS)) return CSV_SECTIONS.PAYMENTS;
    return null;
  };

  const isHeaderLine = (line: string, section: string | null): boolean => {
    const lowerLine = line.toLowerCase();
    
    if (section === CSV_SECTIONS.LOAN && lowerLine.startsWith(CSV_FIELD_HEADERS.LOAN)) return true;
    if (section === CSV_SECTIONS.RATES && lowerLine.startsWith(CSV_FIELD_HEADERS.RATES)) return true;
    if (section === CSV_SECTIONS.REFERENCE && lowerLine.startsWith(CSV_FIELD_HEADERS.REFERENCE)) return true;
    if (section === CSV_SECTIONS.PAYMENTS && lowerLine.startsWith(CSV_FIELD_HEADERS.PAYMENTS)) return true;
    
    return false;
  };

  const parsePaymentLine = (line: string) => {
    const fields = line.match(/(?:"([^"]*)"|([^,]*))(,|$)/g)?.map(f => {
      f = f.replace(/,$/, '').trim();
      return f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1) : f;
    }) || [];
    
    return {
      date: fields[0],
      amount: fields[1],
      note: fields[2],
    };
  };

  const parseCSVContent = async (csvContent: string): Promise<void> => {
    console.log('Starting CSV parse...');
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    console.log('Total lines:', lines.length);
    
    let section: string | null = null;
    const loanData: Partial<Loan> = { rates: [] };
    const referenceRates: Omit<ReferenceRate, 'id'>[] = [];
    const payments: Omit<Payment, 'id'>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect section headers
      if (line.startsWith('#')) {
        section = detectSection(line);
        console.log('Section changed to:', section);
        continue;
      }

      // Skip header rows
      if (isHeaderLine(line, section)) {
        console.log('Skipping header line:', line);
        continue;
      }

      // Skip empty lines
      if (!line || line.replace(/,/g, '').trim() === '') {
        continue;
      }

      const [field1, field2, field3] = parseCSVLine(line);
      const normalizedField = normalizeFieldName(field1);

      // Parse LOAN section
      if (section === CSV_SECTIONS.LOAN) {
        console.log('LOAN section - raw field:', field1, 'normalized:', normalizedField, 'value:', field2);
        
        if (normalizedField === LOAN_FIELDS.NAME && field2) {
          loanData.name = unescapeCSV(field2);
          console.log('✓ Parsed name:', loanData.name);
        } else if (normalizedField === LOAN_FIELDS.PRINCIPAL && field2) {
          loanData.principal = parseFloat(field2);
          console.log('✓ Parsed principal:', loanData.principal);
        } else if ((normalizedField === LOAN_FIELDS.START_DATE || normalizedField === LOAN_FIELDS.DATE) && field2) {
          loanData.startDate = new Date(field2);
          console.log('✓ Parsed start date:', loanData.startDate);
        }
      }
      // Parse RATES section
      else if (section === CSV_SECTIONS.RATES && field1 && field2 && field3) {
        const rate = {
          startDate: new Date(field1),
          type: field2 as 'fixed' | 'float',
          value: parseFloat(field3),
        };
        loanData.rates?.push(rate);
        console.log('Parsed rate:', rate);
      }
      // Parse REFERENCE section
      else if (section === CSV_SECTIONS.REFERENCE && field1 && field2) {
        const refRate = {
          date: new Date(field1),
          rate: parseFloat(field2),
        };
        referenceRates.push(refRate);
        console.log('Parsed reference rate:', refRate);
      }
      // Parse PAYMENTS section
      else if (section === CSV_SECTIONS.PAYMENTS && field1 && field2) {
        const { date, amount, note } = parsePaymentLine(line);
        
        if (date && amount) {
          const payment = {
            loanId: 0,
            date: new Date(date),
            amount: parseFloat(amount),
            note: note || undefined,
          };
          payments.push(payment);
          console.log('Parsed payment:', payment);
        }
      }
    }

    console.log('Final loan data:', loanData);
    console.log('Reference rates count:', referenceRates.length);
    console.log('Payments count:', payments.length);

    // Fallback: use first rate's start date if loan start date is missing
    if (!loanData.startDate && loanData.rates && loanData.rates.length > 0) {
      loanData.startDate = loanData.rates[0].startDate;
      console.log('Using first rate start date as loan start date:', loanData.startDate);
    }

    // Validate required fields
    if (!loanData.name || !loanData.principal || !loanData.startDate) {
      const missing = [];
      if (!loanData.name) missing.push('Name');
      if (!loanData.principal) missing.push('Principal');
      if (!loanData.startDate) missing.push('Start Date');
      
      console.error('Validation failed! Loan data:', loanData);
      console.error('Missing fields:', missing);
      throw new Error(`Invalid CSV format: Missing required fields: ${missing.join(', ')}`);
    }

    if (!loanData.rates || loanData.rates.length === 0) {
      throw new Error('Invalid CSV format: At least one rate segment is required');
    }

    // Save to database
    console.log('Starting database transaction...');
    await db.transaction('rw', [db.loans, db.referenceRates, db.payments], async () => {
      const loanId = await db.loans.add(loanData as Loan) as number;
      console.log('Loan added with ID:', loanId);
      
      if (referenceRates.length > 0) {
        await db.referenceRates.bulkAdd(referenceRates);
        console.log('Reference rates added');
      }
      
      if (payments.length > 0) {
        const paymentsWithLoanId = payments.map(p => ({ ...p, loanId }));
        await db.payments.bulkAdd(paymentsWithLoanId);
        console.log('Payments added');
      }
    });
    console.log('Database transaction complete');
  };

  const importFromFile = async (file: File): Promise<ImportResult> => {
    setIsImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      
      console.log('Parsed CSV data:', csvData);
      
      await parseCSVContent(csvData);
      
      // Verify data was saved
      const savedLoans = await db.loans.toArray();
      console.log('Loans after import:', savedLoans);
      
      if (savedLoans.length === 0) {
        throw new Error('Data was not saved to database');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import data',
      };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFromFile,
    isImporting,
  };
};
