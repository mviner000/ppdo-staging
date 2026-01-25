/**
 * Shared Type Definitions for Breakdown Architecture
 *
 * This file contains base interfaces that match the baseBreakdownSchema
 * and extended interfaces for Project and Trust Fund breakdowns.
 *
 * These types enable the Container/Presenter architecture where UI components
 * don't care about the specific data source (Project vs Trust Fund).
 */

import { Id } from "@/convex/_generated/dataModel";

/**
 * Base Breakdown Interface
 * Matches the baseBreakdownSchema from convex/schema/shared/baseBreakdown.ts
 */
export interface IBaseBreakdown {
  _id: Id<"govtProjectBreakdowns"> | Id<"trustFundBreakdowns">;
  _creationTime: number;

  // Core Project Information
  projectName: string;
  implementingOffice: string;
  projectTitle?: string;

  // Location Information
  municipality?: string;
  barangay?: string;
  district?: string;

  // Additional Details
  remarks?: string;

  // Financial Data
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
  balance?: number;
  utilizationRate?: number;
  fundSource?: string;

  // Progress Tracking
  projectAccomplishment?: number;
  status?: "completed" | "delayed" | "ongoing";

  // Timeline
  reportDate?: number;
  dateStarted?: number;
  targetDate?: number;
  completionDate?: number;

  // Soft Delete / Trash System
  isDeleted?: boolean;
  deletedAt?: number;
  deletedBy?: Id<"users">;
  deletionReason?: string;

  // Metadata
  batchId?: string;
  createdBy?: Id<"users">;
  createdAt?: number;
  updatedAt?: number;
  updatedBy?: Id<"users">;
}

/**
 * Project Breakdown Interface
 * Extends IBaseBreakdown with projectId
 */
export interface IProjectBreakdown extends IBaseBreakdown {
  _id: Id<"govtProjectBreakdowns">;
  projectId?: Id<"projects">;
}

/**
 * Trust Fund Breakdown Interface
 * Extends IBaseBreakdown with trustFundId
 */
export interface ITrustFundBreakdown extends IBaseBreakdown {
  _id: Id<"trustFundBreakdowns">;
  trustFundId: Id<"trustFunds">;
}

/**
 * Type guard to check if a breakdown is a Project Breakdown
 */
export function isProjectBreakdown(
  breakdown: IBaseBreakdown
): breakdown is IProjectBreakdown {
  return "projectId" in breakdown;
}

/**
 * Type guard to check if a breakdown is a Trust Fund Breakdown
 */
export function isTrustFundBreakdown(
  breakdown: IBaseBreakdown
): breakdown is ITrustFundBreakdown {
  return "trustFundId" in breakdown;
}

/**
 * Entity Statistics Interface
 * Used by useEntityStats hook to return computed statistics
 */
export interface IEntityStats {
  // Count Statistics
  totalReports: number;
  statusCounts: {
    ongoing: number;
    completed: number;
    delayed: number;
  };

  // Budget Statistics
  totalAllocatedBudget: number;
  totalObligatedBudget: number;
  totalUtilizedBudget: number;
  totalBalance: number;
  averageUtilizationRate: number;

  // Latest Report
  latestReport?: IBaseBreakdown;
  latestReportDate?: number;

  // Derived Metrics
  completionRate: number; // (completed / total) * 100
  delayRate: number; // (delayed / total) * 100
}

/**
 * Breakdown Form Values Interface
 * Used for form handling and validation
 */
export interface IBreakdownFormValues {
  projectName?: string;
  implementingOffice?: string;
  projectTitle?: string;
  municipality?: string;
  barangay?: string;
  district?: string;
  remarks?: string;
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
  utilizationRate?: number;
  fundSource?: string;
  projectAccomplishment?: number;
  status?: "completed" | "delayed" | "ongoing";
  reportDate?: Date;
  dateStarted?: Date;
  targetDate?: Date;
  completionDate?: Date;
}

/**
 * Breakdown Action Handlers Interface
 * Used by container pages to define actions
 */
export interface IBreakdownActions {
  onAdd?: (values: IBreakdownFormValues) => void | Promise<void>;
  onEdit?: (id: string, values: IBreakdownFormValues) => void | Promise<void>;
  onDelete?: (id: string, reason?: string) => void | Promise<void>;
  onRestore?: (id: string) => void | Promise<void>;
  onRecalculate?: () => void | Promise<void>; // Only for Projects
  onView?: (id: string) => void;
  onExport?: () => void | Promise<void>;
}

/**
 * Breakdown Table Configuration Interface
 * Used to configure the shared BreakdownTable component
 */
export interface IBreakdownTableConfig {
  showRecalculateButton?: boolean; // Only for Projects
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  columns?: string[]; // Optional column visibility configuration
}
