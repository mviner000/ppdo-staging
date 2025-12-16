// convex/auth.ts

import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // Initialize new users with default role and status
      if (args.existingUserId === undefined) {
        // This is a new user
        const now = Date.now();
        await ctx.db.patch(args.userId, {
          role: "user",
          status: "active",
          createdAt: now,
          updatedAt: now,
          lastLogin: now,
        });
      } else {
        // Existing user - update last login
        const now = Date.now();
        await ctx.db.patch(args.userId, {
          lastLogin: now,
          updatedAt: now,
        });
      }
    },
  },
});

/**
 * Initialize new user with default role and status
 * This runs after a user signs up via Convex Auth
 */
export const initializeNewUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    // Only initialize if the user doesn't already have role/status set
    if (user && (!user.role || !user.status)) {
      const now = Date.now();
      await ctx.db.patch(args.userId, {
        role: user.role || "user",
        status: user.status || "active",
        createdAt: user.createdAt || user._creationTime,
        updatedAt: now,
        lastLogin: now,
      });
    }
  },
});

/**
 * Create a new user (admin and super_admin only)
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("user")
    ),
    departmentId: v.optional(v.id("departments")),
    position: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("suspended")
      )
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can create users
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }
    
    // Only super_admin can create other super_admins
    if (args.role === "super_admin" && currentUser.role !== "super_admin") {
      throw new Error("Not authorized - only super_admin can create other super_admins");
    }

    // Check if email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Verify department exists if provided
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department) {
        throw new Error("Department not found");
      }
    }

    const now = Date.now();
    
    // Create the user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      departmentId: args.departmentId,
      position: args.position,
      employeeId: args.employeeId,
      status: args.status || "active",
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      failedLoginAttempts: 0,
    });

    // Log the action
    await ctx.db.insert("userAuditLog", {
      performedBy: currentUserId,
      targetUserId: userId,
      action: "user_created",
      newValues: JSON.stringify({
        name: args.name,
        email: args.email,
        role: args.role,
        departmentId: args.departmentId,
        status: args.status || "active",
      }),
      timestamp: now,
    });

    return { userId, success: true };
  },
});

/**
 * Update user profile information (admin and super_admin only)
 */
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    position: v.optional(v.string()),
    employeeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can update user profiles
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Admin cannot update super_admin profiles
    if (currentUser.role === "admin" && targetUser.role === "super_admin") {
      throw new Error("Not authorized - cannot modify super_admin profile");
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.position !== undefined) updateData.position = args.position;
    if (args.employeeId !== undefined) updateData.employeeId = args.employeeId;

    await ctx.db.patch(args.userId, updateData);

    // Log the action
    await ctx.db.insert("userAuditLog", {
      performedBy: currentUserId,
      targetUserId: args.userId,
      action: "user_updated",
      previousValues: JSON.stringify({
        name: targetUser.name,
        position: targetUser.position,
        employeeId: targetUser.employeeId,
      }),
      newValues: JSON.stringify(updateData),
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Delete a user (admin and super_admin only)
 */
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can delete users
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    // Cannot delete yourself
    if (currentUserId === args.userId) {
      throw new Error("Cannot delete your own account");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Admin cannot delete super_admin
    if (currentUser.role === "admin" && targetUser.role === "super_admin") {
      throw new Error("Not authorized - cannot delete super_admin");
    }

    const now = Date.now();

    // Log the action before deletion
    await ctx.db.insert("userAuditLog", {
      performedBy: currentUserId,
      targetUserId: args.userId,
      action: "user_deleted",
      previousValues: JSON.stringify({
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
      }),
      timestamp: now,
    });

    // Delete related sessions
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete related accounts
    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    // Delete user permissions
    const userPermissions = await ctx.db
      .query("userPermissions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const permission of userPermissions) {
      await ctx.db.delete(permission._id);
    }

    // Delete device fingerprints
    const devices = await ctx.db
      .query("deviceFingerprints")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const device of devices) {
      await ctx.db.delete(device._id);
    }

    // Delete login locations
    const locations = await ctx.db
      .query("loginLocations")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const location of locations) {
      await ctx.db.delete(location._id);
    }

    // Finally, delete the user
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});

/**
 * Verify user can sign in based on status
 * Enhanced with login attempt recording
 */
