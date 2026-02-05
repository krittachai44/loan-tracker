/**
 * Reference Rate Repository - Abstracts database operations for reference rates
 * Implements Repository pattern for Dependency Inversion Principle
 */
import { db } from '../db';
import type { ReferenceRate } from '../types';

export const referenceRateRepository = {
  /**
   * Get all reference rates from the database
   */
  async getAll(): Promise<ReferenceRate[]> {
    return db.referenceRates.toArray();
  },

  /**
   * Get a single reference rate by ID
   */
  async getById(id: number): Promise<ReferenceRate | undefined> {
    return db.referenceRates.get(id);
  },

  /**
   * Create a new reference rate
   */
  async create(rate: Omit<ReferenceRate, 'id'>): Promise<number> {
    const id = await db.referenceRates.add(rate as ReferenceRate);
    return id as number;
  },

  /**
   * Update an existing reference rate
   */
  async update(id: number, updates: Partial<Omit<ReferenceRate, 'id'>>): Promise<number> {
    return db.referenceRates.update(id, updates);
  },

  /**
   * Delete a reference rate by ID
   */
  async delete(id: number): Promise<void> {
    await db.referenceRates.delete(id);
  },

  /**
   * Delete all reference rates
   */
  async deleteAll(): Promise<void> {
    await db.referenceRates.clear();
  },

  /**
   * Bulk add reference rates
   */
  async bulkAdd(rates: Omit<ReferenceRate, 'id'>[]): Promise<number> {
    await db.referenceRates.bulkAdd(rates as ReferenceRate[], { allKeys: false });
    return rates.length;
  }
};
