import * as React from 'react';
import {
  IconButton,
  Tooltip
} from '@mui/material';
import { FileDownload, FileUpload } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { type Loan, type Payment, type ReferenceRate } from '../types';

interface Props {
  loan: Loan;
}

export const DataExportImport: React.FC<Props> = ({ loan }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = React.useState<string>('');

  const exportToCSV = async () => {
    try {
      // Get all data
      const payments = await db.payments.where('loanId').equals(loan.id!).toArray();
      const referenceRates = await db.referenceRates.toArray();

      // Create CSV content
      const csvParts: string[] = [];

      // Section 1: Loan Details
      csvParts.push('# LOAN DETAILS');
      csvParts.push('Field,Value');
      csvParts.push(`Name,${escapeCSV(loan.name)}`);
      csvParts.push(`Principal,${loan.principal}`);
      csvParts.push(`Start Date,${loan.startDate.toISOString().split('T')[0]}`);
      csvParts.push('');

      // Section 2: Rate Segments
      csvParts.push('# RATE SEGMENTS');
      csvParts.push('Start Date,Type,Value');
      loan.rates.forEach(rate => {
        csvParts.push(`${rate.startDate.toISOString().split('T')[0]},${rate.type},${rate.value}`);
      });
      csvParts.push('');

      // Section 3: Reference Rates (MRR)
      csvParts.push('# REFERENCE RATES');
      csvParts.push('Date,Rate');
      referenceRates
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .forEach(rate => {
          csvParts.push(`${rate.date.toISOString().split('T')[0]},${rate.rate}`);
        });
      csvParts.push('');

      // Section 4: Payment History
      csvParts.push('# PAYMENT HISTORY');
      csvParts.push('Date,Amount,Note');
      payments
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .forEach(payment => {
          csvParts.push(`${payment.date.toISOString().split('T')[0]},${payment.amount},${escapeCSV(payment.note || '')}`);
        });

      const csvContent = csvParts.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `loan_${loan.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data. Please try again.');
    }
  };

  const importFromFile = async (file: File) => {
    try {
      setImportStatus('Reading file...');

      const loanData: Partial<Loan> = { rates: [] };
      const paymentsData: Omit<Payment, 'id' | 'loanId'>[] = [];
      const referenceRatesData: Omit<ReferenceRate, 'id'>[] = [];

      // Check file extension
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      if (isExcel) {
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
      if (!loanData.name || !loanData.principal || !loanData.startDate || !loanData.rates || loanData.rates.length === 0) {
        throw new Error('Invalid loan data in file');
      }

      // Confirm import
      const confirmMsg = `Import loan configuration?\n\nLoan: ${loanData.name}\nPrincipal: ${loanData.principal?.toLocaleString()}\nRate Segments: ${loanData.rates.length}\nPayments: ${paymentsData.length}\nReference Rates: ${referenceRatesData.length}\n\nThis will reset all current data.`;

      if (!confirm(confirmMsg)) {
        setImportStatus('');
        return;
      }

      setImportStatus('Clearing existing data...');
      await db.delete();
      await db.open();

      setImportStatus('Importing loan...');
      const loanId = await db.loans.add(loanData as Loan);

      setImportStatus('Importing reference rates...');
      for (const rate of referenceRatesData) {
        await db.referenceRates.add(rate);
      }

      setImportStatus('Importing payments...');
      for (const payment of paymentsData) {
        await db.payments.add({ ...payment, loanId: loanId as number });
      }

      setImportStatus('Import successful!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setImportStatus('');
      alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromFile(file);
    }
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {/* Export Button */}
      <Tooltip title="Export Data" arrow>
        <IconButton
          onClick={exportToCSV}
          size="small"
          sx={{
            color: 'success.main',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.08)'
            }
          }}
        >
          <FileDownload fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Import Button */}
      <Tooltip title="Import Data" arrow>
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={!!importStatus}
          size="small"
          sx={{
            color: 'info.main',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.08)'
            }
          }}
        >
          <FileUpload fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );
};

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (!value) return '';

  // If value contains comma, quotes, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

// Helper function to parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}
