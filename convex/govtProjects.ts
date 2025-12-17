// convex/govtProjects.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateAggregation, getGovtProjectSubtotalConfig } from "./lib/aggregationUtils";

// ============================================================================
// PROJECT BREAKDOWNS - CRUD OPERATIONS
// ============================================================================

/**
 * Create a single project breakdown row
 * Only projectName and implementingOffice are required
 */
export const createProjectBreakdown = mutation({
  args: {
    // MANDATORY
    projectName: v.string(),
    implementingOffice: v.string(),

    // OPTIONAL - ALL OTHER FIELDS
    projectTitle: v.optional(v.string()),
    allocatedBudget: v.optional(v.number()),
    obligatedBudget: v.optional(v.number()),
    budgetUtilized: v.optional(v.number()),
    utilizationRate: v.optional(v.number()),
    balance: v.optional(v.number()),
    dateStarted: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    completionDate: v.optional(v.number()),
    projectAccomplishment: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("Completed"),
      v.literal("On-Going"),
      v.literal("On-Hold"),
      v.literal("Cancelled"),
      v.literal("Delayed")
    )),
    remarks: v.optional(v.string()),
    district: v.optional(v.string()),
    municipality: v.optional(v.string()),
    barangay: v.optional(v.string()),
    reportDate: v.optional(v.number()),
    batchId: v.optional(v.string()),
    fundSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    const breakdownId = await ctx.db.insert("govtProjectBreakdowns", {
      projectName: args.projectName,
      implementingOffice: args.implementingOffice,
      projectTitle: args.projectTitle,
      allocatedBudget: args.allocatedBudget,
      obligatedBudget: args.obligatedBudget,
      budgetUtilized: args.budgetUtilized,
      utilizationRate: args.utilizationRate,
      balance: args.balance,
      dateStarted: args.dateStarted,
      targetDate: args.targetDate,
      completionDate: args.completionDate,
      projectAccomplishment: args.projectAccomplishment,
      status: args.status,
      remarks: args.remarks,
      district: args.district,
      municipality: args.municipality,
      barangay: args.barangay,
      reportDate: args.reportDate,
      batchId: args.batchId,
      fundSource: args.fundSource,
      createdBy: userId,
      createdAt: now,
    });

    return { breakdownId };
  },
});

/**
 * Update a project breakdown row
 */
export const updateProjectBreakdown = mutation({
  args: {
    breakdownId: v.id("govtProjectBreakdowns"),
    
    // All fields optional for partial updates
    projectName: v.optional(v.string()),
    implementingOffice: v.optional(v.string()),
    projectTitle: v.optional(v.string()),
    allocatedBudget: v.optional(v.number()),
    obligatedBudget: v.optional(v.number()),
    budgetUtilized: v.optional(v.number()),
    utilizationRate: v.optional(v.number()),
    balance: v.optional(v.number()),
    dateStarted: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    completionDate: v.optional(v.number()),
    projectAccomplishment: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("Completed"),
      v.literal("On-Going"),
      v.literal("On-Hold"),
      v.literal("Cancelled"),
      v.literal("Delayed")
    )),
    remarks: v.optional(v.string()),
    district: v.optional(v.string()),
    municipality: v.optional(v.string()),
    barangay: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { breakdownId, ...updates } = args;
    
    await ctx.db.patch(breakdownId, {
      ...updates,
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    return { success: true };
  },
});

/**
 * Delete a project breakdown row
 */
