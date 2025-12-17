// convex/schema/aggregations.ts

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * GENERIC AGGREGATION TABLE
 * 
 * This table stores subtotals, totals, and aggregations for ANY module.
 * It's designed to be reusable across govtProjects, budgetItems, expenses, etc.
 * 
 * Example use cases:
 * - Government project subtotals by implementing office
 * - Budget item category totals
 * - Monthly expense summaries
 * - Department-level aggregations
 * 
 * Benefits:
 * - One table for all aggregations (no need for module-specific subtotal tables)
 * - Flexible grouping (up to 5 grouping keys)
 * - Multiple aggregation functions (sum, avg, min, max, count)
 * - Support for hierarchical aggregations (subtotal → total → grand total)
 */
export const aggregationTables = {
  aggregations: defineTable({
    // ============================================================================
    // AGGREGATION IDENTITY
    // ============================================================================
    
    /**
     * Entity Type: Which module/table is this aggregating?
     * Examples: "govtProjects", "budgetItems", "expenses", "revenues"
     */
    entityType: v.string(),

    /**
     * Aggregation Type: What kind of aggregation is this?
     * Examples: "subtotal", "total", "grandTotal", "monthly", "quarterly"
     */
    aggregationType: v.string(),

    // ============================================================================
    // GROUPING KEYS (Flexible for any grouping combination)
    // ============================================================================
    
    /**
     * Grouping Keys: Define what this aggregation is grouped by
     * 
     * Examples:
     * - Government Projects Subtotal:
     *   { key1: "Construction of", key2: "TPH" }
     * 
     * - Budget Items Category Total:
     *   { key1: "Office Supplies", key2: "HR Department" }
     * 
     * - Monthly Expense Summary:
     *   { key1: "2024", key2: "03", key3: "Engineering" }
     */
    groupingKeys: v.object({
      key1: v.optional(v.string()),
      key2: v.optional(v.string()),
      key3: v.optional(v.string()),
      key4: v.optional(v.string()),
      key5: v.optional(v.string()),
    }),

    /**
     * Display Label: Human-readable label for UI
     * Example: "Construction of - TPH (Subtotal)"
     */
    displayLabel: v.optional(v.string()),

    // ============================================================================
    // AGGREGATED NUMERIC VALUES (Up to 10 different aggregations)
    // ============================================================================
    
    /**
     * Aggregated Values: Stores calculated numeric results
     * 
     * Example for Government Projects:
     * {
     *   value1: 80000,  // sum_allocatedBudget
     *   value2: 55000,  // sum_obligatedBudget
     *   value3: 43000,  // sum_budgetUtilized
     *   value4: 25000,  // sum_balance
     *   value5: 78.18   // avg_utilizationRate
     * }
     */
    aggregatedValues: v.object({
      value1: v.optional(v.number()),
      value2: v.optional(v.number()),
      value3: v.optional(v.number()),
      value4: v.optional(v.number()),
      value5: v.optional(v.number()),
      value6: v.optional(v.number()),
      value7: v.optional(v.number()),
      value8: v.optional(v.number()),
      value9: v.optional(v.number()),
      value10: v.optional(v.number()),
    }),

    /**
     * Named Aggregations: Same data but with descriptive names for easy access
     * 
     * Example:
     * {
     *   "sum_allocatedBudget": 80000,
     *   "sum_obligatedBudget": 55000,
     *   "sum_budgetUtilized": 43000,
     *   "sum_balance": 25000,
     *   "avg_utilizationRate": 78.18
     * }
     */
    namedAggregations: v.optional(v.any()),

    // ============================================================================
    // METADATA
    // ============================================================================
    
    /**
     * Row Count: Number of records that were aggregated
     * Example: 4 (if aggregating 4 breakdown rows)
     */
    rowCount: v.number(),

    /**
     * Parent ID: Optional reference to a parent record
     * Example: Link to a main project record
     */
    parentId: v.optional(v.string()),

    /**
     * Hierarchy Level: Supports multi-level aggregations
     * - Level 1: Subtotals (e.g., per implementing office)
     * - Level 2: Category totals (e.g., per project)
     * - Level 3: Grand totals (e.g., all projects)
     */
    hierarchyLevel: v.optional(v.number()),

    // ============================================================================
    // SYSTEM FIELDS
    // ============================================================================
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("entityType", ["entityType"])
    .index("aggregationType", ["aggregationType"])
    .index("entityTypeAndAggregationType", ["entityType", "aggregationType"])
    .index("parentId", ["parentId"])
    .index("hierarchyLevel", ["hierarchyLevel"]),
};