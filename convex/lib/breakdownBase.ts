/**
 * Shared Breakdown API Logic
 *
 * Reusable backend helpers used by both Project Breakdowns and Trust Fund Breakdowns.
 * This module provides framework-agnostic utilities that don't care whether the parent
 * is a Project or a Trust Fund.
 *
 * Responsibilities:
 * - Financial calculations (balance, utilizationRate)
 * - Soft delete behavior (isDeleted, deletedAt, deletedBy, deletionReason)
 * - Safe patch utilities
 * - Generic activity logging helpers
 *
 * @module convex/lib/breakdownBase
 */

import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;
type QueryCtx = GenericQueryCtx<DataModel>;

// ============================================================================
// FINANCIAL CALCULATION HELPERS
// ============================================================================

/**
 * Financial input data for breakdown calculations
 */
export interface BreakdownFinancialInput {
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
}

/**
 * Calculated financial fields
 */
export interface CalculatedFinancials {
  balance?: number;
  utilizationRate?: number;
}

/**
 * Calculate derived financial fields for a breakdown
 *
 * @param input - Financial data (allocated, obligated, utilized)
 * @returns Calculated balance and utilization rate
 *
 * @example
 * const financials = calculateFinancials({
 *   allocatedBudget: 1000000,
 *   budgetUtilized: 450000
 * });
 * // Returns: { balance: 550000, utilizationRate: 45 }
 */
export function calculateFinancials(
  input: BreakdownFinancialInput
): CalculatedFinancials {
  const allocated = input.allocatedBudget || 0;
  const utilized = input.budgetUtilized || 0;

  const result: CalculatedFinancials = {};

  // Calculate balance (allocated - utilized)
  if (allocated > 0 || utilized > 0) {
    result.balance = allocated - utilized;
  }

  // Calculate utilization rate as percentage
  if (allocated > 0) {
    result.utilizationRate = (utilized / allocated) * 100;
  } else if (utilized > 0) {
    // If there's utilization but no allocation, set to 100%
    result.utilizationRate = 100;
  } else {
    result.utilizationRate = 0;
  }

  return result;
}

// ============================================================================
// SOFT DELETE HELPERS
// ============================================================================

/**
 * Soft delete metadata
 */
export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt: number;
  deletedBy: Id<"users">;
  deletionReason?: string;
}

/**
 * Create soft delete fields for moving a record to trash
 *
 * @param userId - User performing the soft delete
 * @param reason - Optional reason for deletion
 * @returns Soft delete field values
 */
export function createSoftDeleteFields(
  userId: Id<"users">,
  reason?: string
): SoftDeleteFields {
  const fields: SoftDeleteFields = {
    isDeleted: true,
    deletedAt: Date.now(),
    deletedBy: userId,
  };

  if (reason) {
    fields.deletionReason = reason;
  }

  return fields;
}

/**
 * Create restore fields for recovering a record from trash
 *
 * @returns Fields to clear soft delete status
 */
export function createRestoreFields() {
  return {
    isDeleted: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
    deletionReason: undefined,
  };
}

/**
 * Soft delete a breakdown record (move to trash)
 *
 * @param ctx - Mutation context
 * @param tableName - Name of the breakdown table ("govtProjectBreakdowns" | "trustFundBreakdowns")
 * @param id - Breakdown record ID
 * @param userId - User performing the deletion
 * @param reason - Optional reason for deletion
 */
export async function softDeleteBreakdown(
  ctx: MutationCtx,
  tableName: "govtProjectBreakdowns" | "trustFundBreakdowns",
  id: Id<"govtProjectBreakdowns"> | Id<"trustFundBreakdowns">,
  userId: Id<"users">,
  reason?: string
): Promise<void> {
  const softDeleteFields = createSoftDeleteFields(userId, reason);

  await ctx.db.patch(id as any, {
    ...softDeleteFields,
    updatedAt: Date.now(),
    updatedBy: userId,
  });
}

/**
 * Restore a breakdown record from trash
 *
 * @param ctx - Mutation context
 * @param tableName - Name of the breakdown table
 * @param id - Breakdown record ID
 * @param userId - User performing the restore
 */
export async function restoreBreakdown(
  ctx: MutationCtx,
  tableName: "govtProjectBreakdowns" | "trustFundBreakdowns",
  id: Id<"govtProjectBreakdowns"> | Id<"trustFundBreakdowns">,
  userId: Id<"users">
): Promise<void> {
  const restoreFields = createRestoreFields();

  await ctx.db.patch(id as any, {
    ...restoreFields,
    updatedAt: Date.now(),
    updatedBy: userId,
  });
}

// ============================================================================
// SAFE PATCH UTILITIES
// ============================================================================

/**
 * Apply a patch to a breakdown with automatic financial recalculation
 *
 * @param ctx - Mutation context
 * @param tableName - Name of the breakdown table
 * @param id - Breakdown record ID
 * @param patch - Fields to update
 * @param userId - User performing the update
 * @returns Updated record
 */
export async function applyBreakdownPatch<
  T extends "govtProjectBreakdowns" | "trustFundBreakdowns"
