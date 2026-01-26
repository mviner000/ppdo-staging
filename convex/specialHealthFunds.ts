// convex/specialHealthFunds.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { logSpecialHealthFundActivity } from "./lib/specialHealthFundActivityLogger";

/**
 * Get all ACTIVE special health funds (excludes deleted)
 */
export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const specialHealthFunds = await ctx.db
            .query("specialHealthFunds")
            .filter((q) => q.neq(q.field("isDeleted"), true))
            .order("desc")
            .collect();

        return specialHealthFunds;
    },
});

/**
 * Get TRASHED special health funds only
 */
export const getTrash = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db
            .query("specialHealthFunds")
            .withIndex("isDeleted", (q) => q.eq("isDeleted", true))
            .order("desc")
            .collect();
    },
});

/**
 * Get a single special health fund by ID
 */
export const get = query({
    args: { id: v.id("specialHealthFunds") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const specialHealthFund = await ctx.db.get(args.id);
        if (!specialHealthFund || specialHealthFund.isDeleted) throw new Error("Special health fund not found");

        return specialHealthFund;
    },
});

/**
 * Get statistics for all special health funds
 */
export const getStatistics = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const specialHealthFunds = await ctx.db
            .query("specialHealthFunds")
            .filter(q => q.neq(q.field("isDeleted"), true))
            .collect();

        if (specialHealthFunds.length === 0) {
            return {
                totalReceived: 0,
                totalUtilized: 0,
                totalBalance: 0,
                totalProjects: 0,
                averageUtilizationRate: 0,
            };
        }

        const totalReceived = specialHealthFunds.reduce((sum, item) => sum + item.received, 0);
        const totalUtilized = specialHealthFunds.reduce((sum, item) => sum + item.utilized, 0);
        const totalBalance = specialHealthFunds.reduce((sum, item) => sum + item.balance, 0);
        const averageUtilizationRate = specialHealthFunds.reduce((sum, item) => sum + (item.utilizationRate || 0), 0) / specialHealthFunds.length;

        return {
            totalReceived,
            totalUtilized,
            totalBalance,
            totalProjects: specialHealthFunds.length,
            averageUtilizationRate,
        };
    },
});

/**
 * Create a new special health fund
 */
export const create = mutation({
    args: {
        projectTitle: v.string(),
        officeInCharge: v.string(),
        dateReceived: v.optional(v.number()),
        received: v.number(),
        obligatedPR: v.optional(v.number()),
        utilized: v.number(),
        // CRITICAL: Make status REQUIRED, not optional
        status: v.union(
            v.literal("active"),
            v.literal("not_available"),
            v.literal("not_yet_started"),
            v.literal("on_process"),
            v.literal("ongoing"),
            v.literal("completed")
        ),
        remarks: v.optional(v.string()),
        year: v.optional(v.number()),
        fiscalYear: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        // Validate implementing agency/office exists and is active
        const agency = await ctx.db
            .query("implementingAgencies")
            .withIndex("code", (q) => q.eq("code", args.officeInCharge))
            .first();

        if (!agency) {
            throw new Error(
                `Implementing office "${args.officeInCharge}" does not exist. Please add it in Implementing Agencies management first.`
            );
        }

        if (!agency.isActive) {
            throw new Error(
                `Implementing office "${args.officeInCharge}" is inactive and cannot be used. Please activate it first.`
            );
        }

        const now = Date.now();

        // Calculate balance and utilization rate
        const balance = args.received - args.utilized;
        const utilizationRate = args.received > 0
            ? (args.utilized / args.received) * 100
            : 0;

        // Auto-link department ID if this agency represents a department
        const departmentId = agency.departmentId;

        // DEBUG LOG
        console.log('Creating special health fund with status:', args.status);

        const specialHealthFundId = await ctx.db.insert("specialHealthFunds", {
            projectTitle: args.projectTitle,
            officeInCharge: args.officeInCharge,
            departmentId: departmentId,
            dateReceived: args.dateReceived,
            received: args.received,
            obligatedPR: args.obligatedPR,
            utilized: args.utilized,
            balance,
            utilizationRate,
            status: args.status, // FIXED: Status is now required, no fallback needed
            remarks: args.remarks,
            year: args.year,
            fiscalYear: args.fiscalYear,
            isDeleted: false,
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
        });

        const newSpecialHealthFund = await ctx.db.get(specialHealthFundId);

        // DEBUG LOG
        console.log('Created special health fund with status:', newSpecialHealthFund?.status);

        // Log activity
        await logSpecialHealthFundActivity(ctx, userId, {
            action: "created",
            specialHealthFundId,
            newValues: newSpecialHealthFund,
            reason: "Initial creation"
        });

        return specialHealthFundId;
    },
});

/**
 * Update an existing special health fund
 */
