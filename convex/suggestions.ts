// convex/suggestions.ts

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
  handler: async (ctx, { title, description, multimedia }) => {
    const userId = await requireUserId(ctx);

    const suggestionId = await ctx.db.insert("suggestions", {
      title,

      description,
      multimedia: multimedia || [],
      submittedBy: userId,
      status: "pending",
      submittedAt: Date.now(),
    });

    return { suggestionId };
  },
});

// ==================== READ ====================
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const suggestions = await ctx.db
      .query("suggestions")
      .order("desc")
      .collect();

    // Enrich with full submitter info
    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        let submitter = null;
        let updater = null;

        if (suggestion.submittedBy) {
          submitter = await ctx.db.get(suggestion.submittedBy);
        }

        if (suggestion.updatedBy) {
          updater = await ctx.db.get(suggestion.updatedBy);
        }

        return {
          ...suggestion,
          submitter,
          updater,
        };
      })
    );

    return enrichedSuggestions;
  },
});

export const getMySuggestions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const suggestions = await ctx.db
      .query("suggestions")
      .filter((q) => q.eq(q.field("submittedBy"), userId))
      .order("desc")
      .collect();

    // Enrich with updater info
    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        let updater = null;
        if (suggestion.updatedBy) {
          updater = await ctx.db.get(suggestion.updatedBy);
        }

        return {
          ...suggestion,
          updater,
        };
      })
    );

    return enrichedSuggestions;
  },
});

export const getById = query({
  args: {
    id: v.id("suggestions")
  },
  handler: async (ctx, { id }) => {
    await requireUserId(ctx);

    const suggestion = await ctx.db.get(id);
    if (!suggestion) {
      return null;
    }

    let submitter = null;
    let updater = null;

    if (suggestion.submittedBy) {
      submitter = await ctx.db.get(suggestion.submittedBy);
    }
    if (suggestion.updatedBy) {
      updater = await ctx.db.get(suggestion.updatedBy);
    }

    return {
      ...suggestion,
      submitter,
      updater
    };
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("to_review"),
      v.literal("denied")
    ),
  },
  handler: async (ctx, { status }) => {
    await requireUserId(ctx);

    return await ctx.db
      .query("suggestions")
      .filter((q) => q.eq(q.field("status"), status))
      .order("desc")
      .collect();
  },
});

// ==================== UPDATE ====================
export const update = mutation({
  args: {
    id: v.id("suggestions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("acknowledged"),
        v.literal("to_review"),
        v.literal("denied")
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
  handler: async (ctx, { id, title, description, status, multimedia }) => {
    const userId = await requireUserId(ctx);

    const updateData: any = {
      updatedAt: Date.now(),
      updatedBy: userId,
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (multimedia !== undefined) updateData.multimedia = multimedia;

    await ctx.db.patch(id, updateData);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("suggestions"),
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("to_review"),
      v.literal("denied")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const userId = await requireUserId(ctx);

    await ctx.db.patch(id, {
      status,
      updatedAt: Date.now(),
      updatedBy: userId,
    });
  },
});

// ==================== STATS ====================
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const suggestions = await ctx.db.query("suggestions").collect();

    const stats = {
      total: suggestions.length,
      pending: suggestions.filter(s => s.status === "pending").length,
      acknowledged: suggestions.filter(s => s.status === "acknowledged").length,
      to_review: suggestions.filter(s => s.status === "to_review").length,
      denied: suggestions.filter(s => s.status === "denied").length,
    };

    return stats;
  },
});