import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Calculate and update budgetItem metrics based on child project STATUSES
 * This is the SINGLE SOURCE OF TRUTH for budgetItem project counts
 * * MAPPING (UPDATED FOR STRICT 3 STATUS):
 * - "completed" status → projectCompleted
 * - "delayed" status → projectDelayed
 * - "ongoing" status → projectsOnTrack
 */
export async function recalculateBudgetItemMetrics(
  ctx: MutationCtx,
  budgetItemId: Id<"budgetItems">,
  userId: Id<"users">
) {
  // Get all projects for this budget item
  const projects = await ctx.db
    .query("projects")
    .withIndex("budgetItemId", (q) => q.eq("budgetItemId", budgetItemId))
    .collect();

  if (projects.length === 0) {
    // No projects - set all counts to 0
    await ctx.db.patch(budgetItemId, {
      projectCompleted: 0,
      projectDelayed: 0,
      projectsOnTrack: 0,
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    return {
      projectsCount: 0,
      completed: 0,
      delayed: 0,
      onTrack: 0,
    };
  }

  // Count projects based on their STATUS field
  const aggregated = projects.reduce(
    (acc, project) => {
      const status = project.status;
      
      if (status === "completed") {
        acc.completed++;
      } else if (status === "delayed") {
        acc.delayed++;
      } else if (status === "ongoing") {
        acc.onTrack++;
      }
      
      return acc;
    },
    { completed: 0, delayed: 0, onTrack: 0 }
  );

  // Update budget item with aggregated totals
  await ctx.db.patch(budgetItemId, {
    projectCompleted: aggregated.completed,
    projectDelayed: aggregated.delayed,
    projectsOnTrack: aggregated.onTrack,
    updatedAt: Date.now(),
    updatedBy: userId,
  });

  return {
    projectsCount: projects.length,
    ...aggregated,
  };
}

/**
 * Recalculate metrics for multiple budget items
 * Useful for bulk operations or system-wide recalculation
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
 * Use with caution - potentially expensive operation
 */
export async function recalculateAllBudgetItems(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  const allBudgetItems = await ctx.db.query("budgetItems").collect();
  const budgetItemIds = allBudgetItems.map((bi) => bi._id);
  
  return await recalculateMultipleBudgetItems(ctx, budgetItemIds, userId);
}