export const update = mutation({
    args: {
        id: v.id("specialHealthFunds"),
        projectTitle: v.string(),
        officeInCharge: v.string(),
        dateReceived: v.optional(v.number()),
        received: v.number(),
        obligatedPR: v.optional(v.number()),
        utilized: v.number(),
        // CRITICAL: Make status REQUIRED, not optional
        status: v.union(
            v.literal("active"),
            v.literal("not_available"),
            v.literal("not_yet_started"),
            v.literal("on_process"),
            v.literal("ongoing"),
            v.literal("completed")
        ),
        remarks: v.optional(v.string()),
        year: v.optional(v.number()),
        fiscalYear: v.optional(v.number()),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Special health fund not found");

        // Validate implementing office if changed
        if (args.officeInCharge !== existing.officeInCharge) {
            const agency = await ctx.db
                .query("implementingAgencies")
                .withIndex("code", (q) => q.eq("code", args.officeInCharge))
                .first();

            if (!agency) {
                throw new Error(
                    `Implementing office "${args.officeInCharge}" does not exist.`
                );
            }

            if (!agency.isActive) {
                throw new Error(
                    `Implementing office "${args.officeInCharge}" is inactive.`
                );
            }
        }

        const now = Date.now();

        // Calculate balance and utilization rate
        const balance = args.received - args.utilized;
        const utilizationRate = args.received > 0
            ? (args.utilized / args.received) * 100
            : 0;

        // Get department ID from agency
        const agency = await ctx.db
            .query("implementingAgencies")
            .withIndex("code", (q) => q.eq("code", args.officeInCharge))
            .first();

        const departmentId = agency?.departmentId;

        // DEBUG LOG
        console.log('Updating special health fund with status:', args.status);

        await ctx.db.patch(args.id, {
            projectTitle: args.projectTitle,
            officeInCharge: args.officeInCharge,
            departmentId: departmentId,
            dateReceived: args.dateReceived,
            received: args.received,
            obligatedPR: args.obligatedPR,
            utilized: args.utilized,
            balance,
            utilizationRate,
            status: args.status, // FIXED: Status is now required, no fallback needed
            remarks: args.remarks,
            year: args.year,
            fiscalYear: args.fiscalYear,
            updatedAt: now,
            updatedBy: userId,
        });

        const updatedSpecialHealthFund = await ctx.db.get(args.id);

        // DEBUG LOG
        console.log('Updated special health fund with status:', updatedSpecialHealthFund?.status);

        // Log activity
        await logSpecialHealthFundActivity(ctx, userId, {
            action: "updated",
            specialHealthFundId: args.id,
            previousValues: existing,
            newValues: updatedSpecialHealthFund,
            reason: args.reason
        });

        return args.id;
    },
});

/**
 * Soft Delete: Move to trash
 */
export const moveToTrash = mutation({
    args: {
        id: v.id("specialHealthFunds"),
        reason: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Special health fund not found");

        await ctx.db.patch(args.id, {
            isDeleted: true,
            deletedAt: now,
            deletedBy: userId,
            updatedAt: now,
            updatedBy: userId
        });

        await logSpecialHealthFundActivity(ctx, userId, {
            action: "updated",
            specialHealthFundId: args.id,
            previousValues: existing,
            newValues: { ...existing, isDeleted: true },
            reason: args.reason || "Moved to trash"
        });

        return { success: true, message: "Moved to trash" };
    },
});

/**
 * Restore from trash
 */
export const restoreFromTrash = mutation({
    args: { id: v.id("specialHealthFunds") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Special health fund not found");

        await ctx.db.patch(args.id, {
            isDeleted: false,
            deletedAt: undefined,
            deletedBy: undefined,
            updatedAt: Date.now()
        });

        await logSpecialHealthFundActivity(ctx, userId, {
            action: "restored",
            specialHealthFundId: args.id,
            previousValues: existing,
            newValues: { ...existing, isDeleted: false },
            reason: "Restored from trash"
        });

        return { success: true, message: "Restored from trash" };
    },
});

/**
 * HARD DELETE: Permanent removal
 */
export const remove = mutation({
    args: {
        id: v.id("specialHealthFunds"),
        reason: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new Error("User not found");

        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Special health fund not found");

        const isSuperAdmin = currentUser.role === 'super_admin';
        const isCreator = existing.createdBy === userId;

        if (!isCreator && !isSuperAdmin) {
            throw new Error("Not authorized");
        }

        // Log before deletion
        await logSpecialHealthFundActivity(ctx, userId, {
            action: "deleted",
            specialHealthFundId: args.id,
            previousValues: existing,
            reason: args.reason || "Permanent deletion"
        });

        await ctx.db.delete(args.id);

        return { success: true };
    },
});

/**
 * Bulk move to trash
 */
export const bulkMoveToTrash = mutation({
    args: {
        ids: v.array(v.id("specialHealthFunds")),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            throw new Error("Unauthorized: Only admins can perform bulk actions.");
        }

        const now = Date.now();
        let successCount = 0;

        for (const id of args.ids) {
            const existing = await ctx.db.get(id);
            if (!existing || existing.isDeleted) continue;

            await ctx.db.patch(id, {
                isDeleted: true,
                deletedAt: now,
                deletedBy: userId,
                updatedAt: now,
                updatedBy: userId,
            });

            await logSpecialHealthFundActivity(ctx, userId, {
                action: "updated",
                specialHealthFundId: id,
                previousValues: existing,
                newValues: { ...existing, isDeleted: true },
                reason: args.reason || "Bulk moved to trash"
            });

            successCount++;
        }

        return { success: true, message: `Moved ${successCount} item(s) to trash` };
    },
});

/**
 * Toggle pin status
 */
export const togglePin = mutation({
    args: { id: v.id("specialHealthFunds") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Special health fund not found");

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
 * Quick update status only (for inline dropdown)
 */
export const updateStatus = mutation({
    args: {
        id: v.id("specialHealthFunds"),
        status: v.union(
            v.literal("active"),
            v.literal("not_available"),
            v.literal("not_yet_started"),
            v.literal("on_process"),
            v.literal("ongoing"),
            v.literal("completed")
        ),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Special health fund not found");

        const now = Date.now();

        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: now,
            updatedBy: userId,
        });

        const updatedSpecialHealthFund = await ctx.db.get(args.id);

        // Log activity
        await logSpecialHealthFundActivity(ctx, userId, {
            action: "updated",
            specialHealthFundId: args.id,
            previousValues: existing,
            newValues: updatedSpecialHealthFund,
            reason: args.reason || `Status changed to ${args.status}`
        });

        return args.id;
    },
});
