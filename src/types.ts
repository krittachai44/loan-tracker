export interface ReferenceRate {
    id?: number;
    date: Date;
    rate: number; // The generic market rate (e.g. MRR)
}

export interface RateSegment {
    startDate: Date;
    type: 'fixed' | 'float';
    value: number; // If fixed: absolute rate (%). If float: spread (+/- %) to add to MRR.
}

export interface Loan {
    id?: number;
    name: string;
    principal: number;
    rates: RateSegment[];
    startDate: Date;
}

export interface Payment {
    id?: number;
    loanId: number;
    date: Date;
    amount: number;
    note?: string;
}

export interface LoanSummary {
    remainingPrincipal: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
    nextPaymentDate?: Date; // Optional suggestion
}
