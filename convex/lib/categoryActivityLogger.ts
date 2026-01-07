// convex/lib/categoryActivityLogger.ts

import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

export interface CategoryLogConfig {
  action: "created" | "updated" | "deleted" | "activated" | "deactivated";
  categoryId?: Id<"projectCategories">;
  category?: any;
  previousValues?: any;
  newValues?: any;
  reason?: string;
}

/**
 * Log category activity with comprehensive tracking
 * Handles all category-related actions and changes
 */
export async function logCategoryActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  config: CategoryLogConfig
): Promise<void> {
  try {
    const user = await ctx.db.get(userId);
    if (!user) {
      console.error("User not found for logging:", userId);
      return;
    }

    const categoryData = config.category || config.newValues || config.previousValues || {};
    
    let changedFields: string[] = [];
    let changeSummary: any = {};

    if (config.action === "updated" && config.previousValues && config.newValues) {
      const allKeys = new Set([
        ...Object.keys(config.previousValues), 
        ...Object.keys(config.newValues)
      ]);
      
      for (const key of allKeys) {
        if (["_id", "_creationTime", "updatedAt", "updatedBy", "createdAt", "createdBy"].includes(key)) {
          continue;
        }
        
        const pVal = config.previousValues[key];
        const nVal = config.newValues[key];

        if (JSON.stringify(pVal) !== JSON.stringify(nVal)) {
          changedFields.push(key);
        }
      }

      if (changedFields.includes("isActive")) {
        changeSummary.statusChanged = true;
        changeSummary.oldStatus = config.previousValues.isActive ? "active" : "inactive";
        changeSummary.newStatus = config.newValues.isActive ? "active" : "inactive";
      }
      
      if (changedFields.includes("displayOrder")) {
        changeSummary.orderChanged = true;
      }
    }

    // Note: This requires adding a projectCategoryActivities table to your schema
    // For now, we'll log to console. You can add the table later.
    console.log("Category Activity:", {
      action: config.action,
      categoryId: config.categoryId,
      code: categoryData.code || "Unknown",
      fullName: categoryData.fullName || "Unknown Category",
      changedFields,
      changeSummary,
      performedBy: user.name || "Unknown",
      timestamp: Date.now(),
      reason: config.reason,
    });
    
    // TODO: When projectCategoryActivities table is added, uncomment:
    // await ctx.db.insert("projectCategoryActivities", {
    //   action: config.action,
    //   categoryId: config.categoryId,
    //   code: categoryData.code || "Unknown",
    //   fullName: categoryData.fullName || "Unknown Category",
    //   previousValues: config.previousValues ? JSON.stringify(config.previousValues) : undefined,
    //   newValues: config.newValues ? JSON.stringify(config.newValues) : undefined,
    //   changedFields: changedFields.length > 0 ? JSON.stringify(changedFields) : undefined,
    //   changeSummary: Object.keys(changeSummary).length > 0 ? changeSummary : undefined,
    //   performedBy: userId,
    //   performedByName: user.name || "Unknown",
    //   performedByEmail: user.email || "",
    //   performedByRole: user.role || "user",
    //   timestamp: Date.now(),
    //   reason: config.reason,
    // });
    
  } catch (error) {
    console.error("Failed to log category activity:", error);
  }
}