// components/ppdo/breakdown/utils/helpers.ts

/**
 * Centralized Helper Utilities for Breakdown Components
 *
 * These utilities are used by both Project and Trust Fund breakdown tables.
 */

import { Breakdown, ColumnConfig, ColumnTotals } from "../types/breakdown.types";

/**
 * Extracts ID from a slug string
 * Looks for the longest alphanumeric segment (>15 chars) from right to left
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.length > 15 && /^[a-z0-9]+$/i.test(part)) {
      return part;
    }
  }

  return parts[parts.length - 1];
}

/**
 * Creates a URL-safe slug from breakdown data
 */
export function createBreakdownSlug(breakdown: Breakdown): string {
  const title = breakdown.projectTitle || breakdown.projectName || 'breakdown';

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug}-${breakdown._id}`;
}

/**
 * Filters breakdowns based on search query
 */
export function filterBreakdowns(
  breakdowns: Breakdown[],
  searchQuery: string
): Breakdown[] {
  if (!searchQuery) {
    return breakdowns;
  }

  const query = searchQuery.toLowerCase();

  return breakdowns.filter(breakdown =>
    Object.entries(breakdown).some(([key, value]) => {
      if (key === '_id') return false;
      return String(value).toLowerCase().includes(query);
    })
  );
}

/**
 * Calculates totals for numeric and currency columns
 */
export function calculateColumnTotals(
  breakdowns: Breakdown[],
  columns: ColumnConfig[]
): ColumnTotals {
  const totals: ColumnTotals = {};

  columns.forEach(column => {
    if (column.type === "currency" || column.type === "number") {
      const sum = breakdowns.reduce((acc, row) => {
        const value = row[column.key];
        return acc + (typeof value === "number" ? value : 0);
      }, 0);

      totals[column.key] = sum;
    }
  });

  // Correct utilization rate total: (Total Utilized / Total Allocated) * 100
  if (totals.allocatedBudget !== undefined && totals.budgetUtilized !== undefined) {
    totals.utilizationRate = totals.allocatedBudget > 0
      ? (totals.budgetUtilized / totals.allocatedBudget) * 100
      : 0;
  }

  return totals;
}

/**
 * Generates CSS grid template columns string
 */
export function generateGridTemplate(columns: ColumnConfig[]): string {
  return [
    "48px", // Row number column
    ...columns.map(c => `${c.width}px`),
    "64px" // Actions column
  ].join(" ");
}

/**
 * Merges saved column settings with default columns
 */
export function mergeColumnSettings(
  savedColumns: Array<{ fieldKey: string; width: number }>,
  defaultColumns: ColumnConfig[]
): ColumnConfig[] {
  const merged: ColumnConfig[] = [];

  // First, add all saved columns with their widths
  savedColumns.forEach(savedCol => {
    const defaultCol = defaultColumns.find(col => col.key === savedCol.fieldKey);
    if (defaultCol) {
      merged.push({ ...defaultCol, width: savedCol.width });
    }
  });

  // Then add any default columns that weren't in saved settings
  defaultColumns.forEach(defaultCol => {
    if (!merged.find(col => col.key === defaultCol.key)) {
      merged.push(defaultCol);
    }
  });

  return merged;
}

/**
 * Safely parses JSON string, returns default value on error
 */
export function safeJsonParse<T>(
  jsonString: string | undefined,
  defaultValue: T
): T {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Checks if click target is an interactive element
 */
export function isInteractiveElement(target: HTMLElement): boolean {
  return !!(
    target.closest('button') ||
    target.closest('[role="menuitem"]')
  );
}