export const verifyUserCanSignIn = query({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.email) {
      return { allowed: true };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return { allowed: true }; // Let auth handle user not found
    }

    // Check if account is locked
    if (user.isLocked) {
      return {
        allowed: false,
        reason: user.lockReason || "Your account has been locked for security reasons.",
      };
    }

    // Check if status field exists (for backward compatibility)
    if (user.status === undefined) {
      return { allowed: true };
    }

    if (user.status === "suspended") {
      return {
        allowed: false,
        reason: user.suspensionReason || "Your account has been suspended.",
      };
    }

    if (user.status === "inactive") {
      return {
        allowed: false,
        reason: "Your account is inactive. Please contact support.",
      };
    }

    return { allowed: true };
  },
});

/**
 * Record successful login
 * Call this after successful authentication
 */
export const recordSuccessfulLogin = mutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()), 
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.id("authSessions")),
    location: v.optional(v.string()), // NEW: Simple location string like "City, Region, Country"
    geoLocation: v.optional(v.string()), // NEW: Full geo data as JSON string
  },
  handler: async (ctx, args) => {
    let user = null;
    
    // Find user by ID or Email
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else if (args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .first();
    }

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user._id;
    const now = Date.now();

    // Parse user agent to extract device and browser info
    const deviceInfo = parseUserAgent(args.userAgent);
    
    // Use provided geoLocation or fall back to IP-based parsing
    let geoLocation = null;
    if (args.geoLocation) {
      try {
        geoLocation = JSON.parse(args.geoLocation);
      } catch (e) {
        // If parsing fails, fall back to IP-based
        geoLocation = await parseIPAddress(args.ipAddress);
      }
    } else {
      geoLocation = await parseIPAddress(args.ipAddress);
    }

    // Record login attempt
    await ctx.db.insert("loginAttempts", {
      userId: userId,
      identifier: user.email || args.email || "unknown",
      status: "success",
      ipAddress: args.ipAddress,
      geoLocation: geoLocation ? JSON.stringify(geoLocation) : undefined,
      deviceInfo: JSON.stringify(deviceInfo.device),
      browserInfo: JSON.stringify(deviceInfo.browser),
      sessionId: args.sessionId,
      timestamp: now,
      riskScore: 0,
      flaggedForReview: false,
    });

    // Update user's last login and reset failed attempts
    await ctx.db.patch(userId, {
      lastLogin: now,
      failedLoginAttempts: 0,
      updatedAt: now,
    });

    // Update or create device fingerprint
    const fingerprint = generateDeviceFingerprint(args.ipAddress, args.userAgent);
    const existingDevice = await ctx.db
      .query("deviceFingerprints")
      .withIndex("userAndFingerprint", (q) => 
        q.eq("userId", userId).eq("fingerprint", fingerprint)
      )
      .first();

    if (existingDevice) {
      // Update existing device
      await ctx.db.patch(existingDevice._id, {
        lastSeen: now,
        lastIpAddress: args.ipAddress,
        loginCount: existingDevice.loginCount + 1,
        isActive: true,
      });
    } else {
      // Create new device
      await ctx.db.insert("deviceFingerprints", {
        userId: userId,
        fingerprint,
        deviceInfo: JSON.stringify(deviceInfo.device),
        browserInfo: JSON.stringify(deviceInfo.browser),
        firstSeen: now,
        lastSeen: now,
        lastIpAddress: args.ipAddress,
        isTrusted: false,
        loginCount: 1,
        isActive: true,
      });
    }

    // Update or create login location
    if (geoLocation && geoLocation.city && geoLocation.country) {
      const existingLocation = await ctx.db
        .query("loginLocations")
        .withIndex("userAndLocation", (q) => 
          q.eq("userId", userId)
           .eq("city", geoLocation.city)
           .eq("country", geoLocation.country)
        )
        .first();

      if (existingLocation) {
        await ctx.db.patch(existingLocation._id, {
          lastSeen: now,
          loginCount: existingLocation.loginCount + 1,
        });
      } else {
        // Create new location entry
        await ctx.db.insert("loginLocations", {
          userId: userId,
          city: geoLocation.city,
          region: geoLocation.region || "Unknown",
          country: geoLocation.country,
          coordinates: geoLocation.coordinates 
            ? JSON.stringify(geoLocation.coordinates) 
            : JSON.stringify({ lat: 0, lng: 0 }),
          firstSeen: now,
          lastSeen: now,
          isTrusted: false,
          loginCount: 1,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Record failed login attempt
 * Call this when login fails (e.g. invalid password)
 */
export const recordFailedLogin = mutation({
  args: {
    email: v.string(),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    failureReason: v.string(),
    location: v.optional(v.string()), // NEW: Simple location string
    geoLocation: v.optional(v.string()), // NEW: Full geo data as JSON string
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();
    const deviceInfo = parseUserAgent(args.userAgent);
    
    // Use provided geoLocation or fall back to IP-based parsing
    let geoLocation = null;
    if (args.geoLocation) {
      try {
        geoLocation = JSON.parse(args.geoLocation);
      } catch (e) {
        // If parsing fails, fall back to IP-based
        geoLocation = await parseIPAddress(args.ipAddress);
      }
    } else {
      geoLocation = await parseIPAddress(args.ipAddress);
    }

    // Calculate risk score
    let riskScore = 20; // Base score for failed login
    const riskFactors: string[] = [];

    // Check for multiple failed attempts
    if (user) {
      const recentFailedAttempts = await ctx.db
        .query("loginAttempts")
        .withIndex("userAndStatus", (q) => 
          q.eq("userId", user._id).eq("status", "failed")
        )
        .order("desc")
        .take(10);

      const recentCount = recentFailedAttempts.filter(
        a => a.timestamp > now - 60 * 60 * 1000 // Last hour
      ).length;

      if (recentCount > 3) {
        riskScore += 30;
        riskFactors.push("multiple_failed_attempts");
      }

      // Check for unusual location
      if (geoLocation && geoLocation.city && geoLocation.country) {
        const knownLocations = await ctx.db
          .query("loginLocations")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .collect();
        
        const locationKnown = knownLocations.some(
          loc => loc.city === geoLocation.city && loc.country === geoLocation.country
        );

        if (!locationKnown) {
          riskScore += 25;
          riskFactors.push("unusual_location");
        }
      }
    } else {
      // User does not exist, but we still log it with a high initial risk
      riskScore += 10;
      riskFactors.push("unknown_user");
    }

    const status = riskScore > 70 ? "suspicious" : "failed";

    // Record login attempt
    const attemptId = await ctx.db.insert("loginAttempts", {
      userId: user?._id,
      identifier: args.email,
      status,
      failureReason: args.failureReason,
      ipAddress: args.ipAddress,
      geoLocation: geoLocation ? JSON.stringify(geoLocation) : undefined,
      deviceInfo: JSON.stringify(deviceInfo.device),
      browserInfo: JSON.stringify(deviceInfo.browser),
      timestamp: now,
      riskScore,
      riskFactors: JSON.stringify(riskFactors),
      flaggedForReview: riskScore > 70,
    });

    // Update user's failed login count if they exist
    if (user) {
      const failedCount = (user.failedLoginAttempts || 0) + 1;
      
      await ctx.db.patch(user._id, {
        failedLoginAttempts: failedCount,
        lastFailedLogin: now,
        updatedAt: now,
      });

      // Lock account if too many failed attempts
      if (failedCount >= 5) {
        await ctx.db.patch(user._id, {
          isLocked: true,
          lockReason: `Account locked after ${failedCount} failed login attempts`,
          lockedAt: now,
        });

        // Create security alert
        await ctx.db.insert("securityAlerts", {
          type: "account_locked",
          severity: "high",
          userId: user._id,
          loginAttemptId: attemptId,
          title: "Account Locked - Multiple Failed Attempts",
          description: `Account ${args.email} has been locked after ${failedCount} failed login attempts.`,
          status: "open",
          createdAt: now,
        });
      } else if (riskScore > 70) {
        // Create security alert for suspicious attempt
        await ctx.db.insert("securityAlerts", {
          type: "suspicious_login",
          severity: "medium",
          userId: user._id,
          loginAttemptId: attemptId,
          title: "Suspicious Login Attempt",
          description: `Suspicious login attempt detected for ${args.email} from ${args.ipAddress}`,
          metadata: JSON.stringify({ riskScore, riskFactors }),
          status: "open",
          createdAt: now,
        });
      }
    }

    return { success: true, riskScore, status };
  },
});

/**
 * Get current authenticated user with full details
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Update user role (super_admin or admin only)
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can change roles
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }
    
    // Only super_admin can create other super_admins
    if (args.newRole === "super_admin" && currentUser.role !== "super_admin") {
      throw new Error("Not authorized - only super_admin can create other super_admins");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: now,
    });

    // Log the action
    await ctx.db.insert("userAuditLog", {
      performedBy: currentUserId,
      targetUserId: args.userId,
      action: "role_changed",
      previousValues: JSON.stringify({ role: targetUser.role }),
      newValues: JSON.stringify({ role: args.newRole }),
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Update user status (super_admin or admin only)
 */
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    newStatus: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can change status
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    // Admin cannot suspend/deactivate super_admin
    if (currentUser.role === "admin" && targetUser.role === "super_admin") {
      throw new Error("Not authorized - cannot modify super_admin status");
    }

    const now = Date.now();
    const updateData: any = {
      status: args.newStatus,
      updatedAt: now,
    };

    if (args.newStatus === "suspended") {
      updateData.suspensionReason = args.reason;
      updateData.suspendedBy = currentUserId;
      updateData.suspendedAt = now;
    } else {
      // Clear suspension data if status changed from suspended
      updateData.suspensionReason = undefined;
      updateData.suspendedBy = undefined;
      updateData.suspendedAt = undefined;
    }

    await ctx.db.patch(args.userId, updateData);

    // Log the action
    await ctx.db.insert("userAuditLog", {
      performedBy: currentUserId,
      targetUserId: args.userId,
      action: "status_changed",
      previousValues: JSON.stringify({ status: targetUser.status }),
      newValues: JSON.stringify({ 
        status: args.newStatus, 
        reason: args.reason 
      }),
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Update user department
 */
export const updateUserDepartment = mutation({
  args: {
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can assign departments
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    // Verify department exists if provided
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department) {
        throw new Error("Department not found");
      }
    }

    const now = Date.now();
    await ctx.db.patch(args.userId, {
      departmentId: args.departmentId,
      updatedAt: now,
    });

    // Log the action
    await ctx.db.insert("userAuditLog", {
      performedBy: currentUserId,
      targetUserId: args.userId,
      action: "department_assigned",
      previousValues: JSON.stringify({ departmentId: targetUser.departmentId }),
      newValues: JSON.stringify({ departmentId: args.departmentId }),
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * List all users (super_admin or admin only)
 */
export const listAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(userId);
    
    // Only super_admin and admin can list users
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const limit = args.limit || 100;
    let users;
    
    if (args.departmentId) {
      // Filter by department
      users = await ctx.db
        .query("users")
        .withIndex("departmentId", (q) => q.eq("departmentId", args.departmentId))
        .order("desc")
        .take(limit);
    } else if (currentUser.role === "admin" && currentUser.departmentId) {
      // Admins can only see users in their department (unless they're super_admin)
      users = await ctx.db
        .query("users")
        .withIndex("departmentId", (q) => q.eq("departmentId", currentUser.departmentId))
        .order("desc")
        .take(limit);
    } else {
      // Super_admin can see all users
      users = await ctx.db
        .query("users")
        .order("desc")
        .take(limit);
    }

    // Get department info for each user
    const usersWithDepartments = await Promise.all(
      users.map(async (user) => {
        let department = null;
        if (user.departmentId) {
          department = await ctx.db.get(user.departmentId);
        }
        
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          suspensionReason: user.suspensionReason,
          departmentId: user.departmentId,
          departmentName: department?.name,
          position: user.position,
          employeeId: user.employeeId,
        };
      })
    );

    return usersWithDepartments;
  },
});

/**
 * Get user audit log (super_admin or admin only)
 */
export const getUserAuditLog = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    
    // Only super_admin and admin can view audit logs
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const limit = args.limit || 50;

    let logs;
    
    if (args.userId) {
      logs = await ctx.db
        .query("userAuditLog")
        .withIndex("targetUserId", (q) => q.eq("targetUserId", args.userId!))
        .order("desc")
        .take(limit);
    } else {
      logs = await ctx.db
        .query("userAuditLog")
        .order("desc")
        .take(limit);
    }

    // Enrich logs with user information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const performedByUser = await ctx.db.get(log.performedBy);
        
        // Handle optional targetUserId
        let targetUser = null;
        let targetUserEmail = null;
        let targetUserName = null;
        
        if (log.targetUserId) {
          targetUser = await ctx.db.get(log.targetUserId);
          targetUserEmail = targetUser?.email;
          targetUserName = targetUser?.name;
        }
        
        return {
          ...log,
          performedByEmail: performedByUser?.email,
          performedByName: performedByUser?.name,
          targetUserEmail,
          targetUserName,
        };
      })
    );

    return enrichedLogs;
  },
});

