// app/dashboard/project/[year]/utils/index.ts

// Re-export shared utilities
export {
  formatNumberWithCommas,
  parseFormattedNumber,
  formatNumberForDisplay,
  formatCurrency,
  formatPercentage,
} from "@/lib/shared/utils/formatting";

export {
  getUtilizationColor,
  getProjectStatusColor,
  getStatusColor,
  getAvatarColor,
} from "@/lib/shared/utils/colors";

export {
  sortItems,
  sortWithPinnedFirst,
} from "@/lib/shared/utils/sorting";

export {
  filterBySearchQuery,
  filterByStatus,
  filterByYear,
  extractUniqueValues,
} from "@/lib/shared/utils/filtering";

export {
  generateCSV,
  downloadCSV,
} from "@/lib/shared/utils/csv";

import { BudgetItem, BudgetTotals, BudgetSortField } from "../types";
import { SortDirection } from "@/lib/shared/types/table.types";
import { sortItems } from "@/lib/shared/utils/sorting";
import { filterBySearchQuery as genericFilterBySearch } from "@/lib/shared/utils/filtering";

// ============================================================================
// BUDGET-SPECIFIC UTILITIES
// ============================================================================

/**
 * Filters budget items by search query (budget-specific fields)
 */
export function filterBudgetsBySearch(
  items: BudgetItem[],
  query: string
): BudgetItem[] {
  return genericFilterBySearch(items, query, [
    "particular",
    "status",
    "year",
  ] as (keyof BudgetItem)[]);
}

/**
 * Sorts budget items
 */
export function sortBudgetItems(
  items: BudgetItem[],
  field: BudgetSortField | null,
  direction: SortDirection
): BudgetItem[] {
  return sortItems(items, field, direction);
}

/**
 * Calculates totals from budget items
 */
export function calculateBudgetTotals(items: BudgetItem[]): BudgetTotals {
  return items.reduce(
    (acc, item) => ({
      totalBudgetAllocated: acc.totalBudgetAllocated + item.totalBudgetAllocated,
      obligatedBudget: acc.obligatedBudget + (item.obligatedBudget || 0),
      totalBudgetUtilized: acc.totalBudgetUtilized + item.totalBudgetUtilized,
      projectCompleted: acc.projectCompleted + item.projectCompleted,
      projectDelayed: acc.projectDelayed + item.projectDelayed,
      projectsOnTrack: acc.projectsOnTrack + item.projectsOnTrack,
    }),
    {
      totalBudgetAllocated: 0,
      obligatedBudget: 0,
      totalBudgetUtilized: 0,
      projectCompleted: 0,
      projectDelayed: 0,
      projectsOnTrack: 0,
    }
  );
}

/**
 * Calculates total utilization rate
 */
export function calculateTotalUtilizationRate(totals: BudgetTotals): number {
  return totals.totalBudgetAllocated > 0
    ? (totals.totalBudgetUtilized / totals.totalBudgetAllocated) * 100
    : 0;
}

/**
 * Extracts unique statuses from budget items
 */
export function extractUniqueStatuses(items: BudgetItem[]): string[] {
  const statuses = new Set<string>();
  items.forEach((item) => {
    if (item.status) statuses.add(item.status);
  });
  return Array.from(statuses).sort();
}

/**
 * Extracts unique years from budget items
 */
export function extractUniqueYears(items: BudgetItem[]): number[] {
  const years = new Set<number>();
  items.forEach((item) => {
    if (item.year) years.add(item.year);
  });
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Checks if a string is a valid particular code format
 */
export function isValidParticularCode(value: string): boolean {
  return /^[\p{L}0-9_%\s,.\-@]+$/u.test(value);
}

/**
 * Checks if budget is exceeded
 */
export function isBudgetExceeded(utilized: number, allocated: number): boolean {
  return utilized > allocated;
}

/**
 * Checks if obligated budget exceeds allocated
 */
export function isObligatedExceeded(
  obligated: number | undefined,
  allocated: number
): boolean {
  return obligated !== undefined && obligated > allocated;
}