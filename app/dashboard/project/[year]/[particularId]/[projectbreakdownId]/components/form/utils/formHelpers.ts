// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/utils/formHelpers.ts

/**
 * Format number with thousands separators
 * @param value - Raw input value
 * @returns Formatted string with commas
 */
export const formatNumberWithCommas = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  return parts[0];
};

/**
 * Parse formatted number string to numeric value
 * @param value - Formatted string with commas
 * @returns Numeric value
 */
export const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format number for display in input fields
 * @param value - Numeric value
 * @returns Formatted string or empty string if 0
 */
export const formatNumberForDisplay = (value: number): string => {
  if (value === 0) return '';
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format number as PHP currency
 * @param amount - Numeric amount
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate utilization rate percentage
 * @param utilized - Budget utilized amount
 * @param allocated - Budget allocated amount
 * @returns Utilization rate as percentage
 */
export const calculateUtilizationRate = (utilized: number, allocated: number): number => {
  if (allocated <= 0) return 0;
  return (utilized / allocated) * 100;
};

/**
 * Calculate percentage of budget used
 * @param used - Amount used
 * @param total - Total amount
 * @returns Percentage used
 */
export const calculatePercentageUsed = (used: number, total: number): number => {
  if (total <= 0) return 0;
  return (used / total) * 100;
};

/**
 * Convert timestamp to date string for input[type="date"]
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-DD format
 */
export const timestampToDate = (timestamp: number | undefined): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0];
};

/**
 * Convert date string to timestamp
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Unix timestamp in milliseconds
 */
export const dateToTimestamp = (dateString: string): number | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString).getTime();
};