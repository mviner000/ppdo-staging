// convex/lib/aggregationUtils.ts

import { GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

/**
 * GENERIC AGGREGATION CONFIGURATION
 * Define how to aggregate any entity type
 */
export interface AggregationConfig<T> {
  entityType: string;
  aggregationType: string;
  
  // Define which fields to group by
  groupByFields: (keyof T)[];
  
  // Define which numeric fields to aggregate
  aggregateFields: {
    sourceField: keyof T;
    aggregateFunction: "sum" | "avg" | "min" | "max" | "count";
    targetValueKey: string; // e.g., "value1", "value2"
  }[];
  
  // Display label template
  labelTemplate?: (groupKeys: Record<string, any>) => string;
  
  // Hierarchy level
  hierarchyLevel?: number;
}

/**
 * CALCULATE AGGREGATION FOR ANY ENTITY
 * Generic function that works with govtProjects, budgetItems, etc.
 */
export async function calculateAggregation<T extends Record<string, any>>(
  ctx: GenericMutationCtx<DataModel>,
  items: T[],
  config: AggregationConfig<T>,
  userId: Id<"users">
) {
  if (items.length === 0) {
    throw new Error(`No items found for aggregation: ${config.entityType}`);
  }

  const now = Date.now();

  // Build grouping keys from first item (all items should have same group keys)
  const groupingKeys: Record<string, any> = {};
  config.groupByFields.forEach((field, index) => {
    const key = `key${index + 1}`;
    groupingKeys[key] = items[0][field];
  });

  // Calculate aggregated values
  const aggregatedValues: Record<string, number | undefined> = {};
  const namedAggregations: Record<string, number> = {};

  config.aggregateFields.forEach((fieldConfig) => {
    let result: number | undefined;

    switch (fieldConfig.aggregateFunction) {
      case "sum":
        result = items.reduce((sum, item) => {
          const value = item[fieldConfig.sourceField];
          return sum + (typeof value === "number" ? value : 0);
        }, 0);
        break;

      case "avg":
        const values = items
          .map((item) => item[fieldConfig.sourceField])
          .filter((v) => typeof v === "number") as number[];
        result = values.length > 0
          ? values.reduce((sum, v) => sum + v, 0) / values.length
          : undefined;
        break;

      case "min":
        const minValues = items
          .map((item) => item[fieldConfig.sourceField])
          .filter((v) => typeof v === "number") as number[];
        result = minValues.length > 0 ? Math.min(...minValues) : undefined;
        break;

      case "max":
        const maxValues = items
          .map((item) => item[fieldConfig.sourceField])
          .filter((v) => typeof v === "number") as number[];
        result = maxValues.length > 0 ? Math.max(...maxValues) : undefined;
        break;

      case "count":
        result = items.filter((item) => item[fieldConfig.sourceField] != null).length;
        break;
    }

    aggregatedValues[fieldConfig.targetValueKey] = result;
    
    // Also store in named aggregations for easier access
    const fieldName = String(fieldConfig.sourceField);
    const aggregateName = `${fieldConfig.aggregateFunction}_${fieldName}`;
    if (result !== undefined) {
      namedAggregations[aggregateName] = result;
    }
  });

  // Generate display label
  const displayLabel = config.labelTemplate
    ? config.labelTemplate(
        config.groupByFields.reduce((acc, field, i) => {
          acc[String(field)] = items[0][field];
          return acc;
        }, {} as Record<string, any>)
      )
    : `${config.entityType} ${config.aggregationType}`;

  // Check if aggregation already exists
  const existing = await ctx.db
    .query("aggregations")
    .withIndex("entityTypeAndAggregationType", (q) =>
      q.eq("entityType", config.entityType).eq("aggregationType", config.aggregationType)
    )
    .filter((q) => {
      let filter = q.eq(true, true);
      config.groupByFields.forEach((field, index) => {
        const key = `key${index + 1}`;
        const fieldPath = `groupingKeys.${key}` as any;
        filter = q.and(
          filter,
          q.eq(q.field(fieldPath), items[0][field])
        );
      });
      return filter;
    })
    .first();

  if (existing) {
    // Update existing aggregation
    await ctx.db.patch(existing._id, {
      aggregatedValues: aggregatedValues as any,
      namedAggregations,
      displayLabel,
      rowCount: items.length,
      updatedAt: now,
      updatedBy: userId,
    });

    return { aggregationId: existing._id, updated: true };
  } else {
    // Create new aggregation
    const aggregationId = await ctx.db.insert("aggregations", {
      entityType: config.entityType,
      aggregationType: config.aggregationType,
      groupingKeys: groupingKeys as any,
      aggregatedValues: aggregatedValues as any,
      namedAggregations,
      displayLabel,
      rowCount: items.length,
      hierarchyLevel: config.hierarchyLevel,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return { aggregationId, created: true };
  }
}

/**
 * GOVERNMENT PROJECTS SUBTOTAL CONFIGURATION
 */
export function getGovtProjectSubtotalConfig(
  projectName: string,
  implementingOffice: string
): AggregationConfig<any> {
  return {
    entityType: "govtProjects",
    aggregationType: "subtotal",
    groupByFields: ["projectName", "implementingOffice"],
    aggregateFields: [
      { sourceField: "allocatedBudget", aggregateFunction: "sum", targetValueKey: "value1" },
      { sourceField: "obligatedBudget", aggregateFunction: "sum", targetValueKey: "value2" },
      { sourceField: "budgetUtilized", aggregateFunction: "sum", targetValueKey: "value3" },
      { sourceField: "balance", aggregateFunction: "sum", targetValueKey: "value4" },
      { sourceField: "utilizationRate", aggregateFunction: "avg", targetValueKey: "value5" },
    ],
    labelTemplate: (keys) => `${keys.projectName} - ${keys.implementingOffice} (Subtotal)`,
    hierarchyLevel: 1,
  };
}