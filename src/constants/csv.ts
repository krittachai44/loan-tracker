export const CSV_SECTIONS = {
  LOAN: 'LOAN',
  RATES: 'RATES',
  REFERENCE: 'REFERENCE',
  PAYMENTS: 'PAYMENTS',
} as const;

export type CSVSection = typeof CSV_SECTIONS[keyof typeof CSV_SECTIONS];

export const CSV_SECTION_HEADERS = {
  LOAN: '# LOAN DETAILS',
  RATES: '# RATE SEGMENTS',
  REFERENCE: '# REFERENCE RATES',
  PAYMENTS: '# PAYMENT HISTORY',
} as const;

export const CSV_FIELD_HEADERS = {
  LOAN: 'field,value',
  RATES: 'start date,type,value',
  REFERENCE: 'date,rate',
  PAYMENTS: 'date,amount,note',
} as const;

export const LOAN_FIELDS = {
  NAME: 'name',
  PRINCIPAL: 'principal',
  START_DATE: 'startdate',
  DATE: 'date',
} as const;

export const ACCEPTED_FILE_TYPES = '.csv,.xlsx,.xls';

export const SAMPLE_CSV_DATA = `# LOAN DETAILS
Field,Value
Name,"My Home Loan"
Principal,500000
Start Date,2024-01-01

# RATE SEGMENTS
Start Date,Type,Value
2024-01-01,fixed,2.5
2025-01-01,float,0.5

# REFERENCE RATES
Date,Rate
2024-01-01,2.5
2024-07-01,2.75
2025-01-01,3.0

# PAYMENT HISTORY
Date,Amount,Note
2024-02-01,5000,
2024-03-01,5000,
2024-04-01,5000,`;
