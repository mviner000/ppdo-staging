// app/dashboard/project/[year]/types/access.types.ts

import { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// ACCESS & USER TYPES
// ============================================================================

/**
 * Access check result
 */
export interface AccessCheck {
  canAccess: boolean;
  user?: {
    name?: string;
    email?: string;
    role?: "super_admin" | "admin" | "inspector" | "user";
  };
  department?: {
    name?: string;
  };
}

/**
 * User from list query
 */
export interface UserFromList {
  _id: Id<"users">;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nameExtension?: string;
  name?: string;
  email?: string;
  departmentName?: string;
  role?: "super_admin" | "admin" | "inspector" | "user";
  status?: "active" | "inactive" | "suspended";
}

/**
 * User role type
 */
export type UserRole = "super_admin" | "admin" | "inspector" | "user";

/**
 * User status type
 */
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * Access level type
 */
export type AccessLevel = "viewer" | "editor" | "admin";