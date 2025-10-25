/**
 * Currency formatting utilities
 * All amounts are stored in cents for precision
 */

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency string
 */
export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(cents);
  return dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse currency input string to cents
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned) || 0;
  return dollarsToCents(dollars);
}
