// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * Departments.
   * Organizational units with hierarchical structure support.
   */
  departments: defineTable({
    /**
     * Department name (e.g., "Finance Department", "HR Department")
     */
    name: v.string(),
    
    /**
     * Short code for the department (e.g., "FIN", "HR", "ENG")
     * Used for quick reference and categorization
     */
    code: v.string(),
    
    /**
     * Full description of the department's responsibilities
     */
    description: v.optional(v.string()),
    
    /**
     * Parent department ID for hierarchical structure
     * null for top-level departments
     */
    parentDepartmentId: v.optional(v.id("departments")),
    
    /**
     * Department head/manager user ID
     */
    headUserId: v.optional(v.id("users")),
    
    /**
     * Contact email for the department
     */
    email: v.optional(v.string()),
    
    /**
     * Contact phone number
     */
    phone: v.optional(v.string()),
    
    /**
     * Physical location/office
     */
    location: v.optional(v.string()),
    
    /**
     * Whether this department is currently active
     */
    isActive: v.boolean(),
    
    /**
     * Display order for sorting departments
     */
    displayOrder: v.optional(v.number()),
    
    /**
     * User who created this department
     */
    createdBy: v.id("users"),
    
    /**
     * Timestamp when created
     */
    createdAt: v.number(),
    
    /**
     * Timestamp when last updated
     */
    updatedAt: v.number(),
    
    /**
     * User who last updated this department
     */
    updatedBy: v.optional(v.id("users")),
  })
    .index("name", ["name"])
    .index("code", ["code"])
    .index("parentDepartmentId", ["parentDepartmentId"])
    .index("headUserId", ["headUserId"])
    .index("isActive", ["isActive"])
    .index("displayOrder", ["displayOrder"]),

  /**
   * Permissions.
   * Defines granular permissions that can be assigned to roles.
   */
  permissions: defineTable({
    /**
     * Unique permission key (e.g., "users.create", "projects.delete", "budgets.approve")
     */
    key: v.string(),
    
    /**
     * Human-readable permission name
     */
    name: v.string(),
    
    /**
     * Description of what this permission allows
     */
    description: v.string(),
    
    /**
     * Category for grouping permissions (e.g., "users", "projects", "budgets", "reports")
     */
    category: v.string(),
    
    /**
     * Whether this permission is currently active
     */
    isActive: v.boolean(),
    
    /**
     * Timestamp when created
     */
    createdAt: v.number(),
    
    /**
     * Timestamp when last updated
     */
    updatedAt: v.number(),
  })
    .index("key", ["key"])
    .index("category", ["category"])
    .index("isActive", ["isActive"]),

  /**
   * Role Permissions.
   * Maps which permissions are assigned to each role.
   * This allows flexible permission management per role.
   */
  rolePermissions: defineTable({
    /**
     * Role this permission is assigned to
     */
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("user")
    ),
    
    /**
     * Permission ID being assigned
     */
    permissionId: v.id("permissions"),
    
    /**
     * Whether this permission is granted (true) or denied (false)
     * Allows for explicit denials if needed
     */
    isGranted: v.boolean(),
    
    /**
     * Timestamp when this permission was assigned
     */
    createdAt: v.number(),
    
    /**
     * User who assigned this permission
     */
    createdBy: v.id("users"),
  })
    .index("role", ["role"])
    .index("permissionId", ["permissionId"])
    .index("roleAndPermission", ["role", "permissionId"]),

  /**
   * Users.
   * Enhanced with RBAC, department relationship, and account status tracking.
   */
  users: defineTable({
    // Basic user information
    name: v.optional(v.string()),
    
    /**
     * Username for login or display (optional, separate from full name)
     * Can be used for @mentions, unique identifiers, etc.
     */
    user_name: v.optional(v.string()),
    
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    
    /**
     * User role for RBAC.
     * - super_admin: Full system access, manage all users, departments, and system settings
     * - admin: Department-level admin, can manage users and resources within their department
     * - user: Standard user access, can manage own resources
     * @default "user"
     */
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("user")
      )
    ),
    
    /**
     * Department this user belongs to
     */
    departmentId: v.optional(v.id("departments")),
    
    /**
     * Job title or position
     */
    position: v.optional(v.string()),
    
    /**
     * Employee ID or staff number
     */
    employeeId: v.optional(v.string()),
    
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
     * Last successful login timestamp
     */
    lastLogin: v.optional(v.number()),
    
    /**
     * Timestamp when the user was created
     */
    createdAt: v.optional(v.number()),
    
    /**
     * Timestamp when the user record was last updated
     */
    updatedAt: v.optional(v.number()),
    
    /**
     * Reason for suspension (only relevant when status is "suspended")
     */
    suspensionReason: v.optional(v.string()),
    
    /**
     * ID of the administrator who suspended the account
     */
    suspendedBy: v.optional(v.id("users")),
    
    /**
     * Timestamp when the suspension was applied
     */
    suspendedAt: v.optional(v.number()),
    
    /**
     * User preferences (stored as JSON string)
     * Can include theme, language, notification settings, etc.
     */
    preferences: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("role", ["role"])
    .index("status", ["status"])
    .index("departmentId", ["departmentId"])
    .index("employeeId", ["employeeId"])
    .index("user_name", ["user_name"])
    .index("roleAndStatus", ["role", "status"])
    .index("departmentAndRole", ["departmentId", "role"])
    .index("lastLogin", ["lastLogin"])
    .index("createdAt", ["createdAt"]),

  /**
   * User Permissions Override.
   * Allows granting or denying specific permissions to individual users,
   * overriding their role's default permissions.
   */
  userPermissions: defineTable({
    /**
     * User receiving the permission override
     */
    userId: v.id("users"),
    
    /**
     * Permission being granted or denied
     */
    permissionId: v.id("permissions"),
    
    /**
     * Whether this permission is granted (true) or denied (false)
     */
    isGranted: v.boolean(),
    
    /**
     * Optional reason for the override
     */
    reason: v.optional(v.string()),
    
    /**
     * Timestamp when this override was created
     */
    createdAt: v.number(),
    
    /**
     * User who created this override
     */
    createdBy: v.id("users"),
    
    /**
     * Optional expiration date for temporary permissions
     */
    expiresAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("permissionId", ["permissionId"])
    .index("userAndPermission", ["userId", "permissionId"])
    .index("expiresAt", ["expiresAt"]),

  /**
   * Sessions.
   * A single user can have multiple active sessions.
   */
  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId"]),

  /**
   * Accounts.
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
   * Audit log for user management and permission changes.
   * Enhanced to track permission and department changes.
   */
  userAuditLog: defineTable({
    /**
     * The user who performed the action
     */
    performedBy: v.id("users"),
    
    /**
     * The user who was affected by the action (null for system-level actions)
     */
    targetUserId: v.optional(v.id("users")),
    
    /**
     * Department affected (if applicable)
     */
    targetDepartmentId: v.optional(v.id("departments")),
    
    /**
     * Type of action performed
     */
    action: v.union(
      v.literal("role_changed"),
      v.literal("status_changed"),
      v.literal("user_created"),
      v.literal("user_updated"),
      v.literal("user_deleted"),
      v.literal("permission_granted"),
      v.literal("permission_revoked"),
      v.literal("department_assigned"),
      v.literal("department_created"),
      v.literal("department_updated"),
      v.literal("department_deleted")
    ),
    
    /**
     * Previous values before the change (JSON string)
     */
    previousValues: v.optional(v.string()),
    
    /**
     * New values after the change (JSON string)
     */
    newValues: v.optional(v.string()),
    
    /**
     * Optional reason or notes for the action
     */
    notes: v.optional(v.string()),
    
    /**
     * Timestamp when the action was performed
     */
    timestamp: v.number(),
    
    /**
     * IP address from which the action was performed
     */
    ipAddress: v.optional(v.string()),
    
    /**
     * User agent string
     */
    userAgent: v.optional(v.string()),
  })
    .index("targetUserId", ["targetUserId"])
    .index("targetDepartmentId", ["targetDepartmentId"])
    .index("performedBy", ["performedBy"])
    .index("timestamp", ["timestamp"])
    .index("action", ["action"]),

  /**
   * Budget Items.
   * Now linked to departments for better organization.
   */
  budgetItems: defineTable({
    particulars: v.string(),
    totalBudgetAllocated: v.number(),
    totalBudgetUtilized: v.number(),
    utilizationRate: v.number(),
    projectCompleted: v.number(),
    projectDelayed: v.number(),
    projectsOnTrack: v.number(),
    
    /**
     * Department responsible for this budget item
     */
    departmentId: v.optional(v.id("departments")),
    
    /**
     * Fiscal year for this budget (e.g., 2024, 2025)
     */
    fiscalYear: v.optional(v.number()),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("updatedAt", ["updatedAt"])
    .index("particulars", ["particulars"])
    .index("departmentId", ["departmentId"])
    .index("fiscalYear", ["fiscalYear"])
    .index("departmentAndYear", ["departmentId", "fiscalYear"]),

  /**
   * Projects.
   * Enhanced with department relationship.
   */
  projects: defineTable({
    projectName: v.string(),
    
    /**
     * Replaced implementingOffice string with department reference
     */
    departmentId: v.id("departments"),
    
    allocatedBudget: v.number(),
    revisedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    utilizationRate: v.number(),
    balance: v.number(),
    dateStarted: v.number(),
    completionDate: v.optional(v.number()),
    expectedCompletionDate: v.optional(v.number()),
    projectAccomplishment: v.number(),
    status: v.optional(
      v.union(
        v.literal("on_track"),
        v.literal("delayed"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("on_hold")
      )
    ),
    remarks: v.optional(v.string()),
    budgetItemId: v.optional(v.id("budgetItems")),
    
    /**
     * Project manager/lead
     */
    projectManagerId: v.optional(v.id("users")),
    
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("projectName", ["projectName"])
    .index("departmentId", ["departmentId"])
    .index("status", ["status"])
    .index("dateStarted", ["dateStarted"])
    .index("completionDate", ["completionDate"])
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("budgetItemId", ["budgetItemId"])
    .index("projectManagerId", ["projectManagerId"])
    .index("statusAndDepartment", ["status", "departmentId"])
    .index("departmentAndStatus", ["departmentId", "status"]),

  /**
   * Upload Sessions.
   */
  uploadSessions: defineTable({
    userId: v.id("users"),
    imageCount: v.number(),
    createdAt: v.number(),
    caption: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("createdAt", ["createdAt"])
    .index("userIdAndCreatedAt", ["userId", "createdAt"]),

  /**
   * Media files.
   */
  media: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    userId: v.id("users"),
    sessionId: v.id("uploadSessions"),
    orderInSession: v.number(),
    uploadedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("sessionId", ["sessionId"])
    .index("uploadedAt", ["uploadedAt"])
    .index("type", ["type"])
    .index("userIdAndUploadedAt", ["userId", "uploadedAt"])
    .index("sessionIdAndOrder", ["sessionId", "orderInSession"]),

  /**
   * Inspections.
   */
  inspections: defineTable({
    projectId: v.id("projects"),
    budgetItemId: v.optional(v.id("budgetItems")),
    programNumber: v.string(),
    title: v.string(),
    category: v.string(),
    inspectionDate: v.number(),
    remarks: v.string(),
    status: v.union(
      v.literal("completed"),
      v.literal("in_progress"),
      v.literal("pending"),
      v.literal("cancelled")
    ),
    viewCount: v.number(),
    uploadSessionId: v.optional(v.id("uploadSessions")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
    metadata: v.optional(v.string()),
  })
    .index("projectId", ["projectId"])
    .index("budgetItemId", ["budgetItemId"])
    .index("status", ["status"])
    .index("category", ["category"])
    .index("inspectionDate", ["inspectionDate"])
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("programNumber", ["programNumber"])
    .index("projectAndStatus", ["projectId", "status"])
    .index("projectAndDate", ["projectId", "inspectionDate"])
    .index("categoryAndStatus", ["category", "status"]),

  /**
   * Remarks.
   */
  remarks: defineTable({
    projectId: v.id("projects"),
    inspectionId: v.optional(v.id("inspections")),
    budgetItemId: v.optional(v.id("budgetItems")),
    content: v.string(),
    category: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      )
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
    tags: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    attachments: v.optional(v.string()),
  })
    .index("projectId", ["projectId"])
    .index("inspectionId", ["inspectionId"])
    .index("budgetItemId", ["budgetItemId"])
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("updatedAt", ["updatedAt"])
    .index("category", ["category"])
    .index("priority", ["priority"])
    .index("projectAndInspection", ["projectId", "inspectionId"])
    .index("projectAndCategory", ["projectId", "category"])
    .index("projectAndCreatedAt", ["projectId", "createdAt"])
    .index("inspectionAndCreatedAt", ["inspectionId", "createdAt"])
    .index("isPinned", ["isPinned"])
    .index("createdByAndProject", ["createdBy", "projectId"]),

  /**
   * Obligations.
   */
  obligations: defineTable({
    projectId: v.id("projects"),
    amount: v.number(),
    name: v.string(),
    email: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("projectId", ["projectId"])
    .index("type", ["type"])
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("projectAndType", ["projectId", "type"]),

  numbers: defineTable({
    value: v.number(),
  }),
});