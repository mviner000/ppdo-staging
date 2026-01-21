// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/utils/form.utils.ts

/**
 * Formats number with commas for display (real-time)
 */
export function formatNumberWithCommas(value: string): string {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');

  // Split by decimal point
  const parts = cleaned.split('.');

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Rejoin with decimal (limit to 2 decimal places)
  if (parts.length > 1) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }

  return parts[0];
}

/**
 * Parses formatted number string to actual number
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats number for display after blur event
 */
export function formatNumberForDisplay(value: number): string {
  if (value === 0) return '';
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts date string to timestamp
 */
export function dateToTimestamp(dateString: string): number | undefined {
  return dateString ? new Date(dateString).getTime() : undefined;
}

/**
 * Converts timestamp to date string
 */
export function timestampToDate(timestamp?: number): string {
  return timestamp ? new Date(timestamp).toISOString().split("T")[0] : "";
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates utilization rate percentage
 */
export function calculateUtilizationRate(utilized: number, allocated: number): number {
  if (allocated === 0) return 0;
  return parseFloat(((utilized / allocated) * 100).toFixed(2));
}

/**
 * Calculates budget usage percentage
 */
export function calculatePercentageUsed(used: number, total: number): number {
  if (total === 0) return 0;
  return (used / total) * 100;
}