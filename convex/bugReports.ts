// convex/bugReports.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Helper to require an authenticated Convex user
 */
async function requireUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

// ==================== CREATE ====================
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    stepsToReplicate: v.optional(v.string()),
    multimedia: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.string(),
          name: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, { title, description, stepsToReplicate, multimedia }) => {
    const userId = await requireUserId(ctx);

    const reportId = await ctx.db.insert("bugReports", {
      title,
      description,
      stepsToReplicate,
      multimedia: multimedia || [],
      submittedBy: userId,
      status: "pending",
      submittedAt: Date.now(),
    });

    return { reportId };
  },
});

// ==================== READ ====================
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const reports = await ctx.db
      .query("bugReports")
      .order("desc")
      .collect();

    // ✅ Enrich with full submitter info (firstName, lastName, middleName, email, etc.)
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let submitter = null;
        let updater = null;

        if (report.submittedBy) {
          submitter = await ctx.db.get(report.submittedBy);
        }

        if (report.updatedBy) {
          updater = await ctx.db.get(report.updatedBy);
        }

        return {
          ...report,
          submitter, // ✅ Full user object with firstName, lastName, middleName, email, etc.
          updater,
        };
      })
    );

    return enrichedReports;
  },
});

export const getById = query({
  args: {
    id: v.id("bugReports")
  },
  handler: async (ctx, { id }) => {
    await requireUserId(ctx);

    const report = await ctx.db.get(id);
    if (!report) {
      return null;
    }

    let submitter = null;
    let updater = null;

    if (report.submittedBy) {
      submitter = await ctx.db.get(report.submittedBy);
    }
    if (report.updatedBy) {
      updater = await ctx.db.get(report.updatedBy);
    }

    return {
      ...report,
      submitter,
      updater
    };
  },
});

export const getMyReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const reports = await ctx.db
      .query("bugReports")
      .filter((q) => q.eq(q.field("submittedBy"), userId))
      .order("desc")
      .collect();

    // Enrich with updater info
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let updater = null;
        if (report.updatedBy) {
          updater = await ctx.db.get(report.updatedBy);
        }

        return {
          ...report,
          updater,
        };
      })
    );

    return enrichedReports;
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("fixed"),
      v.literal("not_fixed")
    ),
  },
  handler: async (ctx, { status }) => {
    await requireUserId(ctx);

    return await ctx.db
      .query("bugReports")
      .filter((q) => q.eq(q.field("status"), status))
      .order("desc")
      .collect();
  },
});

// ==================== UPDATE ====================
export const update = mutation({
  args: {
    id: v.id("bugReports"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    stepsToReplicate: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("fixed"),
        v.literal("not_fixed")
      )
    ),
    multimedia: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.string(),
          name: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, { id, title, description, stepsToReplicate, status, multimedia }) => {
    const userId = await requireUserId(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Bug report not found");
    }

    const updates: {
      updatedAt: number;
      updatedBy: typeof userId;
      title?: string;
      description?: string;
      stepsToReplicate?: string;
      status?: "pending" | "fixed" | "not_fixed";
      multimedia?: Array<{
        storageId: any; // Using any to avoid complex type import for Id<"_storage">
        type: string;
        name: string;
      }>;
    } = {
      updatedAt: Date.now(),
      updatedBy: userId,
    };

    if (title !== undefined) {
      updates.title = title;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (stepsToReplicate !== undefined) {
      updates.stepsToReplicate = stepsToReplicate;
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (multimedia !== undefined) {
      updates.multimedia = multimedia;
    }

    await ctx.db.patch(id, updates);

    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bugReports"),
    status: v.union(
      v.literal("pending"),
      v.literal("fixed"),
      v.literal("not_fixed")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const userId = await requireUserId(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Bug report not found");
    }

    await ctx.db.patch(id, {
      status,
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    return id;
  },
});

// ==================== DELETE ====================
export const remove = mutation({
  args: {
    id: v.id("bugReports")
  },
  handler: async (ctx, { id }) => {
    await requireUserId(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Bug report not found");
    }

    await ctx.db.delete(id);
    return id;
  },
});

// ==================== BULK OPERATIONS ====================
export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("bugReports")),
    status: v.union(
      v.literal("pending"),
      v.literal("fixed"),
      v.literal("not_fixed")
    ),
  },
  handler: async (ctx, { ids, status }) => {
    const userId = await requireUserId(ctx);
    const timestamp = Date.now();

    for (const id of ids) {
      const existing = await ctx.db.get(id);
      if (existing) {
        await ctx.db.patch(id, {
          status,
          updatedAt: timestamp,
          updatedBy: userId,
        });
      }
    }

    return { updatedCount: ids.length };
  },
});

export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("bugReports")),
  },
  handler: async (ctx, { ids }) => {
    await requireUserId(ctx);

    let deletedCount = 0;

    for (const id of ids) {
      const existing = await ctx.db.get(id);
      if (existing) {
        await ctx.db.delete(id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});

// ==================== STATISTICS ====================
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const allReports = await ctx.db.query("bugReports").collect();

    return {
      total: allReports.length,
      pending: allReports.filter((r) => r.status === "pending").length,
      fixed: allReports.filter((r) => r.status === "fixed").length,
      notFixed: allReports.filter((r) => r.status === "not_fixed").length,
    };
  },
});