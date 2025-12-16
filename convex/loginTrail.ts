// convex/loginTrail.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Record a login attempt (success or failure)
 * Called during authentication process
 */
export const recordLoginAttempt = mutation({
  args: {
    userId: v.optional(v.id("users")),
    identifier: v.string(),
    status: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("suspicious"),
      v.literal("blocked")
    ),
    failureReason: v.optional(v.string()),
    ipAddress: v.string(),
    geoLocation: v.optional(v.string()), // JSON: { city, region, country, coordinates }
    deviceInfo: v.optional(v.string()), // JSON: { type, os, osVersion, brand, model }
    browserInfo: v.optional(v.string()), // JSON: { browser, browserVersion, userAgent }
    sessionId: v.optional(v.id("authSessions")),
    riskScore: v.optional(v.number()),
    riskFactors: v.optional(v.string()), // JSON array
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Determine if this should be flagged for review
    const flaggedForReview = 
      args.status === "suspicious" || 
      args.status === "blocked" ||
      (args.riskScore !== undefined && args.riskScore > 70);

    const loginAttemptId = await ctx.db.insert("loginAttempts", {
      userId: args.userId,
      identifier: args.identifier,
      status: args.status,
      failureReason: args.failureReason,
      ipAddress: args.ipAddress,
      geoLocation: args.geoLocation,
      deviceInfo: args.deviceInfo,
      browserInfo: args.browserInfo,
      sessionId: args.sessionId,
      timestamp: now,
      riskScore: args.riskScore,
      riskFactors: args.riskFactors,
      flaggedForReview,
    });

    // Update user's failed login count
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user) {
        if (args.status === "success") {
          // Reset failed attempts on successful login
          await ctx.db.patch(args.userId, {
            failedLoginAttempts: 0,
            lastLogin: now,
            updatedAt: now,
          });
        } else if (args.status === "failed") {
          // Increment failed attempts
          const failedCount = (user.failedLoginAttempts || 0) + 1;
          await ctx.db.patch(args.userId, {
            failedLoginAttempts: failedCount,
            lastFailedLogin: now,
            updatedAt: now,
          });

          // Lock account if too many failed attempts
          if (failedCount >= 5) {
            await ctx.db.patch(args.userId, {
              isLocked: true,
              lockReason: `Account locked after ${failedCount} failed login attempts`,
              lockedAt: now,
            });

            // Create security alert
            await ctx.db.insert("securityAlerts", {
              type: "account_locked",
              severity: "high",
              userId: args.userId,
              loginAttemptId,
              title: "Account Locked - Multiple Failed Attempts",
              description: `Account ${args.identifier} has been locked after ${failedCount} failed login attempts.`,
              status: "open",
              createdAt: now,
            });
          }
        }
      }
    }

    // Create security alert for suspicious/blocked attempts
    if (flaggedForReview && args.userId) {
      await ctx.db.insert("securityAlerts", {
        type: args.status === "blocked" ? "brute_force_attempt" : "suspicious_login",
        severity: args.status === "blocked" ? "critical" : "medium",
        userId: args.userId,
        loginAttemptId,
        title: args.status === "blocked" ? "Login Blocked" : "Suspicious Login Detected",
        description: `Login attempt from ${args.ipAddress} was flagged as ${args.status}. Risk score: ${args.riskScore || 0}`,
        metadata: JSON.stringify({
          geoLocation: args.geoLocation,
          deviceInfo: args.deviceInfo,
          riskFactors: args.riskFactors,
        }),
        status: "open",
        createdAt: now,
      });
    }

    return loginAttemptId;
  },
});

/**
 * Get recent login attempts with advanced filtering and pagination
 */
