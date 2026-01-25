/**
 * Trust Fund Breakdowns Schema
 *
 * Defines the schema for Trust Fund breakdown records.
 * Trust Fund Breakdowns share the same base structure as Project Breakdowns
 * but link to Trust Funds as their parent entity.
 *
 * Key Differences from Project Breakdowns:
 * - Parent is a Trust Fund (not a Project)
 * - Status updates are manual (no auto-calculation from child breakdowns)
 * - No cascading status updates to parent Trust Fund
 *
 * @module convex/schema/trustFundBreakdowns
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { baseBreakdownSchema } from "./shared/baseBreakdown";

export const trustFundBreakdownTables = {
  trustFundBreakdowns: defineTable({
    // ============================================================================
    // PARENT REFERENCE (Trust Fund specific)
    // ============================================================================

    /**
     * Parent Trust Fund reference
     * Links this breakdown to a specific trust fund for tracking and reporting.
     *
     * When linked, this breakdown's data is associated with the parent trust fund
     * but does NOT automatically update the trust fund's status (manual updates only).
     */
    trustFundId: v.id("trustFunds"),

    // ============================================================================
    // SHARED BREAKDOWN FIELDS
    // ============================================================================
    ...baseBreakdownSchema,
  })
    // ============================================================================
    // INDEXES (matching Project Breakdown patterns)
    // ============================================================================

    // Parent relationship index (for efficient queries by trust fund)
    .index("trustFundId", ["trustFundId"])

    // Status-based queries
    .index("status", ["status"])
    .index("trustFundIdAndStatus", ["trustFundId", "status"])

    // Soft delete / trash system
    .index("isDeleted", ["isDeleted"])

    // Core field indexes
    .index("implementingOffice", ["implementingOffice"])
    .index("municipality", ["municipality"])
    .index("reportDate", ["reportDate"]),
};
