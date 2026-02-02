export interface ReferenceRate {
    id?: number;
    date: Date;
    rate: number;
}

export type RateType = 'fixed' | 'float';

export interface BaseRateSegment {
    startDate: Date;
    type: RateType;
}

export interface FixedRateSegment extends BaseRateSegment {
    type: 'fixed';
    value: number; // Absolute rate (%)
}

export interface FloatRateSegment extends BaseRateSegment {
    type: 'float';
    value: number; // Spread (+/- %) to add to MRR
}

export type RateSegment = FixedRateSegment | FloatRateSegment;

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
    nextPaymentDate?: Date;
}

// Form state types
export interface LoanFormData {
    name: string;
    principal: string;
    startDate: string;
    rates: RateSegmentFormData[];
}

export interface RateSegmentFormData {
    value: string;
    startDate: string;
    type: RateType;
}

export interface PaymentFormData {
    amount: string;
    date: string;
    note: string;
}