// Helper functions

function parseUserAgent(userAgent?: string) {
  // Simple user agent parsing
  const ua = userAgent || "";
  
  const device = {
    type: "Unknown",
    os: "Unknown",
    osVersion: "",
  };
  
  const browser = {
    browser: "Unknown",
    browserVersion: "",
    userAgent: ua,
  };

  // Detect OS
  if (ua.includes("Windows")) {
    device.os = "Windows";
    device.type = "Windows PC";
  } else if (ua.includes("Mac OS")) {
    device.os = "macOS";
    device.type = ua.includes("iPhone") || ua.includes("iPad") ? "iOS Device" : "MacBook";
  } else if (ua.includes("Android")) {
    device.os = "Android";
    device.type = "Android Device";
  } else if (ua.includes("Linux")) {
    device.os = "Linux";
    device.type = "Linux PC";
  }

  // Detect Browser
  if (ua.includes("Chrome") && !ua.includes("Edge")) {
    browser.browser = "Chrome";
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) browser.browserVersion = match[1];
  } else if (ua.includes("Firefox")) {
    browser.browser = "Firefox";
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) browser.browserVersion = match[1];
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser.browser = "Safari";
    const match = ua.match(/Version\/(\d+)/);
    if (match) browser.browserVersion = match[1];
  } else if (ua.includes("Edge")) {
    browser.browser = "Edge";
    const match = ua.match(/Edge\/(\d+)/);
    if (match) browser.browserVersion = match[1];
  }

  return { device, browser };
}

