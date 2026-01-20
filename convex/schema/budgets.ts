// convex/schema/budgets.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const budgetTables = {
  /**
   * Budget Items.
   * Now linked to departments for better organization.
   * 
   * 🆕 IMPORTANT: The `particulars` field now references codes from the `budgetParticulars` table.
   * This ensures data consistency and allows dynamic management of budget categories.
   */
  budgetItems: defineTable({
    /**
     * 🆕 CHANGED: Now references a code from budgetParticulars table
     * Example: "GAD", "LDRRMP", "LCCAP"
     * 
     * MIGRATION NOTE: If you have existing data, ensure all values match
     * codes in the budgetParticulars table, or they will be rejected on update.
     */
    particulars: v.string(),
    
    totalBudgetAllocated: v.number(),
    
    /**
     * Obligated budget amount (optional)
     * Represents the committed/obligated portion of the allocated budget
     */
    obligatedBudget: v.optional(v.number()),
    
    totalBudgetUtilized: v.number(),
    utilizationRate: v.number(),
    projectCompleted: v.number(),
    projectDelayed: v.number(),
    projectsOnTrack: v.number(),
    
    /**
     * Year for this budget item (optional)
     */
    year: v.optional(v.number()),
    
    /**
     * Status of the budget item (optional)
     * STRICT 3 OPTIONS: completed, delayed, ongoing
     */
    status: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("delayed"),
        v.literal("ongoing")
      )
    ),
    
    /**
     * 🆕 AUTO-CALCULATION FLAG
     * When TRUE (default): totalBudgetUtilized is auto-calculated from child projects
     * When FALSE: totalBudgetUtilized can be manually set and won't be overridden
     * 
     * Use Cases:
     * - Historical data (2024 and earlier): Set to FALSE, enter manual values
     * - Current/Future data: Set to TRUE for automatic aggregation
     * - Mixed scenarios: Can be toggled per budget item as needed
     */
    autoCalculateBudgetUtilized: v.optional(v.boolean()),
    
    /**
     * Whether this budget item is pinned
     */
    isPinned: v.optional(v.boolean()),
    
    /**
     * Timestamp when pinned
     */
    pinnedAt: v.optional(v.number()),
    
    /**
     * User who pinned this item
     */
    pinnedBy: v.optional(v.id("users")),
    
    /**
     * Department responsible for this budget item
     */
    departmentId: v.optional(v.id("departments")),
    
    /**
     * Fiscal year for this budget (e.g., 2024, 2025)
     */
    fiscalYear: v.optional(v.number()),
    
    // [NEW] Trash System Fields
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("updatedAt", ["updatedAt"])
    .index("particulars", ["particulars"]) // ✅ Index for fast particular lookups
    .index("departmentId", ["departmentId"])
    .index("fiscalYear", ["fiscalYear"])
    .index("departmentAndYear", ["departmentId", "fiscalYear"])
    .index("year", ["year"])
    .index("status", ["status"])
    .index("yearAndStatus", ["year", "status"])
    .index("isPinned", ["isPinned"])
    .index("pinnedAt", ["pinnedAt"])
    .index("isDeleted", ["isDeleted"])
    // 🆕 Index for auto-calculation flag
    .index("autoCalculate", ["autoCalculateBudgetUtilized"]),

  /**
   * Obligations.
   */
  obligations: defineTable({
    projectId: v.id("projects"),
    amount: v.number(),
    name: v.string(),
    email: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("projectId", ["projectId"])
    .index("type", ["type"])
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("projectAndType", ["projectId", "type"]),
};