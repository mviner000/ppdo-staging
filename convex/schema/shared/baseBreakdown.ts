/**
 * Base Breakdown Schema
 *
 * Shared schema definition for all breakdown types (Project Breakdowns, Trust Fund Breakdowns).
 * This creates a single source of truth for breakdown data structures, preventing schema divergence.
 *
 * @module convex/schema/shared/baseBreakdown
 */

import { v } from "convex/values";

/**
 * Base breakdown schema containing all common fields across breakdown types.
 *
 * This schema is designed to be spread into specific breakdown table definitions,
 * allowing each breakdown type to add its own parent reference fields while
 * maintaining consistency in core breakdown functionality.
 *
 * Common Fields:
 * - Core: implementingOffice, projectTitle, municipality, remarks
 * - Financials: allocatedBudget, budgetUtilized, obligatedBudget, balance, utilizationRate
 * - Progress: projectAccomplishment (0-100), status
 * - Timeline: reportDate, dateStarted, targetDate, completionDate
 * - Audit: isDeleted, deletedAt, deletedBy, deletionReason
 * - System: createdBy, createdAt, updatedAt, updatedBy
 */
export const baseBreakdownSchema = {
  // ============================================================================
  // CORE FIELDS
  // ============================================================================

  /**
   * Display name for the project/work item
   * e.g., "Construction of School Building"
   */
  projectName: v.string(),

  /**
   * Office code responsible for implementation
   * e.g., "TPH", "PEO", "CDH"
   * References implementingAgencies table (by code, not ID)
   */
  implementingOffice: v.string(),

  /**
   * Full descriptive title of the project
   */
  projectTitle: v.optional(v.string()),

  /**
   * Municipality where work is being performed
   */
  municipality: v.optional(v.string()),

  /**
   * Barangay location (if applicable)
   */
  barangay: v.optional(v.string()),

  /**
   * District information (if applicable)
   */
  district: v.optional(v.string()),

  /**
   * Additional notes or comments
   */
  remarks: v.optional(v.string()),

  // ============================================================================
  // FINANCIAL DATA
  // ============================================================================

  /**
   * Total budget allocated for this breakdown
   */
  allocatedBudget: v.optional(v.number()),

  /**
   * Amount obligated (committed) via purchase orders, contracts, etc.
   */
  obligatedBudget: v.optional(v.number()),

  /**
   * Actual amount spent/utilized
   */
  budgetUtilized: v.optional(v.number()),

  /**
   * Remaining balance (allocated - utilized)
   * May be auto-calculated depending on breakdown type
   */
  balance: v.optional(v.number()),

  /**
   * Utilization rate as percentage (0-100)
   * Typically: (budgetUtilized / allocatedBudget) * 100
   */
  utilizationRate: v.optional(v.number()),

  /**
   * Funding source identifier
   */
  fundSource: v.optional(v.string()),

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  /**
   * Physical/technical accomplishment percentage (0-100)
   */
  projectAccomplishment: v.optional(v.number()),

  /**
   * Current status of the breakdown
   * - "ongoing": Work in progress
   * - "completed": Finished
   * - "delayed": Behind schedule
   *
   * Note: Different breakdown types may support different status values
   */
  status: v.optional(
    v.union(
      v.literal("completed"),
      v.literal("delayed"),
      v.literal("ongoing")
    )
  ),

  // ============================================================================
  // TIMELINE
  // ============================================================================

  /**
   * Date when work was reported
   */
  reportDate: v.optional(v.number()),

  /**
   * Date when work began
   */
  dateStarted: v.optional(v.number()),

  /**
   * Target completion date
   */
  targetDate: v.optional(v.number()),

  /**
   * Actual completion date
   */
  completionDate: v.optional(v.number()),

  // ============================================================================
  // SOFT DELETE / TRASH SYSTEM
  // ============================================================================

  /**
   * Soft delete flag
   * When true, record is in trash and excluded from normal queries
   */
  isDeleted: v.optional(v.boolean()),

  /**
   * Timestamp when record was moved to trash
   */
  deletedAt: v.optional(v.number()),

  /**
   * User who moved record to trash
   */
  deletedBy: v.optional(v.id("users")),

  /**
   * Reason for deletion (optional explanation)
   */
  deletionReason: v.optional(v.string()),

  // ============================================================================
  // METADATA & SYSTEM FIELDS
  // ============================================================================

  /**
   * Batch identifier for bulk operations
   * Used to correlate records created/updated together
   */
  batchId: v.optional(v.string()),

  /**
   * User who created this record
   */
  createdBy: v.id("users"),

  /**
   * Timestamp when record was created
   */
  createdAt: v.number(),

  /**
   * Timestamp when record was last updated
   */
  updatedAt: v.optional(v.number()),

  /**
   * User who last updated this record
   */
  updatedBy: v.optional(v.id("users")),
};

/**
 * Type helper for breakdown fields (for TypeScript inference)
 */
export type BaseBreakdownFields = typeof baseBreakdownSchema;
