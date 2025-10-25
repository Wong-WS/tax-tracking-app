import { Transaction } from '@/types';

/**
 * Validate transaction data loaded from storage
 */
export function validateTransaction(data: any): data is Transaction {
  if (!data || typeof data !== 'object') return false;

  if (typeof data.id !== 'string' || !data.id) return false;
  if (typeof data.description !== 'string' || !data.description) return false;
  if (typeof data.amount !== 'number' || data.amount < 0) return false;
  if (typeof data.date !== 'string' || !data.date) return false;
  if (typeof data.category !== 'string' || !data.category) return false;

  // Attachments are optional
  if (data.attachments !== undefined) {
    if (!Array.isArray(data.attachments)) return false;
    for (const attachment of data.attachments) {
      if (!attachment.id || !attachment.uri || !attachment.name || !attachment.type) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validate and sanitize an array of transactions
 */
export function validateTransactions(data: any[]): Transaction[] {
  if (!Array.isArray(data)) return [];
  return data.filter(validateTransaction);
}
