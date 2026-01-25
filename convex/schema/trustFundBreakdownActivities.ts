/**
 * Trust Fund Breakdown Activities Schema
 *
 * Activity log for all Trust Fund Breakdown operations.
 * Tracks create, update, delete, and restore actions with comprehensive change tracking.
 *
 * @module convex/schema/trustFundBreakdownActivities
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const trustFundBreakdownActivityTables = {
  trustFundBreakdownActivities: defineTable({
    // ============================================================================
    // ACTION TYPE
    // ============================================================================
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("bulk_created"),
      v.literal("bulk_updated"),
      v.literal("bulk_deleted"),
      v.literal("viewed"),
      v.literal("exported"),
      v.literal("restored")
    ),

    // ============================================================================
    // TARGET RECORD
    // ============================================================================

    /**
     * Reference to the breakdown record
     * May be undefined for bulk operations affecting multiple records
     */
    breakdownId: v.optional(v.id("trustFundBreakdowns")),

    /**
     * Parent Trust Fund reference (snapshot)
     */
    trustFundId: v.optional(v.id("trustFunds")),

    // ============================================================================
    // CONTEXTUAL DATA (Snapshot at time of action)
    // ============================================================================

    /**
     * Project name from the breakdown
     */
    projectName: v.string(),

    /**
     * Implementing office code from the breakdown
     */
    implementingOffice: v.string(),

    /**
     * Municipality (optional)
     */
    municipality: v.optional(v.string()),

    /**
     * Barangay (optional)
     */
    barangay: v.optional(v.string()),

    /**
     * District (optional)
     */
    district: v.optional(v.string()),

    // ============================================================================
    // CHANGE TRACKING
    // ============================================================================

    /**
     * Previous record state (JSON string)
     * Captures the complete state before the change
     */
    previousValues: v.optional(v.string()),

    /**
     * New record state (JSON string)
     * Captures the complete state after the change
     */
    newValues: v.optional(v.string()),

    /**
     * List of changed field names (JSON array)
     * e.g., ["budgetUtilized", "status", "remarks"]
     */
    changedFields: v.optional(v.string()),

    /**
     * Smart summary of important changes
     * Quick reference for key field changes
     */
    changeSummary: v.optional(
      v.object({
        budgetChanged: v.optional(v.boolean()),
        statusChanged: v.optional(v.boolean()),
        dateChanged: v.optional(v.boolean()),
        locationChanged: v.optional(v.boolean()),
        officeChanged: v.optional(v.boolean()),

        // Budget change details
        oldAllocatedBudget: v.optional(v.number()),
        newAllocatedBudget: v.optional(v.number()),
        oldBudgetUtilized: v.optional(v.number()),
        newBudgetUtilized: v.optional(v.number()),

        // Status change details
        oldStatus: v.optional(v.string()),
        newStatus: v.optional(v.string()),

        // Office change details
        oldOffice: v.optional(v.string()),
        newOffice: v.optional(v.string()),
      })
    ),

    // ============================================================================
    // USER METADATA (Snapshot at time of action)
    // ============================================================================

    /**
     * User who performed the action
     */
    performedBy: v.id("users"),

    /**
     * User's name at time of action
     */
    performedByName: v.string(),

    /**
     * User's email at time of action
     */
    performedByEmail: v.string(),

    /**
     * User's role at time of action
     */
    performedByRole: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("inspector"),
        v.literal("user")
      )
    ),

    /**
     * User's department at time of action
     */
    performedByDepartmentId: v.optional(v.id("departments")),

    /**
     * User's department name at time of action
     */
    performedByDepartmentName: v.optional(v.string()),

    // ============================================================================
    // TECHNICAL METADATA
    // ============================================================================

    /**
     * When the action occurred
     */
    timestamp: v.number(),

    /**
     * Source of the action
     */
    source: v.optional(
      v.union(
        v.literal("web_ui"),
        v.literal("bulk_import"),
        v.literal("api"),
        v.literal("system"),
        v.literal("migration")
      )
    ),

    /**
     * Session ID for correlating related actions
     */
    sessionId: v.optional(v.string()),

    /**
     * Batch ID for bulk operations
     * Links multiple operations performed together
     */
    batchId: v.optional(v.string()),

    /**
     * Optional reason for the action
     * Particularly useful for deletions
     */
    reason: v.optional(v.string()),

    /**
     * IP address of the user
     */
    ipAddress: v.optional(v.string()),

    /**
     * User agent string
     */
    userAgent: v.optional(v.string()),
  })
    // ============================================================================
    // INDEXES
    // ============================================================================

    // Query by breakdown
    .index("breakdownId", ["breakdownId"])

    // Query by trust fund
    .index("trustFundId", ["trustFundId"])

    // Query by user
    .index("performedBy", ["performedBy"])

    // Query by timestamp (chronological order)
    .index("timestamp", ["timestamp"])

    // Query by action type
    .index("action", ["action"])

    // Query by batch (bulk operations)
    .index("batchId", ["batchId"])

    // Composite: breakdown + timestamp (for breakdown history)
    .index("breakdownIdAndTimestamp", ["breakdownId", "timestamp"])

    // Composite: trust fund + timestamp (for fund-level activity)
    .index("trustFundIdAndTimestamp", ["trustFundId", "timestamp"]),
};
