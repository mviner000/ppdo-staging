// app/dashboard/project/budget/[particularId]/constants.ts

import { TableColumn } from "./types";

// ============================================================================
// RE-EXPORT SHARED CONSTANTS
// ============================================================================

export {
  VALIDATION_MESSAGES,
  VALIDATION_LIMITS,
  CODE_PATTERN,
} from "@/lib/shared/constants/validation";

export {
  STORAGE_KEYS,
} from "@/lib/shared/constants/storage";

export {
  PAGINATION,
  TIMEOUTS,
  ANIMATION,
} from "@/lib/shared/constants/display";

// ============================================================================
// PROJECT-SPECIFIC CONSTANTS
// ============================================================================

/**
 * Available columns for project table
 */
export const AVAILABLE_COLUMNS: TableColumn[] = [
  { id: "particulars", label: "Particulars", sortable: true, align: "left" },
  { id: "implementingOffice", label: "Implementing Office", filterable: true, align: "left" },
  { id: "year", label: "Year", filterable: true, align: "center" },
  { id: "status", label: "Status", filterable: true, align: "left" },
  { id: "totalBudgetAllocated", label: "Allocated Budget", sortable: true, align: "right" },
  { id: "obligatedBudget", label: "Obligated Budget", sortable: true, align: "right" },
  { id: "totalBudgetUtilized", label: "Utilized Budget", sortable: true, align: "right" },
  { id: "utilizationRate", label: "Utilization Rate", sortable: true, align: "right" },
  { id: "projectCompleted", label: "Completed", sortable: true, align: "right" },
  { id: "projectDelayed", label: "Delayed", sortable: true, align: "right" },
  { id: "projectsOngoing", label: "Ongoing", sortable: true, align: "right" },
  { id: "remarks", label: "Remarks", align: "left" },
];

/**
 * Default category colors
 */
export const DEFAULT_CATEGORY_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
] as const;

/**
 * Uncategorized color
 */
export const UNCATEGORIZED_COLOR = "#71717a" as const;

/**
 * Items per page for pagination
 */
export const ITEMS_PER_PAGE = 20;

/**
 * Export settings
 */
export const EXPORT = {
  CSV_FILENAME_PREFIX: "projects_export",
  DATE_FORMAT: "YYYY-MM-DD",
} as const;