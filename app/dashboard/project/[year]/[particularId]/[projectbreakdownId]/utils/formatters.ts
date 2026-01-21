// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/utils/formatters.ts

import { Breakdown, ColumnConfig } from "../types/breakdown.types";
import { CURRENCY_FORMAT_OPTIONS, LOCALE } from "../constants/table.constants";

/**
 * Formats a cell value based on column type
 */
export function formatCellValue(
  value: any, 
  column: ColumnConfig, 
  row: Breakdown
): string {
  if (value == null || value === undefined || value === "") {
    return "-";
  }

  switch (column.type) {
    case "currency":
      return formatCurrency(value);
    
    case "date":
      return formatDate(value);
    
    case "number":
      return formatPercentage(value);
    
    case "status":
      // Return capitalized plain text
      return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    
    default:
      // Special case for municipality field
      if (column.key === "municipality") {
        return formatLocation(row);
      }
      return String(value);
  }
}

/**
 * Formats a number as currency (PHP)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(LOCALE, CURRENCY_FORMAT_OPTIONS).format(value);
}

/**
 * Formats a timestamp as a date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(LOCALE);
}

/**
 * Formats a number as percentage with 1 decimal place
 */
export function formatPercentage(value: number): string {
  return `${parseFloat(String(value)).toFixed(1)}%`;
}

/**
 * Formats location by combining barangay, municipality, and district
 */
export function formatLocation(row: Breakdown): string {
  const locationParts = [
    row.barangay, 
    row.municipality, 
    row.district
  ].filter(Boolean);
  
  return locationParts.length > 0 ? locationParts.join(", ") : "-";
}