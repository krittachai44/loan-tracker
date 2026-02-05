/**
 * Loan Repository - Abstracts database operations for loans
 * Implements Repository pattern for Dependency Inversion Principle
 */
import { db } from '../db';
import type { Loan } from '../types';

export const loanRepository = {
  /**
   * Get all loans from the database
   */
  async getAll(): Promise<Loan[]> {
    return db.loans.toArray();
  },

  /**
   * Get a single loan by ID
   */
  async getById(id: number): Promise<Loan | undefined> {
    return db.loans.get(id);
  },

  /**
   * Create a new loan
   */
  async create(loan: Omit<Loan, 'id'>): Promise<number> {
    const id = await db.loans.add(loan as Loan);
    return id as number;
  },

  /**
   * Update an existing loan
   */
  async update(id: number, updates: Partial<Omit<Loan, 'id'>>): Promise<number> {
    return db.loans.update(id, updates);
  },

  /**
   * Delete a loan by ID
   */
  async delete(id: number): Promise<void> {
    await db.loans.delete(id);
  },

  /**
   * Delete all loans
   */
  async deleteAll(): Promise<void> {
    await db.loans.clear();
  }
};
