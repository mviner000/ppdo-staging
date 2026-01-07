// convex/lib/projectActivityLogger.ts

import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

export interface ProjectLogConfig {
  action: "created" | "updated" | "deleted" | "restored";
  projectId?: Id<"projects">;
  project?: any; // Snapshot of project data
  previousValues?: any;
  newValues?: any;
  reason?: string;
}

/**
 * Log project activity with comprehensive tracking
 * Handles all project-related actions and changes
 */
export async function logProjectActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  config: ProjectLogConfig
): Promise<void> {
  try {
    const user = await ctx.db.get(userId);
    if (!user) {
      console.error("User not found for logging:", userId);
      return; // Don't throw - logging should not break operations
    }

    // Snapshot Data
    const projectData = config.project || config.newValues || config.previousValues || {};
    
    // Calculate Diff
    let changedFields: string[] = [];
    let changeSummary: any = {};

    if (config.action === "updated" && config.previousValues && config.newValues) {
      const allKeys = new Set([
        ...Object.keys(config.previousValues), 
        ...Object.keys(config.newValues)
      ]);
      
      for (const key of allKeys) {
        // Skip system fields
        if (["_id", "_creationTime", "updatedAt", "updatedBy", "createdAt", "createdBy"].includes(key)) {
          continue;
        }
        
        const pVal = config.previousValues[key];
        const nVal = config.newValues[key];

        if (JSON.stringify(pVal) !== JSON.stringify(nVal)) {
          changedFields.push(key);
        }
      }

      // Build Smart Summaries
      if (changedFields.includes("totalBudgetAllocated")) {
        changeSummary.budgetChanged = true;
        changeSummary.oldBudget = config.previousValues.totalBudgetAllocated;
        changeSummary.newBudget = config.newValues.totalBudgetAllocated;
      }
      
      if (changedFields.includes("targetDateCompletion")) {
        changeSummary.scheduleChanged = true;
      }
      
      if (changedFields.includes("projectManagerId")) {
        changeSummary.managerChanged = true;
      }
      
      if (changedFields.includes("status")) {
        changeSummary.statusChanged = true;
      }
      
      if (changedFields.includes("categoryId")) {
        changeSummary.categoryChanged = true;
      }
    }

    await ctx.db.insert("projectActivities", {
      action: config.action,
      projectId: config.projectId,
      particulars: projectData.particulars || "Unknown Project",
      implementingOffice: projectData.implementingOffice || "Unknown Office",
      budgetItemId: projectData.budgetItemId,
      
      previousValues: config.previousValues ? JSON.stringify(config.previousValues) : undefined,
      newValues: config.newValues ? JSON.stringify(config.newValues) : undefined,
      changedFields: changedFields.length > 0 ? JSON.stringify(changedFields) : undefined,
      changeSummary: Object.keys(changeSummary).length > 0 ? changeSummary : undefined,

      performedBy: userId,
      performedByName: user.name || "Unknown",
      performedByEmail: user.email || "",
      performedByRole: user.role || "user",
      
      timestamp: Date.now(),
      reason: config.reason,
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break operations
    console.error("Failed to log project activity:", error);
  }
}