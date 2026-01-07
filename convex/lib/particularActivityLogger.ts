// convex/lib/particularActivityLogger.ts

import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

export interface ParticularLogConfig {
  action: "created" | "updated" | "deleted" | "activated" | "deactivated";
  particularId?: Id<"projectParticulars">;
  particular?: any;
  previousValues?: any;
  newValues?: any;
  reason?: string;
}

/**
 * Log particular activity with comprehensive tracking
 * Handles all particular-related actions and changes
 */
export async function logParticularActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  config: ParticularLogConfig
): Promise<void> {
  try {
    const user = await ctx.db.get(userId);
    if (!user) {
      console.error("User not found for logging:", userId);
      return;
    }

    const particularData = config.particular || config.newValues || config.previousValues || {};
    
    let changedFields: string[] = [];
    let changeSummary: any = {};

    if (config.action === "updated" && config.previousValues && config.newValues) {
      const allKeys = new Set([
        ...Object.keys(config.previousValues), 
        ...Object.keys(config.newValues)
      ]);
      
      for (const key of allKeys) {
        if (["_id", "_creationTime", "updatedAt", "updatedBy", "createdAt", "createdBy", "usageCount"].includes(key)) {
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

    // Note: This requires adding a projectParticularActivities table to your schema
    // For now, we'll log to console. You can add the table later.
    console.log("Particular Activity:", {
      action: config.action,
      particularId: config.particularId,
      code: particularData.code || "Unknown",
      fullName: particularData.fullName || "Unknown Particular",
      changedFields,
      changeSummary,
      performedBy: user.name || "Unknown",
      timestamp: Date.now(),
      reason: config.reason,
    });
    
    // TODO: When projectParticularActivities table is added, uncomment:
    // await ctx.db.insert("projectParticularActivities", {
    //   action: config.action,
    //   particularId: config.particularId,
    //   code: particularData.code || "Unknown",
    //   fullName: particularData.fullName || "Unknown Particular",
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
    console.error("Failed to log particular activity:", error);
  }
}