// convex/trustFundAccess.ts

import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Check if current user can access trust funds page
 * ROBUST CHECK: Checks admin role OR shared access
 */
export const canAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { 
        canAccess: false, 
        user: null,
        department: null,
        accessLevel: null,
        reason: "Not authenticated",
      };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { 
        canAccess: false, 
        user: null,
        department: null,
        accessLevel: null,
        reason: "User not found",
      };
    }

    let canAccess = false;
    let accessLevel = null;
    let accessSource = null;

    // FIRST: Check if user is super_admin or admin (highest priority)
    if (user.role === "super_admin" || user.role === "admin") {
      canAccess = true;
      accessLevel = "admin";
      accessSource = "role";
    } 
    // SECOND: Check for shared access (if not admin)
    else {
      const sharedAccess = await ctx.db
        .query("trustFundSharedAccess")
        .withIndex("userIdAndActive", (q) => 
          q.eq("userId", userId).eq("isActive", true)
        )
        .first();

      if (sharedAccess) {
        // Check if access has expired
        if (!sharedAccess.expiresAt || sharedAccess.expiresAt > Date.now()) {
          canAccess = true;
          accessLevel = sharedAccess.accessLevel;
          accessSource = "shared";
        } else {
          canAccess = false;
          accessLevel = null;
          accessSource = "expired";
        }
      }
    }

    // Get department info if available
    let department = null;
    if (user.departmentId) {
      department = await ctx.db.get(user.departmentId);
    }

    return {
      canAccess,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        departmentId: user.departmentId,
      },
      department: department ? {
        id: department._id,
        name: department.name,
        code: department.code,
      } : null,
      accessLevel,
      accessSource,
      reason: !canAccess ? "No access granted" : undefined,
    };
  },
});
