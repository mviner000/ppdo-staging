// convex/lib/budgetAggregation.ts
import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Calculate and update budgetItem metrics based on child projects
 * ✅ UPDATED WITH AUTO-CALCULATION FLAG:
 * 1. Checks `autoCalculateBudgetUtilized` flag before updating totalBudgetUtilized
 * 2. When flag is TRUE (default): Aggregates from projects (auto-calculation)
 * 3. When flag is FALSE: Preserves manual value (no auto-calculation)
 * 4. Always calculates obligatedBudget, status counts, and status (regardless of flag)
 * 5. Excludes soft-deleted (trashed) projects
 */
export async function recalculateBudgetItemMetrics(
  ctx: MutationCtx,
  budgetItemId: Id<"budgetItems">,
  userId: Id<"users">
) {
  // Get all ACTIVE projects (not in trash)
  const projects = await ctx.db
    .query("projects")
    .withIndex("budgetItemId", (q) => q.eq("budgetItemId", budgetItemId))
    .filter((q) => q.neq(q.field("isDeleted"), true))
    .collect();

  const budgetItem = await ctx.db.get(budgetItemId);
  if (!budgetItem) throw new Error("Budget item not found");

  // 🆕 Check auto-calculation flag (defaults to TRUE for backward compatibility)
  const shouldAutoCalculate = budgetItem.autoCalculateBudgetUtilized !== false;

  // Initialize Aggregators
  let totalObligated = 0;
  let totalUtilized = 0;
  const statusCounts = { completed: 0, delayed: 0, onTrack: 0 };

  // Aggregate Data from Projects
  for (const project of projects) {
    // Sum Obligated Budget (always calculated)
    totalObligated += (project.obligatedBudget || 0);
    
    // 🆕 Sum Utilized Budget (only if we're auto-calculating)
    if (shouldAutoCalculate) {
      totalUtilized += (project.totalBudgetUtilized || 0);
    }

    // Count Statuses (always calculated)
    const status = project.status;
    if (status === "completed") statusCounts.completed++;
    else if (status === "delayed") statusCounts.delayed++;
    else if (status === "ongoing") statusCounts.onTrack++;
  }

  // 🆕 Prepare update object based on auto-calculation flag
  const updateData: any = {
    obligatedBudget: totalObligated,
    projectCompleted: statusCounts.completed,
    projectDelayed: statusCounts.delayed,
    projectsOnTrack: statusCounts.onTrack,
    updatedAt: Date.now(),
    updatedBy: userId,
  };

  // 🆕 Only update totalBudgetUtilized and utilizationRate if auto-calculating
  if (shouldAutoCalculate) {
    // Calculate Dynamic Utilization Rate
    // Formula: (Total Utilized from Projects / Budget Allocated) * 100
    const utilizationRate = budgetItem.totalBudgetAllocated > 0
      ? (totalUtilized / budgetItem.totalBudgetAllocated) * 100
      : 0;

    updateData.totalBudgetUtilized = totalUtilized;
    updateData.utilizationRate = utilizationRate;
  } else {
    // 🆕 Manual mode: Recalculate utilizationRate based on existing manual value
    const manualUtilized = budgetItem.totalBudgetUtilized || 0;
    const utilizationRate = budgetItem.totalBudgetAllocated > 0
      ? (manualUtilized / budgetItem.totalBudgetAllocated) * 100
      : 0;
    
    updateData.utilizationRate = utilizationRate;
    // Note: totalBudgetUtilized is NOT updated, preserving manual input
  }

  // Auto-calculate Status (always calculated)
  let status: "completed" | "delayed" | "ongoing";
  if (projects.length === 0) {
    status = "ongoing"; // Default
  } else {
    if (statusCounts.onTrack > 0) status = "ongoing";
    else if (statusCounts.delayed > 0) status = "delayed";
    else if (statusCounts.completed > 0) status = "completed";
    else status = "ongoing";
  }
  updateData.status = status;

  // Update Budget Item with Calculated Values
  await ctx.db.patch(budgetItemId, updateData);

  return {
    projectsCount: projects.length,
    ...statusCounts,
    totalObligated,
    totalUtilized: shouldAutoCalculate ? totalUtilized : budgetItem.totalBudgetUtilized,
    utilizationRate: updateData.utilizationRate,
    status,
    autoCalculated: shouldAutoCalculate,
    mode: shouldAutoCalculate ? "auto" : "manual",
  };
}

/**
 * Recalculate metrics for multiple budget items
 */
export async function recalculateMultipleBudgetItems(
  ctx: MutationCtx,
  budgetItemIds: Id<"budgetItems">[],
  userId: Id<"users">
) {
  const results = [];
  for (const budgetItemId of budgetItemIds) {
    const result = await recalculateBudgetItemMetrics(ctx, budgetItemId, userId);
    results.push({
      budgetItemId,
      ...result,
    });
  }
  
  return results;
}

/**
 * Recalculate ALL budget items (system-wide)
 */
export async function recalculateAllBudgetItems(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  const allBudgetItems = await ctx.db.query("budgetItems").collect();
  const budgetItemIds = allBudgetItems.map((bi) => bi._id);
  
  return await recalculateMultipleBudgetItems(ctx, budgetItemIds, userId);
}