export const getRecentLoginAttempts = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("success"),
        v.literal("failed"),
        v.literal("suspicious"),
        v.literal("blocked")
      )
    ),
    searchTerm: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    location: v.optional(v.string()),
    showPinnedOnly: v.optional(v.boolean()),
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

    const page = args.page || 1;
    const pageSize = args.pageSize || 20;
    const isAdmin = currentUser.role === "super_admin" || currentUser.role === "admin";

    // Get all attempts based on role
    let attempts;
    if (isAdmin) {
      if (args.userId) {
        attempts = await ctx.db
          .query("loginAttempts")
          .withIndex("userId", (q) => q.eq("userId", args.userId))
          .order("desc")
          .collect();
      } else {
        attempts = await ctx.db
          .query("loginAttempts")
          .withIndex("timestamp")
          .order("desc")
          .collect();
      }
    } else {
      // Regular users only see their own
      attempts = await ctx.db
        .query("loginAttempts")
        .withIndex("userId", (q) => q.eq("userId", currentUserId))
        .order("desc")
        .collect();
    }

    // Apply filters
    let filteredAttempts = attempts;

    // Status filter
    if (args.status && args.status !== "all") {
      filteredAttempts = filteredAttempts.filter(a => a.status === args.status);
    }

    // Date range filter
    if (args.startDate) {
      filteredAttempts = filteredAttempts.filter(a => a.timestamp >= args.startDate!);
    }
    if (args.endDate) {
      filteredAttempts = filteredAttempts.filter(a => a.timestamp <= args.endDate!);
    }

    // IP address filter
    if (args.ipAddress) {
      filteredAttempts = filteredAttempts.filter(a => 
        a.ipAddress.toLowerCase().includes(args.ipAddress!.toLowerCase())
      );
    }

    // Location filter
    if (args.location) {
      filteredAttempts = filteredAttempts.filter(a => {
        if (!a.geoLocation) return false;
        try {
          const geo = JSON.parse(a.geoLocation);
          const locationStr = `${geo.city || ''} ${geo.region || ''} ${geo.country || ''}`.toLowerCase();
          return locationStr.includes(args.location!.toLowerCase());
        } catch {
          return false;
        }
      });
    }

    // Pinned filter
    if (args.showPinnedOnly) {
      filteredAttempts = filteredAttempts.filter(a => a.isPinned === true);
    }

    // Search term filter (searches email/username and user name)
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase().trim();
      const enrichedForSearch = await Promise.all(
        filteredAttempts.map(async (attempt) => {
          let userName = "";
          if (attempt.userId) {
            const user = await ctx.db.get(attempt.userId);
            userName = user?.name || "";
          }
          return {
            attempt,
            searchableText: `${attempt.identifier} ${userName}`.toLowerCase(),
          };
        })
      );
      filteredAttempts = enrichedForSearch
        .filter(item => item.searchableText.includes(searchLower))
        .map(item => item.attempt);
    }

    // Calculate pagination
    const totalCount = filteredAttempts.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAttempts = filteredAttempts.slice(startIndex, endIndex);

    // Enrich with user information
    const enrichedAttempts = await Promise.all(
      paginatedAttempts.map(async (attempt) => {
        let userName = "Unknown User";
        let userEmail = attempt.identifier;

        if (attempt.userId) {
          const user = await ctx.db.get(attempt.userId);
          if (user) {
            userName = user.name || "Unknown User";
            userEmail = user.email || attempt.identifier;
          }
        }

        // Parse JSON fields
        let geoData = null;
        let deviceData = null;
        let browserData = null;

        try {
          if (attempt.geoLocation) geoData = JSON.parse(attempt.geoLocation);
          if (attempt.deviceInfo) deviceData = JSON.parse(attempt.deviceInfo);
          if (attempt.browserInfo) browserData = JSON.parse(attempt.browserInfo);
        } catch (e) {
          // Ignore parse errors
        }

        return {
          id: attempt._id,
          userId: attempt.userId,
          userName,
          userEmail,
          timestamp: attempt.timestamp,
          status: attempt.status,
          ipAddress: attempt.ipAddress,
          location: geoData 
            ? `${geoData.city || "Unknown"}, ${geoData.country || "Unknown"}`
            : "Unknown Location",
          device: deviceData
            ? `${deviceData.type || "Unknown"} ${deviceData.os ? `(${deviceData.os})` : ""}`
            : "Unknown Device",
          browser: browserData
            ? `${browserData.browser || "Unknown"} ${browserData.version || ""}`
            : "Unknown",
          riskScore: attempt.riskScore,
          flaggedForReview: attempt.flaggedForReview,
          failureReason: attempt.failureReason,
          isPinned: attempt.isPinned || false,
        };
      })
    );

    return {
      attempts: enrichedAttempts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
});

/**
 * Pin/Unpin login attempt (admin only)
 */
export const togglePinLoginAttempt = mutation({
  args: {
    attemptId: v.id("loginAttempts"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) {
      throw new Error("Login attempt not found");
    }

    await ctx.db.patch(args.attemptId, {
      isPinned: !attempt.isPinned,
    });

    return { success: true, isPinned: !attempt.isPinned };
  },
});

/**
 * Block IP address (admin only)
 */