export const deleteProjectBreakdown = mutation({
  args: {
    breakdownId: v.id("govtProjectBreakdowns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.breakdownId);

    return { success: true };
  },
});

/**
 * Bulk create project breakdowns (for Excel import)
 */
export const bulkCreateBreakdowns = mutation({
  args: {
    breakdowns: v.array(v.object({
      projectName: v.string(),
      implementingOffice: v.string(),
      projectTitle: v.optional(v.string()),
      allocatedBudget: v.optional(v.number()),
      obligatedBudget: v.optional(v.number()),
      budgetUtilized: v.optional(v.number()),
      utilizationRate: v.optional(v.number()),
      balance: v.optional(v.number()),
      dateStarted: v.optional(v.number()),
      targetDate: v.optional(v.number()),
      completionDate: v.optional(v.number()),
      projectAccomplishment: v.optional(v.number()),
      status: v.optional(v.union(
        v.literal("Completed"),
        v.literal("On-Going"),
        v.literal("On-Hold"),
        v.literal("Cancelled"),
        v.literal("Delayed")
      )),
      remarks: v.optional(v.string()),
      district: v.optional(v.string()),
      municipality: v.optional(v.string()),
      barangay: v.optional(v.string()),
      reportDate: v.optional(v.number()),
      batchId: v.optional(v.string()),
      fundSource: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const insertedIds = [];

    for (const breakdown of args.breakdowns) {
      const id = await ctx.db.insert("govtProjectBreakdowns", {
        ...breakdown,
        createdBy: userId,
        createdAt: now,
      });
      insertedIds.push(id);
    }

    return { count: insertedIds.length, ids: insertedIds };
  },
});

// ============================================================================
// AGGREGATION OPERATIONS - SUBTOTAL CALCULATIONS
// ============================================================================

/**
 * Calculate subtotal for a specific project + implementing office
 */
export const calculateProjectSubtotal = mutation({
  args: {
    projectName: v.string(),
    implementingOffice: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all breakdown rows for this project + office
    const breakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .withIndex("projectNameAndOffice", (q) =>
        q.eq("projectName", args.projectName).eq("implementingOffice", args.implementingOffice)
      )
      .collect();

    if (breakdowns.length === 0) {
      throw new Error("No breakdowns found for this project and office");
    }

    // Use generic aggregation utility
    const config = getGovtProjectSubtotalConfig(args.projectName, args.implementingOffice);
    const result = await calculateAggregation(ctx, breakdowns, config, userId);

    return result;
  },
});

/**
 * Recalculate all subtotals (useful after bulk import or updates)
 */
export const recalculateAllSubtotals = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all unique project + office combinations
    const allBreakdowns = await ctx.db.query("govtProjectBreakdowns").collect();
    
    const uniqueCombinations = new Map<string, { projectName: string; implementingOffice: string }>();
    
    allBreakdowns.forEach((b) => {
      const key = `${b.projectName}|||${b.implementingOffice}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, {
          projectName: b.projectName,
          implementingOffice: b.implementingOffice,
        });
      }
    });

    const results = [];

    // Calculate subtotal for each combination
    for (const combo of uniqueCombinations.values()) {
      const breakdowns = allBreakdowns.filter(
        (b) => b.projectName === combo.projectName && b.implementingOffice === combo.implementingOffice
      );

      const config = getGovtProjectSubtotalConfig(combo.projectName, combo.implementingOffice);
      const result = await calculateAggregation(ctx, breakdowns, config, userId);
      results.push(result);
    }

    return { processed: results.length, results };
  },
});

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

/**
 * Get all breakdown rows for a specific project
 */
export const getProjectBreakdowns = query({
  args: {
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const breakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .withIndex("projectName", (q) => q.eq("projectName", args.projectName))
      .collect();

    return breakdowns.sort((a, b) => {
      if (a.implementingOffice !== b.implementingOffice) {
        return a.implementingOffice.localeCompare(b.implementingOffice);
      }
      return (a.dateStarted || 0) - (b.dateStarted || 0);
    });
  },
});

/**
 * Get all subtotals for a specific project
 */
export const getProjectSubtotals = query({
  args: {
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const aggregations = await ctx.db
      .query("aggregations")
      .withIndex("entityType", (q) => q.eq("entityType", "govtProjects"))
      .filter((q) => q.eq(q.field("groupingKeys.key1"), args.projectName))
      .collect();

    return aggregations.sort((a, b) => {
      const officeA = a.groupingKeys.key2 || "";
      const officeB = b.groupingKeys.key2 || "";
      return officeA.localeCompare(officeB);
    });
  },
});

/**
 * Get all breakdown rows (for main data table)
 */
export const getAllBreakdowns = query({
  args: {},
  handler: async (ctx) => {
    const breakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .collect();

    return breakdowns.sort((a, b) => {
      if (a.projectName !== b.projectName) {
        return a.projectName.localeCompare(b.projectName);
      }
      if (a.implementingOffice !== b.implementingOffice) {
        return a.implementingOffice.localeCompare(b.implementingOffice);
      }
      return (a.dateStarted || 0) - (b.dateStarted || 0);
    });
  },
});

/**
 * Get all aggregations (optionally filtered)
 */
export const getAllAggregations = query({
  args: {
    entityType: v.optional(v.string()),
    aggregationType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.entityType) {
      // If no entityType specified, return all aggregations
      const aggregations = await ctx.db.query("aggregations").collect();
      
      if (args.aggregationType) {
        return aggregations.filter((a) => a.aggregationType === args.aggregationType);
      }
      
      return aggregations;
    }

    // If entityType is specified, use the index
    const aggregations = await ctx.db
      .query("aggregations")
      .withIndex("entityType", (q) => q.eq("entityType", args.entityType!))
      .collect();

    if (args.aggregationType) {
      return aggregations.filter((a) => a.aggregationType === args.aggregationType);
    }

    return aggregations;
  },
});

/**
 * Get statistics grouped by implementing office
 */
export const getStatsByOffice = query({
  args: {},
  handler: async (ctx) => {
    const allBreakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .collect();

    const stats: Record<string, { 
      count: number; 
      totalAllocated: number;
      totalUtilized: number;
      avgAccomplishment: number;
    }> = {};
    
    allBreakdowns.forEach((record) => {
      const office = record.implementingOffice;
      if (!stats[office]) {
        stats[office] = { 
          count: 0, 
          totalAllocated: 0,
          totalUtilized: 0,
          avgAccomplishment: 0
        };
      }
      stats[office].count += 1;
      stats[office].totalAllocated += record.allocatedBudget || 0;
      stats[office].totalUtilized += record.budgetUtilized || 0;
      stats[office].avgAccomplishment += record.projectAccomplishment || 0;
    });

    Object.keys(stats).forEach(office => {
      stats[office].avgAccomplishment = stats[office].avgAccomplishment / stats[office].count;
    });

    return stats;
  },
});