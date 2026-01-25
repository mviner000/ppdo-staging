// convex/accessRequests.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/**
 * Create an access request
 */
export const create = mutation({
  args: {
    pageRequested: v.string(),
    accessType: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's department name
    let departmentName = "Not Assigned";
    if (user.departmentId) {
      const department = await ctx.db.get(user.departmentId);
      if (department) {
        departmentName = department.name;
      }
    }

    // Create access request
    const requestId = await ctx.db.insert("accessRequests", {
      userId: userId,
      userName: user.name || "Unknown",
      userEmail: user.email || "No email",
      departmentName: departmentName,
      departmentId: user.departmentId,
      pageRequested: args.pageRequested,
      accessType: args.accessType,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return requestId;
  },
});

/**
 * List all access requests (admin only)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return [];
    }

    // Only super_admin and admin can view all requests
    if (user.role !== "super_admin" && user.role !== "admin") {
      return [];
    }

    const requests = await ctx.db
      .query("accessRequests")
      .withIndex("createdAt")
      .order("desc")
      .collect();

    return requests;
  },
});

/**
 * Get count of pending access requests (admin only)
 */
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return 0;
    }

    // Only super_admin and admin can view pending count
    if (user.role !== "super_admin" && user.role !== "admin") {
      return 0;
    }

    const pendingRequests = await ctx.db
      .query("accessRequests")
      .withIndex("status", (q) => q.eq("status", "pending"))
      .collect();

    return pendingRequests.length;
  },
});

/**
 * Get user's own access requests
 */
export const myRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const requests = await ctx.db
      .query("accessRequests")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return requests;
  },
});

/**
 * Update access request status (admin only)
 * CRITICAL FIX: Now actually grants access when approving!
 */