export const blockIPAddress = mutation({
  args: {
    ipAddress: v.string(),
    reason: v.string(),
    notes: v.optional(v.string()),
    attemptId: v.optional(v.id("loginAttempts")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    // Check if IP is already blocked
    const existing = await ctx.db
      .query("blockedIPs")
      .withIndex("ipAddress", (q) => q.eq("ipAddress", args.ipAddress))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existing) {
      throw new Error("IP address is already blocked");
    }

    const now = Date.now();
    await ctx.db.insert("blockedIPs", {
      ipAddress: args.ipAddress,
      reason: args.reason,
      notes: args.notes,
      blockedBy: currentUserId,
      blockedAt: now,
      isActive: true,
      attemptId: args.attemptId,
    });

    // Create security alert
    await ctx.db.insert("securityAlerts", {
      type: "brute_force_attempt",
      severity: "high",
      title: "IP Address Blocked",
      description: `IP address ${args.ipAddress} has been blocked. Reason: ${args.reason}`,
      metadata: JSON.stringify({ ipAddress: args.ipAddress, blockedBy: currentUserId }),
      status: "open",
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Block email (admin only)
 */
export const blockEmail = mutation({
  args: {
    email: v.string(),
    reason: v.string(),
    notes: v.optional(v.string()),
    attemptId: v.optional(v.id("loginAttempts")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    // Check if email is already blocked
    const existing = await ctx.db
      .query("blockedEmails")
      .withIndex("email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existing) {
      throw new Error("Email is already blocked");
    }

    const now = Date.now();
    await ctx.db.insert("blockedEmails", {
      email: args.email,
      reason: args.reason,
      notes: args.notes,
      blockedBy: currentUserId,
      blockedAt: now,
      isActive: true,
      attemptId: args.attemptId,
    });

    // Create security alert
    await ctx.db.insert("securityAlerts", {
      type: "brute_force_attempt",
      severity: "high",
      title: "Email Address Blocked",
      description: `Email address ${args.email} has been blocked. Reason: ${args.reason}`,
      metadata: JSON.stringify({ email: args.email, blockedBy: currentUserId }),
      status: "open",
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Get login statistics for dashboard
 */
export const getLoginStatistics = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const now = Date.now();
    let startTime: number;

    switch (args.timeRange) {
      case "today":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    // Get all attempts in time range
    const allAttempts = await ctx.db
      .query("loginAttempts")
      .withIndex("timestamp")
      .order("desc")
      .collect();

    const attemptsInRange = allAttempts.filter(a => a.timestamp >= startTime);

    const stats = {
      total: attemptsInRange.length,
      successful: attemptsInRange.filter(a => a.status === "success").length,
      failed: attemptsInRange.filter(a => a.status === "failed").length,
      suspicious: attemptsInRange.filter(a => a.status === "suspicious").length,
      blocked: attemptsInRange.filter(a => a.status === "blocked").length,
      flaggedForReview: attemptsInRange.filter(a => a.flaggedForReview).length,
      uniqueUsers: new Set(attemptsInRange.filter(a => a.userId).map(a => a.userId)).size,
      uniqueIPs: new Set(attemptsInRange.map(a => a.ipAddress)).size,
    };

    return stats;
  },
});

/**
 * Get security alerts
 */
export const getSecurityAlerts = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("investigating"),
        v.literal("resolved"),
        v.literal("dismissed")
      )
    ),
    severity: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const limit = args.limit || 50;
    let alerts;

    if (args.status && args.severity) {
      alerts = await ctx.db
        .query("securityAlerts")
        .withIndex("severityAndStatus", (q) => 
          q.eq("severity", args.severity!).eq("status", args.status!)
        )
        .order("desc")
        .take(limit);
    } else if (args.status) {
      alerts = await ctx.db
        .query("securityAlerts")
        .withIndex("status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else if (args.severity) {
      alerts = await ctx.db
        .query("securityAlerts")
        .withIndex("severity", (q) => q.eq("severity", args.severity!))
        .order("desc")
        .take(limit);
    } else {
      alerts = await ctx.db
        .query("securityAlerts")
        .withIndex("createdAt")
        .order("desc")
        .take(limit);
    }

    // Enrich with user information
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        let affectedUser = null;
        if (alert.userId) {
          const user = await ctx.db.get(alert.userId);
          if (user) {
            affectedUser = {
              name: user.name,
              email: user.email,
            };
          }
        }

        let assignedUser = null;
        if (alert.assignedTo) {
          const user = await ctx.db.get(alert.assignedTo);
          if (user) {
            assignedUser = {
              name: user.name,
              email: user.email,
            };
          }
        }

        return {
          ...alert,
          affectedUser,
          assignedUser,
        };
      })
    );

    return enrichedAlerts;
  },
});

/**
 * Update security alert status
 */
export const updateSecurityAlert = mutation({
  args: {
    alertId: v.id("securityAlerts"),
    status: v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    resolutionNotes: v.optional(v.string()),
    assignTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    const now = Date.now();
    const updateData: any = {
      status: args.status,
    };

    if (args.resolutionNotes) {
      updateData.resolutionNotes = args.resolutionNotes;
    }

    if (args.assignTo) {
      updateData.assignedTo = args.assignTo;
    }

    if (args.status === "resolved" || args.status === "dismissed") {
      updateData.resolvedAt = now;
      updateData.resolvedBy = currentUserId;
    }

    await ctx.db.patch(args.alertId, updateData);

    return { success: true };
  },
});

/**
 * Review a flagged login attempt
 */
export const reviewLoginAttempt = mutation({
  args: {
    attemptId: v.id("loginAttempts"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
      throw new Error("Not authorized - administrator access required");
    }

    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) {
      throw new Error("Login attempt not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.attemptId, {
      reviewedBy: currentUserId,
      reviewedAt: now,
      reviewNotes: args.notes,
      flaggedForReview: false,
    });

    return { success: true };
  },
});