// convex/schema/trustFundSharedAccess.ts

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const trustFundSharedAccessTables = {
  /**
   * Trust Fund Shared Access
   * Tracks which users have been granted access to the trust funds page
   */
  trustFundSharedAccess: defineTable({
    /**
     * User who has been granted access
     */
    userId: v.id("users"),
    
    /**
     * Access level granted
     */
    accessLevel: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
    
    /**
     * User who granted this access
     */
    grantedBy: v.id("users"),
    
    /**
     * Timestamp when access was granted
     */
    grantedAt: v.number(),
    
    /**
     * Whether this access is currently active
     */
    isActive: v.boolean(),
    
    /**
     * Optional expiration date
     */
    expiresAt: v.optional(v.number()),
    
    /**
     * Optional notes about why access was granted
     */
    notes: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("grantedBy", ["grantedBy"])
    .index("isActive", ["isActive"])
    .index("userIdAndActive", ["userId", "isActive"]),
};