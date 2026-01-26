// convex/schema/trustFunds.ts

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const trustFundTables = {
  /**
   * Trust Funds Management
   * Tracks fund allocation, utilization, and project status for trust funds
   */
  trustFunds: defineTable({
    /**
     * Project Title (free-form text, no connection to other tables)
     * Can contain any characters - user enters project name directly
     */
    projectTitle: v.string(),
    
    /**
     * Office In-Charge (connects to implementing agencies OR departments)
     * Uses the same system as projects for consistency
     */
    officeInCharge: v.string(), // Code from implementingAgencies table
    
    /**
     * Optional department reference (auto-linked if office is a department)
     */
    departmentId: v.optional(v.id("departments")),
    
    /**
     * Date when the trust fund was received
     */
    dateReceived: v.optional(v.number()), // Timestamp - OPTIONAL
    
    /**
     * Financial tracking fields
     */
    received: v.number(), // Total amount received
    obligatedPR: v.optional(v.number()), // Obligated via Purchase Request
    utilized: v.number(), // Amount utilized
    balance: v.number(), // Remaining balance (auto-calculated)
    
    /**
     * Utilization rate (auto-calculated)
     * Formula: (utilized / received) * 100
     */
    utilizationRate: v.optional(v.number()),
    
    /**
     * Project Status
     * Tracks the current state of the trust fund project
     */
    status: v.optional(
      v.union(
        v.literal("active"), // Legacy value - kept for backward compatibility
        v.literal("not_available"),
        v.literal("not_yet_started"), // Legacy - hidden from UI, will be migrated to on_process
        v.literal("on_process"),
        v.literal("ongoing"),
        v.literal("completed")
      )
    ),
    
    /**
     * Optional fields
     */
    remarks: v.optional(v.string()),
    year: v.optional(v.number()), // Fiscal year
    fiscalYear: v.optional(v.number()),
    
    /**
     * Pin functionality
     */
    isPinned: v.optional(v.boolean()),
    pinnedAt: v.optional(v.number()),
    pinnedBy: v.optional(v.id("users")),
    
    /**
     * Trash system (soft delete)
     */
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),
    
    /**
     * Audit fields
     */
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("updatedAt", ["updatedAt"])
    .index("officeInCharge", ["officeInCharge"])
    .index("departmentId", ["departmentId"])
    .index("year", ["year"])
    .index("fiscalYear", ["fiscalYear"])
    .index("status", ["status"])
    .index("isPinned", ["isPinned"])
    .index("isDeleted", ["isDeleted"])
    .index("dateReceived", ["dateReceived"])
    .index("yearAndStatus", ["year", "status"])
    .index("departmentAndYear", ["departmentId", "year"]),
};