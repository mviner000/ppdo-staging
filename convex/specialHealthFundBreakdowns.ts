/**
 * Special Health Fund Breakdowns API
 *
 * CRUD operations for Special Health Fund breakdown records.
 * Uses shared breakdown logic from breakdownBase.ts.
 *
 * Key Differences from Project Breakdowns:
 * - Parent is a Special Health Fund (not a Project)
 * - Status updates are MANUAL (no auto-calculation from breakdowns)
 * - NO cascading status updates to parent Special Health Fund
 *
 * @module convex/specialHealthFundBreakdowns
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  calculateFinancials,
  softDeleteBreakdown,
  restoreBreakdown,
  validateImplementingOffice,
  validateBreakdownStatus,
  getActiveBreakdowns,
} from "./lib/breakdownBase";
import { logspecialHealthFundBreakdownActivity } from "./lib/specialHealthFundBreakdownActivityLogger";
import { internal } from "./_generated/api";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single Special Health Fund Breakdown by ID
 */
export const getBreakdown = query({
  args: { id: v.id("specialHealthFundBreakdowns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get all active Special Health Fund Breakdowns for a specific Special Health Fund
 */
export const getBreakdowns = query({
  args: {
    specialHealthFundId: v.id("specialHealthFunds"),
    status: v.optional(v.string()),
    municipality: v.optional(v.string()),
    implementingOffice: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("specialHealthFundBreakdowns")
      .withIndex("specialHealthFundId", (q) => q.eq("specialHealthFundId", args.specialHealthFundId))
      .filter((q) => q.neq(q.field("isDeleted"), true));

    const breakdowns = await query.collect();

    // Apply optional filters
    let filtered = breakdowns;

    if (args.status) {
      filtered = filtered.filter((b) => b.status === args.status);
    }

    if (args.municipality) {
      filtered = filtered.filter((b) => b.municipality === args.municipality);
    }

    if (args.implementingOffice) {
      filtered = filtered.filter((b) => b.implementingOffice === args.implementingOffice);
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get breakdown statistics for a Special Health Fund
 */
export const getBreakdownStats = query({
  args: {
    specialHealthFundId: v.id("specialHealthFunds"),
  },
  handler: async (ctx, args) => {
    const breakdowns = await getActiveBreakdowns(
      ctx,
      "specialHealthFundBreakdowns",
      "specialHealthFundId",
      args.specialHealthFundId
    );

    let totalAllocated = 0;
    let totalUtilized = 0;
    let totalObligated = 0;
    const statusCounts = { completed: 0, delayed: 0, ongoing: 0 };

    for (const breakdown of breakdowns) {
      totalAllocated += breakdown.allocatedBudget || 0;
      totalUtilized += breakdown.budgetUtilized || 0;
      totalObligated += breakdown.obligatedBudget || 0;

      if (breakdown.status === "completed") statusCounts.completed++;
      else if (breakdown.status === "delayed") statusCounts.delayed++;
      else if (breakdown.status === "ongoing") statusCounts.ongoing++;
    }

    const utilizationRate =
      totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

    return {
      totalBreakdowns: breakdowns.length,
      totalAllocated,
      totalUtilized,
      totalObligated,
      utilizationRate,
      statusCounts,
    };
  },
});

/**
 * Get trashed (soft-deleted) breakdowns
 */
export const getTrash = query({
  args: {
    specialHealthFundId: v.optional(v.id("specialHealthFunds")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("specialHealthFundBreakdowns")
      .withIndex("isDeleted", (q) => q.eq("isDeleted", true));

    const trashed = await query.collect();

    // Filter by Special Health Fund if specified
    if (args.specialHealthFundId) {
      return trashed.filter((b) => b.specialHealthFundId === args.specialHealthFundId);
    }

    return trashed.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  },
});

// ============================================================================
// MUTATIONS - CREATE
// ============================================================================

/**
 * Create a new Special Health Fund Breakdown
 */
export const createBreakdown = mutation({
  args: {
    specialHealthFundId: v.id("specialHealthFunds"),
    projectName: v.string(),
    implementingOffice: v.string(),
    projectTitle: v.optional(v.string()),
    allocatedBudget: v.optional(v.number()),
    obligatedBudget: v.optional(v.number()),
    budgetUtilized: v.optional(v.number()),
    status: v.optional(v.string()),
    projectAccomplishment: v.optional(v.number()),
    dateStarted: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    completionDate: v.optional(v.number()),
    municipality: v.optional(v.string()),
    barangay: v.optional(v.string()),
    district: v.optional(v.string()),
    remarks: v.optional(v.string()),
    reportDate: v.optional(v.number()),
    fundSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate Special Health Fund exists
    const specialHealthFund = await ctx.db.get(args.specialHealthFundId);
    if (!specialHealthFund) {
      throw new Error("Special Health Fund not found");
    }

    // Validate implementing office
    await validateImplementingOffice(ctx, args.implementingOffice);

    // Validate status if provided
    if (args.status) {
      validateBreakdownStatus(args.status);
    }

    // Calculate derived financial fields
    const calculatedFinancials = calculateFinancials({
      allocatedBudget: args.allocatedBudget,
      obligatedBudget: args.obligatedBudget,
      budgetUtilized: args.budgetUtilized,
    });

    // Create breakdown record
    const breakdownId = await ctx.db.insert("specialHealthFundBreakdowns", {
      specialHealthFundId: args.specialHealthFundId,
      projectName: args.projectName,
      implementingOffice: args.implementingOffice,
      projectTitle: args.projectTitle,
      allocatedBudget: args.allocatedBudget,
      obligatedBudget: args.obligatedBudget,
      budgetUtilized: args.budgetUtilized,
      balance: calculatedFinancials.balance,
      utilizationRate: calculatedFinancials.utilizationRate,
      status: args.status as "completed" | "delayed" | "ongoing" | undefined,
      projectAccomplishment: args.projectAccomplishment,
      dateStarted: args.dateStarted,
      targetDate: args.targetDate,
      completionDate: args.completionDate,
      municipality: args.municipality,
      barangay: args.barangay,
      district: args.district,
      remarks: args.remarks,
      reportDate: args.reportDate,
      fundSource: args.fundSource,
      createdBy: userId,
      createdAt: Date.now(),
    });

    // Update implementing agency usage count
    await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
      code: args.implementingOffice,
      usageContext: "breakdown",
      delta: 1,
    });

    // Log activity
    const breakdown = await ctx.db.get(breakdownId);
    await logspecialHealthFundBreakdownActivity(ctx, userId, {
      action: "created",
      breakdownId,
      breakdown,
      source: "web_ui",
    });

    return breakdownId;
  },
});

/**
 * Bulk create Special Health Fund Breakdowns
 */
export const bulkCreateBreakdowns = mutation({
  args: {
    breakdowns: v.array(
      v.object({
        specialHealthFundId: v.id("specialHealthFunds"),
        projectName: v.string(),
        implementingOffice: v.string(),
        projectTitle: v.optional(v.string()),
        allocatedBudget: v.optional(v.number()),
        obligatedBudget: v.optional(v.number()),
        budgetUtilized: v.optional(v.number()),
        status: v.optional(v.string()),
        projectAccomplishment: v.optional(v.number()),
        dateStarted: v.optional(v.number()),
        targetDate: v.optional(v.number()),
        completionDate: v.optional(v.number()),
        municipality: v.optional(v.string()),
        barangay: v.optional(v.string()),
        district: v.optional(v.string()),
        remarks: v.optional(v.string()),
        reportDate: v.optional(v.number()),
        fundSource: v.optional(v.string()),
      })
    ),
    batchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const batchId = args.batchId || `batch_${Date.now()}`;

    // Validate all implementing offices upfront
    const uniqueOffices = [...new Set(args.breakdowns.map((b) => b.implementingOffice))];
    for (const office of uniqueOffices) {
      await validateImplementingOffice(ctx, office);
    }

    // Track agency usage changes
    const agencyUsageChanges = new Map<string, number>();

    const breakdownIds: Id<"specialHealthFundBreakdowns">[] = [];

    // Create all breakdowns
    for (const breakdown of args.breakdowns) {
      // Calculate derived fields
      const calculatedFinancials = calculateFinancials({
        allocatedBudget: breakdown.allocatedBudget,
        obligatedBudget: breakdown.obligatedBudget,
        budgetUtilized: breakdown.budgetUtilized,
      });

      const breakdownId = await ctx.db.insert("specialHealthFundBreakdowns", {
        specialHealthFundId: breakdown.specialHealthFundId,
        projectName: breakdown.projectName,
        implementingOffice: breakdown.implementingOffice,
        projectTitle: breakdown.projectTitle,
        allocatedBudget: breakdown.allocatedBudget,
        obligatedBudget: breakdown.obligatedBudget,
        budgetUtilized: breakdown.budgetUtilized,
        balance: calculatedFinancials.balance,
        utilizationRate: calculatedFinancials.utilizationRate,
        status: breakdown.status as "completed" | "delayed" | "ongoing" | undefined,
        projectAccomplishment: breakdown.projectAccomplishment,
        dateStarted: breakdown.dateStarted,
        targetDate: breakdown.targetDate,
        completionDate: breakdown.completionDate,
        municipality: breakdown.municipality,
        barangay: breakdown.barangay,
        district: breakdown.district,
        remarks: breakdown.remarks,
        reportDate: breakdown.reportDate,
        fundSource: breakdown.fundSource,
        batchId,
        createdBy: userId,
        createdAt: Date.now(),
      });

      breakdownIds.push(breakdownId);

      // Track agency usage
      const currentCount = agencyUsageChanges.get(breakdown.implementingOffice) || 0;
      agencyUsageChanges.set(breakdown.implementingOffice, currentCount + 1);

      // Log individual activity
      const created = await ctx.db.get(breakdownId);
      await logspecialHealthFundBreakdownActivity(ctx, userId, {
        action: "bulk_created",
        breakdownId,
        breakdown: created,
        batchId,
        source: "bulk_import",
      });
    }

    // Update all agency usage counts
    for (const [code, delta] of agencyUsageChanges.entries()) {
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code,
        usageContext: "breakdown",
        delta,
      });
    }

    return {
      success: true,
      count: breakdownIds.length,
      batchId,
      breakdownIds,
    };
  },
});

// ============================================================================
// MUTATIONS - UPDATE
// ============================================================================

/**
 * Update a Special Health Fund Breakdown
 */
export const updateBreakdown = mutation({
  args: {
    id: v.id("specialHealthFundBreakdowns"),
    projectName: v.optional(v.string()),
    implementingOffice: v.optional(v.string()),
    projectTitle: v.optional(v.string()),
    allocatedBudget: v.optional(v.number()),
    obligatedBudget: v.optional(v.number()),
    budgetUtilized: v.optional(v.number()),
    status: v.optional(v.string()),
    projectAccomplishment: v.optional(v.number()),
    dateStarted: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    completionDate: v.optional(v.number()),
    municipality: v.optional(v.string()),
    barangay: v.optional(v.string()),
    district: v.optional(v.string()),
    remarks: v.optional(v.string()),
    reportDate: v.optional(v.number()),
    fundSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current breakdown
    const current = await ctx.db.get(args.id);
    if (!current) {
      throw new Error("Breakdown not found");
    }

    // Validate new implementing office if changed
    if (args.implementingOffice && args.implementingOffice !== current.implementingOffice) {
      await validateImplementingOffice(ctx, args.implementingOffice);

      // Update usage counts
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: current.implementingOffice,
        usageContext: "breakdown",
        delta: -1,
      });

      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: args.implementingOffice,
        usageContext: "breakdown",
        delta: 1,
      });
    }

    // Validate status if provided
    if (args.status) {
      validateBreakdownStatus(args.status);
    }

    // Build update object
    const updates: any = {
      updatedAt: Date.now(),
      updatedBy: userId,
    };

    // Copy over provided fields
    if (args.projectName !== undefined) updates.projectName = args.projectName;
    if (args.implementingOffice !== undefined) updates.implementingOffice = args.implementingOffice;
    if (args.projectTitle !== undefined) updates.projectTitle = args.projectTitle;
    if (args.allocatedBudget !== undefined) updates.allocatedBudget = args.allocatedBudget;
    if (args.obligatedBudget !== undefined) updates.obligatedBudget = args.obligatedBudget;
    if (args.budgetUtilized !== undefined) updates.budgetUtilized = args.budgetUtilized;
    if (args.status !== undefined) updates.status = args.status;
    if (args.projectAccomplishment !== undefined) updates.projectAccomplishment = args.projectAccomplishment;
    if (args.dateStarted !== undefined) updates.dateStarted = args.dateStarted;
    if (args.targetDate !== undefined) updates.targetDate = args.targetDate;
    if (args.completionDate !== undefined) updates.completionDate = args.completionDate;
    if (args.municipality !== undefined) updates.municipality = args.municipality;
    if (args.barangay !== undefined) updates.barangay = args.barangay;
    if (args.district !== undefined) updates.district = args.district;
    if (args.remarks !== undefined) updates.remarks = args.remarks;
    if (args.reportDate !== undefined) updates.reportDate = args.reportDate;
    if (args.fundSource !== undefined) updates.fundSource = args.fundSource;

    // Recalculate financial fields if any financial data changed
    const hasFinancialChanges =
      args.allocatedBudget !== undefined ||
      args.obligatedBudget !== undefined ||
      args.budgetUtilized !== undefined;

    if (hasFinancialChanges) {
      const merged = {
        allocatedBudget: args.allocatedBudget ?? current.allocatedBudget,
        obligatedBudget: args.obligatedBudget ?? current.obligatedBudget,
        budgetUtilized: args.budgetUtilized ?? current.budgetUtilized,
      };

      const calculated = calculateFinancials(merged);
      updates.balance = calculated.balance;
      updates.utilizationRate = calculated.utilizationRate;
    }

    // Apply updates
    await ctx.db.patch(args.id, updates);

    // Log activity
    const updated = await ctx.db.get(args.id);
    await logspecialHealthFundBreakdownActivity(ctx, userId, {
      action: "updated",
      breakdownId: args.id,
      breakdown: updated,
      previousValues: current,
      newValues: updated,
      source: "web_ui",
    });

    return { success: true };
  },
});

// ============================================================================
// MUTATIONS - SOFT DELETE (TRASH SYSTEM)
// ============================================================================

/**
 * Move a breakdown to trash (soft delete)
 */
export const moveToTrash = mutation({
  args: {
    id: v.id("specialHealthFundBreakdowns"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current breakdown
    const breakdown = await ctx.db.get(args.id);
    if (!breakdown) {
      throw new Error("Breakdown not found");
    }

    // Soft delete
    await softDeleteBreakdown(
      ctx,
      "specialHealthFundBreakdowns",
      args.id,
      userId,
      args.reason
    );

    // Log activity
    await logspecialHealthFundBreakdownActivity(ctx, userId, {
      action: "deleted",
      breakdownId: args.id,
      previousValues: breakdown,
      reason: args.reason,
      source: "web_ui",
    });

    return { success: true };
  },
});

/**
 * Restore a breakdown from trash
 */
export const restoreFromTrash = mutation({
  args: {
    id: v.id("specialHealthFundBreakdowns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current breakdown
    const breakdown = await ctx.db.get(args.id);
    if (!breakdown) {
      throw new Error("Breakdown not found");
    }

    // Restore
    await restoreBreakdown(ctx, "specialHealthFundBreakdowns", args.id, userId);

    // Log activity
    const restored = await ctx.db.get(args.id);
    await logspecialHealthFundBreakdownActivity(ctx, userId, {
      action: "restored",
      breakdownId: args.id,
      breakdown: restored,
      source: "web_ui",
    });

    return { success: true };
  },
});

/**
 * Permanently delete a breakdown (hard delete)
 */
export const deleteBreakdown = mutation({
  args: {
    id: v.id("specialHealthFundBreakdowns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current breakdown
    const breakdown = await ctx.db.get(args.id);
    if (!breakdown) {
      throw new Error("Breakdown not found");
    }

    // Log before deletion
    await logspecialHealthFundBreakdownActivity(ctx, userId, {
      action: "deleted",
      breakdownId: args.id,
      previousValues: breakdown,
      source: "web_ui",
    });

    // Update implementing agency usage count
    await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
      code: breakdown.implementingOffice,
      usageContext: "breakdown",
      delta: -1,
    });

    // Permanently delete
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
