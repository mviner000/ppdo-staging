/**
 * Special Health Fund Breakdowns Schema
 *
 * Defines the schema for Special Health Fund breakdown records.
 * Special Health Fund Breakdowns share the same base structure as Project Breakdowns
 * but link to Special Health Funds as their parent entity.
 *
 * Key Differences from Project Breakdowns:
 * - Parent is a Special Health Fund (not a Project)
 * - Status updates are manual (no auto-calculation from child breakdowns)
 * - No cascading status updates to parent Special Health Fund
 *
 * @module convex/schema/specialHealthFundBreakdowns
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { baseBreakdownSchema } from "./shared/baseBreakdown";

export const specialHealthFundBreakdownTables = {
    specialHealthFundBreakdowns: defineTable({
        // ============================================================================
        // PARENT REFERENCE (Special Health Fund specific)
        // ============================================================================

        /**
         * Parent Special Health Fund reference
         * Links this breakdown to a specific special health fund for tracking and reporting.
         *
         * When linked, this breakdown's data is associated with the parent special health fund
         * but does NOT automatically update the special health fund's status (manual updates only).
         */
        specialHealthFundId: v.id("specialHealthFunds"),

        // ============================================================================
        // SHARED BREAKDOWN FIELDS
        // ============================================================================
        ...baseBreakdownSchema,
    })
        // ============================================================================
        // INDEXES (matching Project Breakdown patterns)
        // ============================================================================

        // Parent relationship index (for efficient queries by special health fund)
        .index("specialHealthFundId", ["specialHealthFundId"])

        // Status-based queries
        .index("status", ["status"])
        .index("specialHealthFundIdAndStatus", ["specialHealthFundId", "status"])

        // Soft delete / trash system
        .index("isDeleted", ["isDeleted"])

        // Core field indexes
        .index("implementingOffice", ["implementingOffice"])
        .index("municipality", ["municipality"])
        .index("reportDate", ["reportDate"]),
};
