// app/dashboard/project/[year]/components/utils/budgetTableHelpers.ts

import { BudgetItem, BudgetTotals } from "@/app/dashboard/project/[year]/types";
import { BudgetTotals as PrintBudgetTotals } from "@/lib/print-canvas/types";
import { BUDGET_TABLE_COLUMNS } from "@/app/dashboard/project/[year]/constants";

/**
 * Extract year from current URL pathname
 */
export function extractYearFromURL(): number {
  if (typeof window === "undefined") return new Date().getFullYear();
  
  const pathSegments = window.location.pathname.split('/');
  const yearIndex = pathSegments.findIndex(seg => seg === 'project') + 1;
  
  if (yearIndex > 0 && pathSegments[yearIndex]) {
    const yearSegment = pathSegments[yearIndex];
    const parsed = parseInt(yearSegment);
    
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      return parsed;
    }
  }
  
  return new Date().getFullYear();
}

/**
 * Validate if year is within acceptable range
 */
export function isValidYear(year: number): boolean {
  return !isNaN(year) && year >= 2000 && year <= 2100;
}

/**
 * Convert budget totals to print format
 */
export function convertToPrintTotals(totals: BudgetTotals): PrintBudgetTotals {
  return {
    totalBudgetAllocated: totals.totalBudgetAllocated,
    obligatedBudget: totals.obligatedBudget,
    totalBudgetUtilized: totals.totalBudgetUtilized,
    projectCompleted: totals.projectCompleted,
    projectDelayed: totals.projectDelayed,
    projectsOnTrack: totals.projectsOnTrack,
  };
}

/**
 * Get visible columns for print/export
 */
export function getVisibleColumns(hiddenColumns: Set<string>) {
  return BUDGET_TABLE_COLUMNS
    .filter(col => !hiddenColumns.has(col.key))
    .map(col => ({
      key: col.key,
      label: col.label,
      align: col.align,
    }));
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}