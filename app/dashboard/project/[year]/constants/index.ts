// app/dashboard/project/[year]/constants/index.ts

// Re-export shared constants
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
  LIMITS,
  AVATAR_COLORS,
} from "@/lib/shared/constants/display";

// Budget-specific constants
export const ITEMS_PER_PAGE = 20;

export const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "delayed", label: "Delayed" },
] as const;

export const ACCESS_LEVELS = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
] as const;

// ============================================================================
// TABLE COLUMNS - For Column Visibility & Export
// ============================================================================

export const BUDGET_TABLE_COLUMNS = [
  { 
    key: "particular", 
    label: "Particulars", 
    sortable: true, 
    filterable: false, 
    align: "left" as const 
  },
  { 
    key: "year", 
    label: "Year", 
    sortable: false, 
    filterable: true, 
    align: "center" as const 
  },
  { 
    key: "status", 
    label: "Status", 
    sortable: false, 
    filterable: true, 
    align: "center" as const 
  },
  {
    key: "totalBudgetAllocated",
    label: "Budget Allocated",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
  {
    key: "obligatedBudget",
    label: "Obligated Budget",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
  {
    key: "totalBudgetUtilized",
    label: "Budget Utilized",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
  {
    key: "utilizationRate",
    label: "Utilization Rate",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
  {
    key: "projectCompleted",
    label: "Completed",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
  {
    key: "projectDelayed",
    label: "Delayed",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
  {
    key: "projectsOnTrack",
    label: "Ongoing",
    sortable: true,
    filterable: false,
    align: "right" as const,
  },
] as const;

export const ANIMATION = {
  NEW_ITEM_HIGHLIGHT_DURATION: 2000,
  SCROLL_DELAY: 100,
} as const;

export const EXPORT = {
  CSV_FILENAME_PREFIX: "budget_export",
  DATE_FORMAT: "YYYY-MM-DD",
} as const;