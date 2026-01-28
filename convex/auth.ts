// convex/auth.ts
// CORE AUTHENTICATION SETUP

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

    if (!user) {
      return null;
    }

    // Ensure backward compatibility: generate name if missing
    if (!user.name && user.firstName) {
      return {
        ...user,
        name: formatFullName(user.firstName, user.middleName, user.lastName, user.nameExtension),
      };
    }

    return user;
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
    location: v.optional(v.string()),
    geoLocation: v.optional(v.string()),
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
      await ctx.db.patch(existingDevice._id, {
        lastSeen: now,
        lastIpAddress: args.ipAddress,
        loginCount: existingDevice.loginCount + 1,
        isActive: true,
      });
    } else {
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
    location: v.optional(v.string()),
    geoLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();
    const deviceInfo = parseUserAgent(args.userAgent);

    let geoLocation = null;
    if (args.geoLocation) {
      try {
        geoLocation = JSON.parse(args.geoLocation);
      } catch (e) {
        geoLocation = await parseIPAddress(args.ipAddress);
      }
    } else {
      geoLocation = await parseIPAddress(args.ipAddress);
    }

    // Calculate risk score
    let riskScore = 20;
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
        a => a.timestamp > now - 60 * 60 * 1000
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

/**
 * Complete the bug report onboarding step.
 */
export const completeBugReportOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const completedSteps = new Set(user.completedOnboardingSteps || []);
    completedSteps.add("bug_report_onboarding");

    await ctx.db.patch(userId, {
      completedOnboardingSteps: Array.from(completedSteps),
    });

    return { success: true };
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format full name from components
 */
function formatFullName(
  firstName: string,
  middleName?: string,
  lastName?: string,
  nameExtension?: string
): string {
  const parts: string[] = [firstName];

  if (middleName) parts.push(middleName);
  if (lastName) parts.push(lastName);
  if (nameExtension) parts.push(nameExtension);

  return parts.join(" ");
}

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