>(
  ctx: MutationCtx,
  tableName: T,
  id: Id<T>,
  patch: Partial<BreakdownFinancialInput & { [key: string]: any }>,
  userId: Id<"users">
): Promise<void> {
  // Check if financial fields are being updated
  const hasFinancialChanges =
    patch.allocatedBudget !== undefined ||
    patch.obligatedBudget !== undefined ||
    patch.budgetUtilized !== undefined;

  if (hasFinancialChanges) {
    // Get current record to merge with patch
    const current = await ctx.db.get(id);
    if (!current) {
      throw new Error(`Breakdown ${id} not found`);
    }

    // Merge current values with patch
    const merged: BreakdownFinancialInput = {
      allocatedBudget: patch.allocatedBudget ?? (current as any).allocatedBudget,
      obligatedBudget: patch.obligatedBudget ?? (current as any).obligatedBudget,
      budgetUtilized: patch.budgetUtilized ?? (current as any).budgetUtilized,
    };

    // Calculate derived fields
    const calculated = calculateFinancials(merged);

    // Merge calculated fields into patch
    Object.assign(patch, calculated);
  }

  // Apply patch with audit fields
  await ctx.db.patch(id, {
    ...patch,
    updatedAt: Date.now(),
    updatedBy: userId,
  } as any);
}

// ============================================================================
// CHANGE TRACKING UTILITIES
// ============================================================================

/**
 * Calculate which fields changed between old and new values
 *
 * @param oldValues - Previous record state
 * @param newValues - New record state
 * @returns Array of field names that changed
 */
export function calculateChangedFields(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): string[] {
  const changed: string[] = [];

  // Check all keys in newValues
  for (const key of Object.keys(newValues)) {
    if (oldValues[key] !== newValues[key]) {
      changed.push(key);
    }
  }

  // Check for removed fields (existed in old but not in new)
  for (const key of Object.keys(oldValues)) {
    if (!(key in newValues) && oldValues[key] !== undefined) {
      changed.push(key);
    }
  }

  return changed;
}

/**
 * Build a smart summary of important changes
 *
 * @param oldValues - Previous record state
 * @param newValues - New record state
 * @param changedFields - List of changed field names
 * @returns Summary object with key changes
 */
export function buildChangeSummary(
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  changedFields: string[]
): Record<string, any> {
  const summary: Record<string, any> = {};

  // Budget changes
  if (changedFields.includes("allocatedBudget") ||
      changedFields.includes("obligatedBudget") ||
      changedFields.includes("budgetUtilized")) {
    summary.budgetChanged = true;

    if (changedFields.includes("allocatedBudget")) {
      summary.oldAllocatedBudget = oldValues.allocatedBudget;
      summary.newAllocatedBudget = newValues.allocatedBudget;
    }

    if (changedFields.includes("budgetUtilized")) {
      summary.oldBudgetUtilized = oldValues.budgetUtilized;
      summary.newBudgetUtilized = newValues.budgetUtilized;
    }
  }

  // Status changes
  if (changedFields.includes("status")) {
    summary.statusChanged = true;
    summary.oldStatus = oldValues.status;
    summary.newStatus = newValues.status;
  }

  // Date changes
  if (changedFields.includes("dateStarted") ||
      changedFields.includes("targetDate") ||
      changedFields.includes("completionDate")) {
    summary.dateChanged = true;
  }

  // Location changes
  if (changedFields.includes("municipality") ||
      changedFields.includes("barangay") ||
      changedFields.includes("district")) {
    summary.locationChanged = true;
  }

  // Office changes
  if (changedFields.includes("implementingOffice")) {
    summary.officeChanged = true;
    summary.oldOffice = oldValues.implementingOffice;
    summary.newOffice = newValues.implementingOffice;
  }

  return summary;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that an implementing office exists and is active
 *
 * @param ctx - Query or mutation context
 * @param officeCode - Office code to validate
 * @throws Error if office doesn't exist or is inactive
 */
export async function validateImplementingOffice(
  ctx: QueryCtx | MutationCtx,
  officeCode: string
): Promise<void> {
  const agency = await ctx.db
    .query("implementingAgencies")
    .withIndex("code", (q) => q.eq("code", officeCode))
    .first();

  if (!agency) {
    throw new Error(`Implementing office "${officeCode}" does not exist`);
  }

  if (!agency.isActive) {
    throw new Error(`Implementing office "${officeCode}" is inactive and cannot be used`);
  }
}

/**
 * Validate breakdown status value
 *
 * @param status - Status value to validate
 * @throws Error if status is invalid
 */
export function validateBreakdownStatus(
  status: string | undefined
): void {
  if (!status) return; // Status is optional

  const validStatuses = ["completed", "delayed", "ongoing"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status "${status}". Must be one of: ${validStatuses.join(", ")}`
    );
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get active (non-deleted) breakdowns for a parent entity
 *
 * @param ctx - Query context
 * @param tableName - Breakdown table name
 * @param parentIdField - Field name for parent reference ("projectId" | "trustFundId")
 * @param parentId - Parent entity ID
 * @returns Array of active breakdown records
 */
export async function getActiveBreakdowns<
  T extends "govtProjectBreakdowns" | "trustFundBreakdowns"
>(
  ctx: QueryCtx,
  tableName: T,
  parentIdField: "projectId" | "trustFundId",
  parentId: Id<"projects"> | Id<"trustFunds">
): Promise<Array<any>> {
  const breakdowns = await ctx.db
    .query(tableName)
    .withIndex(parentIdField as any, (q: any) => q.eq(parentIdField, parentId))
    .filter((q: any) => q.neq(q.field("isDeleted"), true))
    .collect();

  return breakdowns;
}