export const updateStatus = mutation({
  args: {
    requestId: v.id("accessRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only super_admin and admin can update status
    if (user.role !== "super_admin" && user.role !== "admin") {
      throw new Error("Administrator access required");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: args.status,
      reviewedBy: userId,
      reviewedAt: Date.now(),
      adminNotes: args.adminNotes,
      updatedAt: Date.now(),
    });

    const now = Date.now();

    // CRITICAL: If approved, grant actual access to the budget page
    if (args.status === "approved") {
      // Check if user already has access
      const existingAccess = await ctx.db
        .query("budgetSharedAccess")
        .withIndex("userIdAndActive", (q) =>
          q.eq("userId", request.userId).eq("isActive", true)
        )
        .first();

      if (!existingAccess) {
        // Grant access with viewer level by default
        await ctx.db.insert("budgetSharedAccess", {
          userId: request.userId,
          accessLevel: "viewer",
          grantedBy: userId,
          grantedAt: now,
          isActive: true,
          notes: `Access granted via request approval. Request ID: ${args.requestId}`,
        });
      }
    }

    // TRUST FUND ACCESS APPROVAL
    if (args.status === "approved" && request.accessType === "trustFund") {
      // Check if user already has trust fund access
      const existingAccess = await ctx.db
        .query("trustFundSharedAccess")
        .withIndex("userIdAndActive", (q) => 
          q.eq("userId", request.userId).eq("isActive", true)
        )
        .first();

      if (!existingAccess) {
        // Grant access with viewer level by default
        await ctx.db.insert("trustFundSharedAccess", {
          userId: request.userId,
          accessLevel: "viewer",
          grantedBy: userId,
          grantedAt: now,
          isActive: true,
          notes: `Access granted via request approval. Request ID: ${args.requestId}`,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Get pending access requests for a specific particular code
 * Returns properly typed data for frontend consumption
 */
export const getParticularPendingRequests = query({
  args: { particularCode: v.string() },
  handler: async (ctx, args): Promise<Array<{
    _id: Id<"accessRequests">;
    userId: Id<"users">;
    pageRequested: string;
    accessType: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    createdAt: number;
    user: {
      _id: Id<"users">;
      name?: string;
      email?: string;
      departmentName?: string;
    } | null;
  }>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) return [];

    // Only admins can view pending requests
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "super_admin"
    ) {
      return [];
    }

    // Get all pending requests
    const allRequests = await ctx.db
      .query("accessRequests")
      .withIndex("status", (q) => q.eq("status", "pending"))
      .collect();

    // Filter for particular-specific requests
    const particularRequests = allRequests.filter(
      (request) => request.pageRequested === args.particularCode
    );

    // Enrich with user data
    const enrichedRequests = await Promise.all(
      particularRequests.map(async (request) => {
        const user = await ctx.db.get(request.userId);
        
        // Build simplified user object
        let userInfo: {
          _id: Id<"users">;
          name?: string;
          email?: string;
          departmentName?: string;
        } | null = null;

        if (user) {
          let departmentName: string | undefined = undefined;
          if (user.departmentId) {
            const dept = await ctx.db.get(user.departmentId);
            departmentName = dept?.name;
          }

          userInfo = {
            _id: user._id,
            name: user.name || 
                  (user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`.trim() 
                    : undefined),
            email: user.email,
            departmentName,
          };
        }

        return {
          _id: request._id,
          userId: request.userId,
          pageRequested: request.pageRequested,
          accessType: request.accessType,
          reason: request.reason,
          status: request.status as "pending" | "approved" | "rejected",
          createdAt: request.createdAt,
          user: userInfo,
        };
      })
    );

    return enrichedRequests;
  },
});

/**
 * Get count of pending access requests for a specific particular
 */
export const getParticularPendingCount = query({
  args: { particularCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) return 0;

    // Only admins can view pending count
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "super_admin"
    ) {
      return 0;
    }

    // Get all pending requests
    const allRequests = await ctx.db
      .query("accessRequests")
      .withIndex("status", (q) => q.eq("status", "pending"))
      .collect();

    // Count requests for this particular
    const count = allRequests.filter(
      (request) => request.pageRequested === args.particularCode
    ).length;

    return count;
  },
});

/**
 * Request access to a specific particular
 */
export const requestParticularAccess = mutation({
  args: {
    particularCode: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's department name
    let departmentName = "Not Assigned";
    if (user.departmentId) {
      const department = await ctx.db.get(user.departmentId);
      if (department) {
        departmentName = department.name;
      }
    }

    // Check if user already has access
    const existingAccess = await ctx.db
      .query("budgetParticularSharedAccess")
      .withIndex("particularAndUser", (q) =>
        q.eq("particularCode", args.particularCode).eq("userId", userId)
      )
      .first();

    if (existingAccess && existingAccess.isActive) {
      throw new Error("You already have access to this particular");
    }

    // Check if there's already a pending request for this particular
    const allRequests = await ctx.db
      .query("accessRequests")
      .withIndex("userAndStatus", (q) =>
        q.eq("userId", userId).eq("status", "pending")
      )
      .collect();

    const existingRequest = allRequests.find(
      (req) => req.pageRequested === args.particularCode && req.accessType === "particular"
    );

    if (existingRequest) {
      throw new Error("You already have a pending request for this particular");
    }

    // Create access request with accessType: "particular" to differentiate from budget-level
    const requestId = await ctx.db.insert("accessRequests", {
      userId: userId,
      userName: user.name || "Unknown",
      userEmail: user.email || "No email",
      departmentName: departmentName,
      departmentId: user.departmentId,
      pageRequested: args.particularCode,
      accessType: "particular", // ✅ IMPORTANT: This differentiates particular requests
      reason: args.reason || "Request access to view this particular",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return requestId;
  },
});

/**
 * Approve an access request (handles both budget and particular)
 */
export const approveRequest = mutation({
  args: { requestId: v.id("accessRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only admins can approve requests
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "super_admin"
    ) {
      throw new Error("Only admins can approve access requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const now = Date.now();

    // Grant access based on access type
    if (request.accessType === "particular") {
      // Grant particular-level access
      const existingAccess = await ctx.db
        .query("budgetParticularSharedAccess")
        .withIndex("particularAndUser", (q) =>
          q
            .eq("particularCode", request.pageRequested)
            .eq("userId", request.userId)
        )
        .first();

      if (existingAccess) {
        // Reactivate existing access
        await ctx.db.patch(existingAccess._id, {
          isActive: true,
          grantedBy: userId,
          grantedAt: now,
        });
      } else {
        // Create new access record
        await ctx.db.insert("budgetParticularSharedAccess", {
          particularCode: request.pageRequested,
          userId: request.userId,
          accessLevel: "viewer",
          isActive: true,
          grantedBy: userId,
          grantedAt: now,
        });
      }
    } else {
      // Grant budget-level access (existing functionality)
      const existingAccess = await ctx.db
        .query("budgetSharedAccess")
        .withIndex("userIdAndActive", (q) =>
          q.eq("userId", request.userId).eq("isActive", true)
        )
        .first();

      if (!existingAccess) {
        await ctx.db.insert("budgetSharedAccess", {
          userId: request.userId,
          accessLevel: "viewer",
          grantedBy: userId,
          grantedAt: now,
          isActive: true,
          notes: `Access granted via request approval. Request ID: ${args.requestId}`,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Reject an access request
 */
export const rejectRequest = mutation({
  args: { requestId: v.id("accessRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only admins can reject requests
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "super_admin"
    ) {
      throw new Error("Only admins can reject access requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});