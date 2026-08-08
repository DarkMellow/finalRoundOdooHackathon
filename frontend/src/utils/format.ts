import { format, parseISO } from "date-fns";

/**
 * Format a monetary value as Rs. X.XX
 * All money displayed as Rs. with 2 decimal places, right-aligned in tables.
 */
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

/**
 * Format a date string (ISO) to DD MMM YYYY (e.g. "08 Aug 2026")
 */
export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "dd MMM yyyy");
}

/**
 * Format a timestamp string (ISO) to DD MMM YYYY, hh:mm a
 */
export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "dd MMM yyyy, hh:mm a");
}
