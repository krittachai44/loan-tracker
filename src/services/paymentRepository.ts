/**
 * Payment Repository - Abstracts database operations for payments
 * Implements Repository pattern for Dependency Inversion Principle
 */
import { db } from '../db';
import type { Payment } from '../types';

export const paymentRepository = {
  /**
   * Get all payments from the database
   */
  async getAll(): Promise<Payment[]> {
    return db.payments.toArray();
  },

  /**
   * Get a single payment by ID
   */
  async getById(id: number): Promise<Payment | undefined> {
    return db.payments.get(id);
  },

  /**
   * Get all payments for a specific loan
   */
  async getByLoanId(loanId: number): Promise<Payment[]> {
    return db.payments.where('loanId').equals(loanId).toArray();
  },

  /**
   * Create a new payment
   */
  async create(payment: Omit<Payment, 'id'>): Promise<number> {
    const id = await db.payments.add(payment as Payment);
    return id as number;
  },

  /**
   * Update an existing payment
   */
  async update(id: number, updates: Partial<Omit<Payment, 'id'>>): Promise<number> {
    return db.payments.update(id, updates);
  },

  /**
   * Delete a payment by ID
   */
  async delete(id: number): Promise<void> {
    await db.payments.delete(id);
  },

  /**
   * Delete all payments for a specific loan
   */
  async deleteByLoanId(loanId: number): Promise<number> {
    return db.payments.where('loanId').equals(loanId).delete();
  },

  /**
   * Delete all payments
   */
  async deleteAll(): Promise<void> {
    await db.payments.clear();
  },

  /**
   * Bulk add payments
   */
  async bulkAdd(payments: Omit<Payment, 'id'>[]): Promise<number> {
    await db.payments.bulkAdd(payments as Payment[], { allKeys: false });
    return payments.length;
  }
};
