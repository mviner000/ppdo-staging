// convex/lib/projectAggregation.ts
import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";
import { recalculateBudgetItemMetrics } from "./budgetAggregation";

type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Calculate and update project metrics based on child breakdowns
 * ✅ UPDATED WITH AUTO-CALCULATION FLAG:
 * 1. Checks `autoCalculateBudgetUtilized` flag before updating totalBudgetUtilized
 * 2. When flag is TRUE (default): Aggregates from breakdowns (auto-calculation)
 * 3. When flag is FALSE: Preserves manual value (no auto-calculation)
 * 4. Always calculates obligatedBudget, status counts, and status (regardless of flag)
 * 5. Excludes soft-deleted (trashed) breakdowns
 */
export async function recalculateProjectMetrics(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
) {
  // Get all ACTIVE breakdowns (not in trash)
  const breakdowns = await ctx.db
    .query("govtProjectBreakdowns")
    .withIndex("projectId", (q) => q.eq("projectId", projectId))
    .filter((q) => q.neq(q.field("isDeleted"), true))
    .collect();

  const project = await ctx.db.get(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  // 🆕 Check auto-calculation flag (defaults to TRUE for backward compatibility)
  const shouldAutoCalculate = project.autoCalculateBudgetUtilized !== false;

  // Initialize Aggregators
  let totalObligated = 0;
  let totalUtilized = 0;
  const statusCounts = { completed: 0, delayed: 0, onTrack: 0 };

  // Aggregate Data from Breakdowns
  for (const breakdown of breakdowns) {
    // Sum Obligated Budget (always calculated)
    totalObligated += (breakdown.obligatedBudget || 0);
    
    // 🆕 Sum Utilized Budget (only if we're auto-calculating)
    if (shouldAutoCalculate) {
      totalUtilized += (breakdown.budgetUtilized || 0);
    }

    // Count Statuses (always calculated)
    const status = breakdown.status;
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
    // Formula: (Total Utilized from Breakdowns / Project Allocated) * 100
    const utilizationRate = project.totalBudgetAllocated > 0
      ? (totalUtilized / project.totalBudgetAllocated) * 100
      : 0;

    updateData.totalBudgetUtilized = totalUtilized;
    updateData.utilizationRate = utilizationRate;
  } else {
    // 🆕 Manual mode: Recalculate utilizationRate based on existing manual value
    const manualUtilized = project.totalBudgetUtilized || 0;
    const utilizationRate = project.totalBudgetAllocated > 0
      ? (manualUtilized / project.totalBudgetAllocated) * 100
      : 0;
    
    updateData.utilizationRate = utilizationRate;
    // Note: totalBudgetUtilized is NOT updated, preserving manual input
  }

  // Auto-calculate Project Status (always calculated)
  let status: "completed" | "delayed" | "ongoing";
  if (breakdowns.length === 0) {
    status = "ongoing"; // Default if no breakdowns
  } else {
    if (statusCounts.onTrack > 0) status = "ongoing";
    else if (statusCounts.delayed > 0) status = "delayed";
    else if (statusCounts.completed > 0) status = "completed";
    else status = "ongoing";
  }
  updateData.status = status;

  // Update Project with Calculated Values
  await ctx.db.patch(projectId, updateData);

  // Cascade Calculation to Parent Budget Item
  // Only recalculate if the parent budget item exists and is not deleted
  if (project.budgetItemId) {
    const budgetItem = await ctx.db.get(project.budgetItemId);
    // Only recalculate if budget item exists and is not deleted
    if (budgetItem && !budgetItem.isDeleted) {
      await recalculateBudgetItemMetrics(ctx, project.budgetItemId, userId);
    }
  }

  return {
    breakdownsCount: breakdowns.length,
    ...statusCounts,
    totalObligated,
    totalUtilized: shouldAutoCalculate ? totalUtilized : project.totalBudgetUtilized,
    utilizationRate: updateData.utilizationRate,
    status,
    autoCalculated: shouldAutoCalculate,
    mode: shouldAutoCalculate ? "auto" : "manual",
  };
}

/**
 * Recalculate metrics for multiple projects
 */
export async function recalculateMultipleProjects(
  ctx: MutationCtx,
  projectIds: Id<"projects">[],
  userId: Id<"users">
) {
  const results = [];
  for (const projectId of projectIds) {
    const result = await recalculateProjectMetrics(ctx, projectId, userId);
    results.push({
      projectId,
      ...result,
    });
  }

  return results;
}

/**
 * Recalculate ALL projects (system-wide)
 */
export async function recalculateAllProjects(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  const allProjects = await ctx.db.query("projects").collect();
  const projectIds = allProjects.map((p) => p._id);

  return await recalculateMultipleProjects(ctx, projectIds, userId);
}

/**
 * Bulk Recalculation: Recalculate all projects for a specific budget item
 */
export async function recalculateProjectsForBudgetItem(
  ctx: MutationCtx,
  budgetItemId: Id<"budgetItems">,
  userId: Id<"users">
) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("budgetItemId", (q) => q.eq("budgetItemId", budgetItemId))
    .collect();
  const projectIds = projects.map((p) => p._id);

  return await recalculateMultipleProjects(ctx, projectIds, userId);
}