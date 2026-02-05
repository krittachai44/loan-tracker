/**
 * Payment Allocator - Handles allocation of payments to interest and principal
 * Extracted from calculateLoanSeries for Single Responsibility Principle
 */

export interface PaymentAllocation {
  interestPaid: number;
  principalPaid: number;
  unpaidInterest: number;
}

/**
 * Allocate a payment amount between interest and principal
 * 
 * Payment allocation logic:
 * 1. First pay off any unpaid interest from previous periods
 * 2. Then pay current period's interest
 * 3. Remainder goes to principal
 * 4. If payment is insufficient for all interest, it all goes to interest (unpaid interest accumulates)
 * 
 * @param paymentAmount - The total payment amount
 * @param periodInterest - Interest accrued in the current period
 * @param unpaidInterest - Unpaid interest carried over from previous periods
 * @returns Allocation breakdown showing interest paid, principal paid, and remaining unpaid interest
 */
export function allocatePayment(
  paymentAmount: number,
  periodInterest: number,
  unpaidInterest: number
): PaymentAllocation {
  const totalInterestDue = unpaidInterest + periodInterest;

  if (paymentAmount >= totalInterestDue) {
    // Payment covers all interest, remainder goes to principal
    return {
      interestPaid: totalInterestDue,
      principalPaid: paymentAmount - totalInterestDue,
      unpaidInterest: 0
    };
  } else {
    // Payment insufficient for all interest, all goes to interest
    return {
      interestPaid: paymentAmount,
      principalPaid: 0,
      unpaidInterest: totalInterestDue - paymentAmount
    };
  }
}
