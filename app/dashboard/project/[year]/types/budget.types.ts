// app/dashboard/project/[year]/types/budget.types.ts

import { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// BUDGET ITEM TYPES
// ============================================================================

/**
 * Client-side budget item representation
 */
export interface BudgetItem {
  id: string;
  particular: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  year?: number;
  status?: "completed" | "ongoing" | "delayed";
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  autoCalculateBudgetUtilized?: boolean;
}

/**
 * Database budget item representation
 */
export interface BudgetItemFromDB {
  _id: Id<"budgetItems">;
  particulars: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  year?: number;
  status?: "completed" | "ongoing" | "delayed";
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  autoCalculateBudgetUtilized?: boolean;
}

/**
 * Form data for creating/updating budget items
 */
export type BudgetItemFormData = Omit<
  BudgetItem,
  | "id"
  | "utilizationRate"
  | "projectCompleted"
  | "projectDelayed"
  | "projectsOnTrack"
  | "status"
>;

// ============================================================================
// STATISTICS TYPES
// ============================================================================

/**
 * Budget statistics for display
 */
export interface BudgetStatistics {
  totalAllocated: number;
  totalUtilized: number;
  totalObligated: number;
  averageUtilizationRate: number;
  totalProjects: number;
}

// ============================================================================
// TOTALS TYPES
// ============================================================================

/**
 * Budget totals for table footer
 */
export interface BudgetTotals {
  totalBudgetAllocated: number;
  obligatedBudget: number;
  totalBudgetUtilized: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
}

// ============================================================================
// BUDGET PARTICULAR TYPES
// ============================================================================

/**
 * Budget particular/category
 */
export interface BudgetParticular {
  _id: Id<"budgetParticulars">;
  code: string;
  fullName: string;
  description?: string;
  category?: string;
  usageCount?: number;
  isActive?: boolean;
}

// ============================================================================
// STATUS & FIELD TYPES
// ============================================================================

export type BudgetStatus = "completed" | "ongoing" | "delayed";

export type BudgetSortField =
  | "particular"
  | "year"
  | "status"
  | "totalBudgetAllocated"
  | "obligatedBudget"
  | "totalBudgetUtilized"
  | "utilizationRate"
  | "projectCompleted"
  | "projectDelayed"
  | "projectsOnTrack";