// app/dashboard/project/[year]/types/table.types.ts

import { BudgetItem } from "./budget.types";

// ============================================================================
// TABLE COMPONENT PROPS
// ============================================================================

/**
 * Props for the main BudgetTrackingTable component
 */
export interface BudgetTrackingTableProps {
  budgetItems: BudgetItem[];
  onAdd?: (
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => void;
  onEdit?: (
    id: string,
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => void;
  onDelete?: (id: string) => void;
  expandButton?: React.ReactNode;
  onOpenTrash?: () => void;
}

// ============================================================================
// SORTING & FILTERING
// ============================================================================

export type SortDirection = "asc" | "desc" | null;
export type SortField = string | null;

/**
 * Context menu state
 */
export interface BudgetContextMenuState {
  x: number;
  y: number;
  entity: BudgetItem;
}

// ============================================================================
// COLUMN CONFIGURATION
// ============================================================================

export interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  filterable: boolean;
  align: "left" | "center" | "right";
}

// ============================================================================
// FILTER STATE
// ============================================================================

/**
 * Active filter state
 */
export interface FilterState {
  searchQuery: string;
  statusFilter: string[];
  yearFilter: number[];
  sortField: string | null;
  sortDirection: "asc" | "desc" | null;
  hiddenColumns?: string[];
}