async function parseIPAddress(ipAddress: string) {
  // Simple IP-based geolocation
  // For now, detect if it's a local IP
  if (ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress === "127.0.0.1") {
    return {
      city: "Tarlac City",
      region: "Central Luzon",
      country: "Philippines",
    };
  }

  // For production, implement real geolocation lookup
  return {
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
  };
}

function generateDeviceFingerprint(ipAddress: string, userAgent?: string): string {
  // Simple fingerprinting
  const data = `${ipAddress}-${userAgent || "unknown"}`;
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * Check the onboarding status of the current user.
 * Returns the list of completed steps and necessary data for the onboarding flow.
 */
export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Get all active departments for the selection dropdown
    const departments = await ctx.db
      .query("departments")
      .withIndex("isActive", (q) => q.eq("isActive", true))
      .collect();

    const result = {
      userId: user._id,
      completedSteps: user.completedOnboardingSteps || [],
      currentUserName: user.user_name || "",
      currentDepartmentId: user.departmentId,
      departments: departments.map(d => ({ _id: d._id, name: d.name, code: d.code })),
      hasImage: !!user.image,
    };

    return result;
  },
});

/**
 * Complete the initial onboarding step.
 * Updates username, department, and avatar.
 */
export const completeInitialOnboarding = mutation({
  args: {
    username: v.string(),
    departmentId: v.id("departments"),
    imageStorageId: v.optional(v.string()), // Optional, passed if user uploaded a new one
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const completedSteps = new Set(user.completedOnboardingSteps || []);
    completedSteps.add("initial_profile");

    const updates: any = {
      user_name: args.username,
      departmentId: args.departmentId,
      completedOnboardingSteps: Array.from(completedSteps),
      updatedAt: now,
    };

    // If an image was uploaded, generate the URL and save both ID and URL
    if (args.imageStorageId) {
      const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
      updates.image = imageUrl;
      updates.imageStorageId = args.imageStorageId;
    }

    await ctx.db.patch(userId, updates);

    // Log this significant profile update
    await ctx.db.insert("userAuditLog", {
      performedBy: userId,
      targetUserId: userId,
      action: "user_updated",
      notes: "Completed initial onboarding",
      newValues: JSON.stringify({
        user_name: args.username,
        departmentId: args.departmentId,
        hasImage: !!args.imageStorageId
      }),
      timestamp: now,
    });

    return { success: true };
  },
});