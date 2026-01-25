// convex/trustFundSharedAccess.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Grant access to a user
 */
export const grantAccess = mutation({
  args: {
    userId: v.id("users"),
    accessLevel: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only super_admin and admin can grant access
    if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
      throw new Error("Not authorized - administrator access required");
    }

    // Check if user already has access
    const existingAccess = await ctx.db
      .query("trustFundSharedAccess")
      .withIndex("userIdAndActive", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();

    const now = Date.now();

    if (existingAccess) {
      // Update existing access
      await ctx.db.patch(existingAccess._id, {
        accessLevel: args.accessLevel,
        grantedBy: currentUserId,
        grantedAt: now,
        notes: args.notes,
      });
      return existingAccess._id;
    } else {
      // Create new access
      const accessId = await ctx.db.insert("trustFundSharedAccess", {
        userId: args.userId,
        accessLevel: args.accessLevel,
        grantedBy: currentUserId,
        grantedAt: now,
        isActive: true,
        notes: args.notes,
      });
      return accessId;
    }
  },
});

/**
 * Revoke access from a user
 */
export const revokeAccess = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only super_admin and admin can revoke access
    if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
      throw new Error("Not authorized - administrator access required");
    }

    const existingAccess = await ctx.db
      .query("trustFundSharedAccess")
      .withIndex("userIdAndActive", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();

    if (!existingAccess) {
      throw new Error("No active access found for this user");
    }

    await ctx.db.patch(existingAccess._id, {
      isActive: false,
    });

    return { success: true };
  },
});

/**
 * List all users with access
 */
export const listUsersWithAccess = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) {
      return [];
    }

    // Only super_admin and admin can view access list
    if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
      return [];
    }

    const accessRecords = await ctx.db
      .query("trustFundSharedAccess")
      .withIndex("isActive", (q) => q.eq("isActive", true))
      .collect();

    // Enrich with user details
    const enrichedRecords = await Promise.all(
      accessRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const grantedByUser = await ctx.db.get(record.grantedBy);
        
        let department = null;
        if (user?.departmentId) {
          department = await ctx.db.get(user.departmentId);
        }

        return {
          ...record,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          departmentName: department?.name,
          grantedByName: grantedByUser?.name || "Unknown",
          grantedByEmail: grantedByUser?.email || "",
        };
      })
    );

    return enrichedRecords;
  },
});
