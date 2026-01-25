// convex/schema/govtProjectBreakdowns.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { baseBreakdownSchema } from "./shared/baseBreakdown";

export const govtProjectBreakdownTables = {
  govtProjectBreakdowns: defineTable({
    // ============================================================================
    // PARENT REFERENCE (Project specific)
    // ============================================================================

    // 🆕 PARENT PROJECT (OPTIONAL)
    // Links this breakdown to a specific project for aggregation.
    // When linked, this breakdown's status contributes to parent's metrics
    // and triggers automatic status recalculation on the parent project.
    projectId: v.optional(v.id("projects")),

    // ============================================================================
    // SHARED BREAKDOWN FIELDS
    // ============================================================================
    ...baseBreakdownSchema,
  })
    .index("projectName", ["projectName"])
    .index("implementingOffice", ["implementingOffice"])
    .index("status", ["status"])
    .index("projectNameAndOffice", ["projectName", "implementingOffice"])
    .index("reportDate", ["reportDate"])
    .index("municipality", ["municipality"])
    // 🆕 CRITICAL INDEXES FOR AGGREGATION
    .index("isDeleted", ["isDeleted"])
    .index("projectId", ["projectId"])
    .index("projectIdAndStatus", ["projectId", "status"]),
};