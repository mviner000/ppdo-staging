// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * Users.
   * Extended with role-based access control and account status tracking.
   */
  users: defineTable({
    // Existing fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    
    // New fields for user management
    /**
     * User role for access control.
     * - administrator: Full system access, can manage all users and resources
     * - user: Standard access, can manage own resources
     * - viewer: Read-only access, cannot modify resources
     * @default "user"
     */
    role: v.optional(
      v.union(
        v.literal("administrator"),
        v.literal("user"),
        v.literal("viewer")
      )
    ),
    
    /**
     * Account status.
     * - active: Normal account, can sign in and use the system
     * - inactive: Account disabled, cannot sign in (e.g., user requested deactivation)
     * - suspended: Account suspended by admin, cannot sign in (e.g., policy violation)
     * @default "active"
     */
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("suspended")
      )
    ),
    
    /**
     * Last successful login timestamp (milliseconds since epoch).
     * Updated on each successful authentication.
     */
    lastLogin: v.optional(v.number()),
    
    /**
     * Timestamp when the user was created (milliseconds since epoch).
     * Set once during user registration.
     */
    createdAt: v.optional(v.number()),
    
    /**
     * Timestamp when the user record was last updated (milliseconds since epoch).
     * Updated on any user data modification.
     */
    updatedAt: v.optional(v.number()),
    
    /**
     * Optional: Reason for suspension (only relevant when status is "suspended").
     */
    suspensionReason: v.optional(v.string()),
    
    /**
     * Optional: ID of the administrator who suspended the account.
     */
    suspendedBy: v.optional(v.id("users")),
    
    /**
     * Optional: Timestamp when the suspension was applied.
     */
    suspendedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    // New indexes for efficient queries
    .index("role", ["role"])
    .index("status", ["status"])
    .index("roleAndStatus", ["role", "status"])
    .index("lastLogin", ["lastLogin"])
    .index("createdAt", ["createdAt"]),

  /**
   * Sessions.
   * A single user can have multiple active sessions.
   * See [Session document lifecycle](https://labs.convex.dev/auth/advanced#session-document-lifecycle).
   */
  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId"]),

  /**
   * Accounts. An account corresponds to
   * a single authentication provider.
   * A single user can have multiple accounts linked.
   */
  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("userIdAndProvider", ["userId", "provider"])
    .index("providerAndAccountId", ["provider", "providerAccountId"]),

  /**
   * Refresh tokens.
   */
  authRefreshTokens: defineTable({
    sessionId: v.id("authSessions"),
    expirationTime: v.number(),
    firstUsedTime: v.optional(v.number()),
    parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
  })
    .index("sessionId", ["sessionId"])
    .index("sessionIdAndParentRefreshTokenId", [
      "sessionId",
      "parentRefreshTokenId",
    ]),

  /**
   * Verification codes.
   */
  authVerificationCodes: defineTable({
    accountId: v.id("authAccounts"),
    provider: v.string(),
    code: v.string(),
    expirationTime: v.number(),
    verifier: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("accountId", ["accountId"])
    .index("code", ["code"]),

  /**
   * PKCE verifiers for OAuth.
   */
  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.optional(v.string()),
  }).index("signature", ["signature"]),

  /**
   * Rate limits for OTP and password sign-in.
   */
  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsLeft: v.number(),
  }).index("identifier", ["identifier"]),

  /**
   * Audit log for user management actions.
   * Tracks administrative actions for compliance and debugging.
   */
  userAuditLog: defineTable({
    /**
     * The user who performed the action.
     */
    performedBy: v.id("users"),
    
    /**
     * The user who was affected by the action.
     */
    targetUserId: v.id("users"),
    
    /**
     * Type of action performed.
     */
    action: v.union(
      v.literal("role_changed"),
      v.literal("status_changed"),
      v.literal("user_created"),
      v.literal("user_updated"),
      v.literal("user_deleted")
    ),
    
    /**
     * Previous values before the change (JSON string).
     */
    previousValues: v.optional(v.string()),
    
    /**
     * New values after the change (JSON string).
     */
    newValues: v.optional(v.string()),
    
    /**
     * Optional reason or notes for the action.
     */
    notes: v.optional(v.string()),
    
    /**
     * Timestamp when the action was performed.
     */
    timestamp: v.number(),
    
    /**
     * IP address from which the action was performed (if available).
     */
    ipAddress: v.optional(v.string()),
  })
    .index("targetUserId", ["targetUserId"])
    .index("performedBy", ["performedBy"])
    .index("timestamp", ["timestamp"])
    .index("action", ["action"]),

  /**
   * Budget Items.
   * Tracks budget allocation and utilization for different particulars/projects.
   */
  budgetItems: defineTable({
    /**
     * Name or description of the budget item (e.g., "GAD", "Infrastructure", etc.)
     */
    particulars: v.string(),
    
    /**
     * Total budget allocated for this item (in currency).
     */
    totalBudgetAllocated: v.number(),
    
    /**
     * Total budget utilized so far (in currency).
     */
    totalBudgetUtilized: v.number(),
    
    /**
     * Utilization rate as a percentage (0-100).
     * Calculated as: (totalBudgetUtilized / totalBudgetAllocated) * 100
     */
    utilizationRate: v.number(),
    
    /**
     * Project completion percentage (0-100).
     */
    projectCompleted: v.number(),
    
    /**
     * Project delayed percentage (0-100).
     */
    projectDelayed: v.number(),
    
    /**
     * Projects on track percentage (0-100).
     */
    projectsOnTrack: v.number(),
    
    /**
     * User who created this budget item.
     */
    createdBy: v.id("users"),
    
    /**
     * Timestamp when the budget item was created (milliseconds since epoch).
     */
    createdAt: v.number(),
    
    /**
     * Timestamp when the budget item was last updated (milliseconds since epoch).
     */
    updatedAt: v.number(),
    
    /**
     * Optional: User who last updated this budget item.
     */
    updatedBy: v.optional(v.id("users")),
    
    /**
     * Optional: Additional notes or remarks about this budget item.
     */
    notes: v.optional(v.string()),
  })
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("updatedAt", ["updatedAt"])
    .index("particulars", ["particulars"]),

  /**
   * Projects.
   * Tracks individual projects with budget allocation, timelines, and progress.
   * Can be linked to budget items for hierarchical budget tracking.
   */
  projects: defineTable({
    /**
     * Name of the project.
     */
    projectName: v.string(),
    
    /**
     * Office or department implementing the project.
     */
    implementingOffice: v.string(),
    
    /**
     * Initial budget allocated for this project (in currency).
     */
    allocatedBudget: v.number(),
    
    /**
     * Revised budget after adjustments (in currency).
     * If not set, allocatedBudget is used for calculations.
     */
    revisedBudget: v.optional(v.number()),
    
    /**
     * Total budget utilized so far (in currency).
     */
    totalBudgetUtilized: v.number(),
    
    /**
     * Utilization rate as a percentage (0-100).
     * Calculated as: (totalBudgetUtilized / effectiveBudget) * 100
     * where effectiveBudget is revisedBudget if set, otherwise allocatedBudget
     */
    utilizationRate: v.number(),
    
    /**
     * Remaining budget balance (in currency).
     * Calculated as: effectiveBudget - totalBudgetUtilized
     */
    balance: v.number(),
    
    /**
     * Date when the project started (milliseconds since epoch).
     */
    dateStarted: v.number(),
    
    /**
     * Target or actual completion date (milliseconds since epoch).
     * Optional until project is completed.
     */
    completionDate: v.optional(v.number()),
    
    /**
     * Expected completion date (milliseconds since epoch).
     * Used to track if project is delayed.
     */
    expectedCompletionDate: v.optional(v.number()),
    
    /**
     * Project accomplishment/progress percentage (0-100).
     */
    projectAccomplishment: v.number(),
    
    /**
     * Current status of the project.
     * - on_track: Project is progressing as planned
     * - delayed: Project is behind schedule
     * - completed: Project is finished
     * - cancelled: Project was cancelled
     * - on_hold: Project is temporarily paused
     * @default "on_track"
     */
    status: v.optional(
      v.union(
        v.literal("on_track"),
        v.literal("delayed"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("on_hold")
      )
    ),
    
    /**
     * Optional remarks or notes about the project.
     */
    remarks: v.optional(v.string()),
    
    /**
     * Optional: Link to parent budget item if this project is part of a larger budget allocation.
     */
    budgetItemId: v.optional(v.id("budgetItems")),
    
    /**
     * User who created this project record.
     */
    createdBy: v.id("users"),
    
    /**
     * Timestamp when the project record was created (milliseconds since epoch).
     */
    createdAt: v.number(),
    
    /**
     * Timestamp when the project record was last updated (milliseconds since epoch).
     */
    updatedAt: v.number(),
    
    /**
     * Optional: User who last updated this project record.
     */
    updatedBy: v.optional(v.id("users")),
  })
    .index("projectName", ["projectName"])
    .index("implementingOffice", ["implementingOffice"])
    .index("status", ["status"])
    .index("dateStarted", ["dateStarted"])
    .index("completionDate", ["completionDate"])
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("budgetItemId", ["budgetItemId"])
    .index("statusAndOffice", ["status", "implementingOffice"])
    .index("officeAndStatus", ["implementingOffice", "status"]),


  /**
   * Media files.
   * Stores uploaded images and other media with user ownership.
   */
  media: defineTable({
    /**
     * Reference to the file in Convex storage.
     */
    storageId: v.id("_storage"),
    
    /**
     * Original filename.
     */
    name: v.string(),
    
    /**
     * MIME type (e.g., "image/jpeg", "image/png").
     */
    type: v.string(),
    
    /**
     * File size in bytes.
     */
    size: v.number(),
    
    /**
     * User who uploaded this media.
     */
    userId: v.id("users"),
    
    /**
     * Timestamp when the media was uploaded (milliseconds since epoch).
     */
    uploadedAt: v.number(),
    
    /**
     * Timestamp when the media record was created (milliseconds since epoch).
     */
    createdAt: v.number(),
    
    /**
     * Timestamp when the media record was last updated (milliseconds since epoch).
     */
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("uploadedAt", ["uploadedAt"])
    .index("type", ["type"])
    .index("userIdAndUploadedAt", ["userId", "uploadedAt"]),

  numbers: defineTable({
    value: v.number(),
  }),
});