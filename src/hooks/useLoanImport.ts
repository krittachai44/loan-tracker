import { useState, useCallback } from 'react';
import { db } from '../db';
import type { Loan, Payment, ReferenceRate } from '../types';
import { parseCSVLine } from '../utils/csv';
import { isValidDate } from '../utils/date';
import { useSnackbar } from './useSnackbar';

export interface ImportStatus {
  message: string;
  isImporting: boolean;
}

export const useLoanImport = () => {
  const [status, setStatus] = useState<ImportStatus>({ message: '', isImporting: false });
  const { showSuccess, showError } = useSnackbar();

  const setImportMessage = (msg: string) => setStatus({ message: msg, isImporting: !!msg });

  const importFromFile = useCallback(async (file: File) => {
    try {
      setImportMessage('Reading file...');

      const loanData: Partial<Loan> = { rates: [] };
      const paymentsData: Omit<Payment, 'id' | 'loanId'>[] = [];
      const referenceRatesData: Omit<ReferenceRate, 'id'>[] = [];

      // Check file extension
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      if (isExcel) {
        // Lazy load XLSX library only when needed
        const XLSX = await import('xlsx');
        
        // Parse Excel file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Read Loan Details sheet
        const loanSheet = workbook.Sheets['Loan Details'];
        if (loanSheet) {
          const loanRows = XLSX.utils.sheet_to_json<string[]>(loanSheet, { header: 1 });
          for (let i = 1; i < loanRows.length; i++) {
            const [field, value] = loanRows[i];
            if (field === 'Name') loanData.name = String(value);
            else if (field === 'Principal') loanData.principal = Number(value);
            else if (field === 'Start Date') loanData.startDate = new Date(value);
          }
        }

        // Read Rate Segments sheet
        const ratesSheet = workbook.Sheets['Rate Segments'];
        if (ratesSheet) {
          const ratesRows = XLSX.utils.sheet_to_json<string[]>(ratesSheet, { header: 1 });
          for (let i = 1; i < ratesRows.length; i++) {
            const [startDate, type, value] = ratesRows[i];
            if (startDate && type && value) {
              loanData.rates!.push({
                startDate: new Date(startDate),
                type: type as 'fixed' | 'float',
                value: Number(value)
              });
            }
          }
        }

        // Read Reference Rates sheet
        const refRatesSheet = workbook.Sheets['Reference Rates'];
        if (refRatesSheet) {
          const refRatesRows = XLSX.utils.sheet_to_json<string[]>(refRatesSheet, { header: 1 });
          for (let i = 1; i < refRatesRows.length; i++) {
            const [date, rate] = refRatesRows[i];
            if (date && rate) {
              referenceRatesData.push({
                date: new Date(date),
                rate: Number(rate)
              });
            }
          }
        }

        // Read Payment History sheet
        const paymentsSheet = workbook.Sheets['Payment History'];
        if (paymentsSheet) {
          const paymentsRows = XLSX.utils.sheet_to_json<string[]>(paymentsSheet, { header: 1 });
          for (let i = 1; i < paymentsRows.length; i++) {
            const [date, amount, note] = paymentsRows[i];
            if (date && amount) {
              paymentsData.push({
                date: new Date(date),
                amount: Number(amount),
                note: note ? String(note) : undefined
              });
            }
          }
        }
      } else {
        // Parse CSV file (backward compatibility)
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);

        let section = '';
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip empty lines
          if (!line) continue;

          // Detect sections
          if (line.startsWith('# LOAN DETAILS')) {
            section = 'loan';
            continue;
          } else if (line.startsWith('# RATE SEGMENTS')) {
            section = 'rates';
            continue;
          } else if (line.startsWith('# REFERENCE RATES')) {
            section = 'referenceRates';
            continue;
          } else if (line.startsWith('# PAYMENT HISTORY')) {
            section = 'payments';
            continue;
          }

          // Skip header rows
          if (line === 'Field,Value' || line === 'Start Date,Type,Value' || line === 'Date,Rate' || line === 'Date,Amount,Note') {
            continue;
          }

          // Parse data based on section
          if (section === 'loan') {
            const [field, ...valueParts] = parseCSVLine(line);
            const value = valueParts.join(',');

            if (field === 'Name') {
              loanData.name = value;
            } else if (field === 'Principal') {
              loanData.principal = parseFloat(value);
            } else if (field === 'Start Date') {
              loanData.startDate = new Date(value);
            }
          } else if (section === 'rates') {
            const [startDate, type, value] = parseCSVLine(line);
            if (startDate && type && value) {
              loanData.rates!.push({
                startDate: new Date(startDate),
                type: type as 'fixed' | 'float',
                value: parseFloat(value)
              });
            }
          } else if (section === 'referenceRates') {
            const [date, rate] = parseCSVLine(line);
            if (date && rate) {
              referenceRatesData.push({
                date: new Date(date),
                rate: parseFloat(rate)
              });
            }
          } else if (section === 'payments') {
            const [date, amount, ...noteParts] = parseCSVLine(line);
            if (date && amount) {
              paymentsData.push({
                date: new Date(date),
                amount: parseFloat(amount),
                note: noteParts.length > 0 ? noteParts.join(',') : undefined
              });
            }
          }
        }
      }

      // Validate loan data
      if (!loanData.name || !loanData.principal || !loanData.startDate || !isValidDate(loanData.startDate) || !loanData.rates || loanData.rates.length === 0) {
        throw new Error('Invalid loan data in file (Name, Principal, Start Date, or Rates missing/invalid)');
      }

      // Filter invalid rates
      const validRates = loanData.rates.filter(r => isValidDate(r.startDate));
      if (validRates.length === 0) {
         throw new Error('No valid rate segments found');
      }
      loanData.rates = validRates;

      // Filter invalid reference rates
      const validReferenceRates = referenceRatesData.filter(r => isValidDate(r.date));

      // Filter invalid payments
      const validPayments = paymentsData.filter(p => isValidDate(p.date));

      // Confirm import
      const confirmMsg = `Import loan configuration?\n\nLoan: ${loanData.name}\nPrincipal: ${loanData.principal?.toLocaleString()}\nRate Segments: ${validRates.length}\nPayments: ${validPayments.length}\nReference Rates: ${validReferenceRates.length}\n\nThis will reset all current data.`;

      if (!confirm(confirmMsg)) {
        setImportMessage('');
        return;
      }

      setImportMessage('Importing data...');
      
      await db.transaction('rw', db.loans, db.payments, db.referenceRates, async () => {
        // Clear existing data
        await db.loans.clear();
        await db.payments.clear();
        await db.referenceRates.clear();

        // Import new data
        // Note: loanRepository is used here, but inside a transaction we should ideally use the transaction object
        // However, repo likely uses db.loans.add/put which is transaction-aware in Dexie if awaited
        
        // We can just use db.loans directly to be safe and explicit within transaction
        const loanId = await db.loans.add(loanData as Loan);

        if (validReferenceRates.length > 0) {
           await db.referenceRates.bulkAdd(validReferenceRates);
        }

        if (validPayments.length > 0) {
           const paymentsWithLoanId = validPayments.map(p => ({ ...p, loanId: loanId as number }));
           await db.payments.bulkAdd(paymentsWithLoanId);
        }
      });

      setImportMessage('Import successful!');
      showSuccess('Data imported successfully!');
      setImportMessage('');
      // No reload needed - live queries will update automatically
    } catch (error) {
      setImportMessage('');
      showError(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [showSuccess, showError]);

  return { 
    importFromFile, 
    importStatus: status.message, 
    isImporting: status.isImporting 
  };
};
