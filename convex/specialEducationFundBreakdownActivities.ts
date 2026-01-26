// convex/specialEducationFundBreakdownActivities.ts

import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get activities for a specific breakdown
 */
export const getBreakdownActivities = query({
    args: {
        breakdownId: v.id("specialEducationFundBreakdowns"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const limit = args.limit || 50;

        const activities = await ctx.db
            .query("specialEducationFundBreakdownActivities")
            .withIndex("breakdownIdAndTimestamp", (q) =>
                q.eq("breakdownId", args.breakdownId)
            )
            .order("desc")
            .take(limit);

        return activities;
    },
});

/**
 * Get activities for a project + office combination
 */
export const getProjectOfficeActivities = query({
    args: {
        projectName: v.string(),
        implementingOffice: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        action: v.optional(v.union(
            v.literal("created"),
            v.literal("updated"),
            v.literal("deleted"),
            v.literal("bulk_created"),
            v.literal("bulk_updated"),
            v.literal("bulk_deleted"),
            v.literal("restored")
        )),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Get all activities for this project/office combination
        let activities = await ctx.db
            .query("specialEducationFundBreakdownActivities")
            .filter((q) =>
                q.and(
                    q.eq(q.field("projectName"), args.projectName),
                    q.eq(q.field("implementingOffice"), args.implementingOffice)
                )
            )
            .order("desc")
            .collect();

        // Apply filters
        if (args.startDate) {
            activities = activities.filter(a => a.timestamp >= args.startDate!);
        }

        if (args.endDate) {
            activities = activities.filter(a => a.timestamp <= args.endDate!);
        }

        if (args.action) {
            activities = activities.filter(a => a.action === args.action);
        }

        return activities;
    },
});

/**
 * Get recent activities (dashboard widget)
 */
export const getRecentActivities = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const limit = args.limit || 20;

        const activities = await ctx.db
            .query("specialEducationFundBreakdownActivities")
            .withIndex("timestamp")
            .order("desc")
            .take(limit);

        return activities;
    },
});
