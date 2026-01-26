/**
 * Special Education Fund Breakdown Activity Logger
 *
 * Centralized activity logging for Special Education Fund Breakdown operations.
 * Tracks all changes with comprehensive metadata and change tracking.
 *
 * @module convex/lib/specialEducationFundBreakdownActivityLogger
 */

import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";
import { Doc } from "../_generated/dataModel";
import { calculateChangedFields, buildChangeSummary } from "./breakdownBase";

type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Configuration for Special Education Fund Breakdown activity logging
 */
export interface SpecialEducationFundBreakdownActivityLogConfig {
  action:
  | "created"
  | "updated"
  | "deleted"
  | "bulk_created"
  | "bulk_updated"
  | "bulk_deleted"
  | "viewed"
  | "exported"
  | "restored";
  breakdownId?: Id<"specialEducationFundBreakdowns">;
  breakdown?: Doc<"specialEducationFundBreakdowns"> | null;
  previousValues?: any;
  newValues?: any;
  batchId?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: "web_ui" | "bulk_import" | "api" | "system" | "migration";
  sessionId?: string;
}

/**
 * Log an activity for a Special Education Fund Breakdown
 *
 * @param ctx - Mutation context
 * @param userId - User performing the action
 * @param config - Activity configuration
 * @returns Activity record ID
 *
 * @example
 * await logSpecialEducationFundBreakdownActivity(ctx, userId, {
 *   action: "created",
 *   breakdownId: newBreakdownId,
 *   breakdown: newBreakdown,
 *   source: "web_ui"
 * });
 */
export async function logSpecialEducationFundBreakdownActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  config: SpecialEducationFundBreakdownActivityLogConfig
): Promise<Id<"specialEducationFundBreakdownActivities">> {
  // DEBUG LOG
  console.log(`[ACTIVITY LOG] SEF Breakdown: ${config.action}`, {
    id: config.breakdownId,
    batchId: config.batchId,
    source: config.source
  });

  const now = Date.now();

  // Get user details (snapshot at time of action)
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found for activity logging");
  }

  // Get department details if available
  let departmentName: string | undefined;
  if (user.departmentId) {
    const department = await ctx.db.get(user.departmentId);
    departmentName = department?.name;
  }

  // Extract contextual data from breakdown
  let projectName = "";
  let implementingOffice = "";
  let specialEducationFundId: Id<"specialEducationFunds"> | undefined;
  let municipality: string | undefined;
  let barangay: string | undefined;
  let district: string | undefined;

  if (config.breakdown) {
    projectName = config.breakdown.projectName;
    implementingOffice = config.breakdown.implementingOffice;
    specialEducationFundId = config.breakdown.specialEducationFundId;
    municipality = config.breakdown.municipality;
    barangay = config.breakdown.barangay;
    district = config.breakdown.district;
  } else if (config.previousValues) {
    // For deletes, extract from previousValues
    projectName = config.previousValues.projectName || "";
    implementingOffice = config.previousValues.implementingOffice || "";
    specialEducationFundId = config.previousValues.specialEducationFundId;
    municipality = config.previousValues.municipality;
    barangay = config.previousValues.barangay;
    district = config.previousValues.district;
  } else if (config.newValues) {
    // For creates, extract from newValues
    projectName = config.newValues.projectName || "";
    implementingOffice = config.newValues.implementingOffice || "";
    specialEducationFundId = config.newValues.specialEducationFundId;
    municipality = config.newValues.municipality;
    barangay = config.newValues.barangay;
    district = config.newValues.district;
  }

  // Calculate changed fields for updates
  let changedFields: string[] = [];
  let changeSummary: any = {};
  if (config.action === "updated" && config.previousValues && config.newValues) {
    changedFields = calculateChangedFields(config.previousValues, config.newValues);
    changeSummary = buildChangeSummary(config.previousValues, config.newValues, changedFields);
  }

  // Normalize role to match schema type
  const normalizedRole = user.role || "user";

  // Create activity record
  const activityId = await ctx.db.insert("specialEducationFundBreakdownActivities", {
    // Action
    action: config.action,

    // Target Record
    breakdownId: config.breakdownId,
    specialEducationFundId: specialEducationFundId,

    // Contextual Data
    projectName: projectName || "Unknown Project",
    implementingOffice: implementingOffice || "Unknown Office",
    municipality,
    barangay,
    district,

    // Change Tracking
    previousValues: config.previousValues ? JSON.stringify(config.previousValues) : undefined,
    newValues: config.newValues ? JSON.stringify(config.newValues) : undefined,
    changedFields: changedFields.length > 0 ? JSON.stringify(changedFields) : undefined,
    changeSummary: Object.keys(changeSummary).length > 0 ? changeSummary : undefined,

    // User Metadata
    performedBy: userId,
    performedByName: user.name || "Unknown",
    performedByEmail: user.email || "",
    performedByRole: normalizedRole as "super_admin" | "admin" | "inspector" | "user",
    performedByDepartmentId: user.departmentId,
    performedByDepartmentName: departmentName,

    // Technical Metadata
    timestamp: now,
    source: config.source,
    sessionId: config.sessionId,
    batchId: config.batchId,
    reason: config.reason,
    ipAddress: config.ipAddress,
    userAgent: config.userAgent,
  });

  return activityId;
}

/**
 * Log a bulk operation activity
 *
 * @param ctx - Mutation context
 * @param userId - User performing the action
 * @param action - Bulk action type
 * @param count - Number of records affected
 * @param batchId - Batch identifier
 * @param source - Source of the operation
 */
export async function logBulkBreakdownActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  action: "bulk_created" | "bulk_updated" | "bulk_deleted",
  count: number,
  batchId: string,
  source?: "web_ui" | "bulk_import" | "api" | "system" | "migration"
): Promise<void> {
  await logSpecialEducationFundBreakdownActivity(ctx, userId, {
    action,
    batchId,
    source,
    newValues: { count },
  });
}
