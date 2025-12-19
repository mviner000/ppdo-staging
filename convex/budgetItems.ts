// convex/budgetItems.ts
import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  recalculateBudgetItemMetrics,
  recalculateAllBudgetItems,
} from "./lib/budgetAggregation";

/**
 * Get all budget items for the current user
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // ✅ Return ALL budget items, not filtered by user
    const budgetItems = await ctx.db
      .query("budgetItems")
      .order("desc")
      .collect();

    return budgetItems;
  },
});

/**
 * Get a single budget item by ID
 */
export const get = query({
  args: { id: v.id("budgetItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const budgetItem = await ctx.db.get(args.id);
    
    if (!budgetItem) {
      throw new Error("Budget item not found");
    }

    if (budgetItem.createdBy !== userId) {
      throw new Error("Not authorized");
    }

    return budgetItem;
  },
});

/**
 * Get a single budget item by particulars (name)
 */
export const getByParticulars = query({
  args: { particulars: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // ✅ Return budget item by particulars for ANY user
    const budgetItem = await ctx.db
      .query("budgetItems")
      .withIndex("particulars", (q) => q.eq("particulars", args.particulars))
      .first();

    if (!budgetItem) {
      throw new Error("Budget item not found");
    }

    return budgetItem;
  },
});

/**
 * Get statistics for all budget items
 */
export const getStatistics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // ✅ Calculate statistics from ALL budget items
    const budgetItems = await ctx.db
      .query("budgetItems")
      .collect();

    if (budgetItems.length === 0) {
      return {
        totalAllocated: 0,
        totalUtilized: 0,
        averageUtilizationRate: 0,
        totalProjects: 0,
      };
    }

    const totalAllocated = budgetItems.reduce(
      (sum, item) => sum + item.totalBudgetAllocated,
      0
    );
    const totalUtilized = budgetItems.reduce(
      (sum, item) => sum + item.totalBudgetUtilized,
      0
    );
    const averageUtilizationRate =
      budgetItems.reduce((sum, item) => sum + item.utilizationRate, 0) /
      budgetItems.length;

    return {
      totalAllocated,
      totalUtilized,
      averageUtilizationRate,
      totalProjects: budgetItems.length,
    };
  },
});

/**
 * Create a new budget item
 * NOTE: Project counts are NOT provided - they will be calculated from child projects
 */
export const create = mutation({
  args: {
    particulars: v.string(),
    totalBudgetAllocated: v.number(),
    obligatedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    year: v.optional(v.number()),
    // STRICT 3 STATUS
    status: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("delayed"),
        v.literal("ongoing")
      )
    ),
    notes: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    fiscalYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    // Calculate utilization rate
    const utilizationRate =
      args.totalBudgetAllocated > 0
        ? (args.totalBudgetUtilized / args.totalBudgetAllocated) * 100
        : 0;

    // Create budget item with project counts initialized to 0
    const budgetItemId = await ctx.db.insert("budgetItems", {
      particulars: args.particulars,
      totalBudgetAllocated: args.totalBudgetAllocated,
      obligatedBudget: args.obligatedBudget,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate,
      // Initialize project counts to 0 - will be calculated when projects are added
      projectCompleted: 0,
      projectDelayed: 0,
      projectsOnTrack: 0,
      year: args.year,
      status: args.status,
      notes: args.notes,
      departmentId: args.departmentId,
      fiscalYear: args.fiscalYear,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return budgetItemId;
  },
});

/**
 * Update an existing budget item
 * NOTE: Project counts are NOT updated here - they are calculated from child projects
 */
export const update = mutation({
  args: {
    id: v.id("budgetItems"),
    particulars: v.string(),
    totalBudgetAllocated: v.number(),
    obligatedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    year: v.optional(v.number()),
    // STRICT 3 STATUS
    status: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("delayed"),
        v.literal("ongoing")
      )
    ),
    notes: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    fiscalYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Budget item not found");
    }

    if (existing.createdBy !== userId) {
      throw new Error("Not authorized");
    }

    const now = Date.now();
    
    // Calculate utilization rate
    const utilizationRate =
      args.totalBudgetAllocated > 0
        ? (args.totalBudgetUtilized / args.totalBudgetAllocated) * 100
        : 0;

    // Update budget item - do NOT touch project counts
    await ctx.db.patch(args.id, {
      particulars: args.particulars,
      totalBudgetAllocated: args.totalBudgetAllocated,
      obligatedBudget: args.obligatedBudget,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate,
      year: args.year,
      status: args.status,
      notes: args.notes,
      departmentId: args.departmentId,
      fiscalYear: args.fiscalYear,
      updatedAt: now,
      updatedBy: userId,
    });

    return args.id;
  },
});

/**
 * Delete a budget item
 */
export const remove = mutation({
  args: { id: v.id("budgetItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Budget item not found");
    }

    if (existing.createdBy !== userId) {
      throw new Error("Not authorized");
    }

    // Check if there are any projects linked to this budget item
    const projects = await ctx.db
      .query("projects")
      .withIndex("budgetItemId", (q) => q.eq("budgetItemId", args.id))
      .collect();

    if (projects.length > 0) {
      throw new Error(
        `Cannot delete budget item with ${projects.length} linked project(s). Delete the projects first.`
      );
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Toggle pin status for a budget item
 */
export const togglePin = mutation({
  args: {
    id: v.id("budgetItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Budget item not found");
    }

    if (existing.createdBy !== userId) {
      throw new Error("Not authorized");
    }

    const now = Date.now();
    const newPinnedState = !existing.isPinned;

    await ctx.db.patch(args.id, {
      isPinned: newPinnedState,
      pinnedAt: newPinnedState ? now : undefined,
      pinnedBy: newPinnedState ? userId : undefined,
      updatedAt: now,
      updatedBy: userId,
    });

    return args.id;
  },
});

/**
 * INTERNAL: Recalculate metrics for a specific budget item
 * This is called automatically by project mutations
 */
export const recalculateMetrics = internalMutation({
  args: {
    budgetItemId: v.id("budgetItems"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await recalculateBudgetItemMetrics(
      ctx,
      args.budgetItemId,
      args.userId
    );
  },
});

/**
 * MANUAL: Recalculate all budget item metrics
 * Use this for one-time sync of existing data
 */
export const recalculateAllMetrics = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const results = await recalculateAllBudgetItems(ctx, userId);
    
    return {
      message: `Recalculated ${results.length} budget items`,
      results,
    };
  },
});