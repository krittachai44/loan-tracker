import Dexie, { type EntityTable } from 'dexie';
import { type Loan, type Payment, type ReferenceRate } from './types';

export const db = new Dexie('LoanDatabase') as Dexie & {
    loans: EntityTable<Loan, 'id'>;
    payments: EntityTable<Payment, 'id'>;
    referenceRates: EntityTable<ReferenceRate, 'id'>;
};

db.version(1).stores({
    loans: '++id, name, startDate',
    payments: '++id, loanId, date', // Indexed by loanId and date for queries
    referenceRates: '++id, date', // Store MRR history
});

export const resetDatabase = async () => {
    await db.transaction('rw', db.loans, db.payments, db.referenceRates, async () => {
        await db.loans.clear();
        await db.payments.clear();
        await db.referenceRates.clear();
    });
};
