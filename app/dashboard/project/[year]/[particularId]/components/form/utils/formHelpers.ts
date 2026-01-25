// app/dashboard/project/[year]/[particularId]/components/form/utils/formHelpers.ts

export const formatNumberWithCommas = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) return parts[0] + '.' + parts[1].slice(0, 2);
  return parts[0];
};

export const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatNumberForDisplay = (value: number): string => {
  if (value === 0) return '';
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getUtilizationColor = (utilizationRate: number): string => {
  if (utilizationRate > 100) return "text-red-600 dark:text-red-400 font-bold";
  if (utilizationRate >= 80) return "text-red-600 dark:text-red-400";
  if (utilizationRate >= 60) return "text-orange-600 dark:text-orange-400";
  return "text-green-600 dark:text-green-400";
};