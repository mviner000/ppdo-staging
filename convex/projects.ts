// convex/projects.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { recalculateBudgetItemMetrics } from "./lib/budgetAggregation";
import { recalculateProjectMetrics } from "./lib/projectAggregation";
import { logProjectActivity } from "./lib/projectActivityLogger";
import { internal } from "./_generated/api";

/**
 * Get ACTIVE projects (Hidden Trash)
 * 🆕 ENHANCED: Added category and year filtering
 */
export const list = query({
  args: {
    budgetItemId: v.optional(v.id("budgetItems")),
    categoryId: v.optional(v.id("projectCategories")),
    year: v.optional(v.number()), // ✨ NEW: Year filter
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    let projects;

    // Apply filters with proper index usage
    if (args.budgetItemId) {
      projects = await ctx.db
        .query("projects")
        .withIndex("budgetItemId", (q) =>
          q.eq("budgetItemId", args.budgetItemId)
        )
        .filter((q) => q.neq(q.field("isDeleted"), true))
        .order("desc")
        .collect();
    } else if (args.categoryId) {
      projects = await ctx.db
        .query("projects")
        .withIndex("categoryId", (q) =>
          q.eq("categoryId", args.categoryId)
        )
        .filter((q) => q.neq(q.field("isDeleted"), true))
        .order("desc")
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .filter((q) => q.neq(q.field("isDeleted"), true))
        .order("desc")
        .collect();
    }

    // ✨ Filter by year if provided (client-side filter since no year index exists)
    if (args.year !== undefined) {
      projects = projects.filter((project) => project.year === args.year);
    }

    return projects;
  },
});

/**
 * Get TRASHED projects only
 */
export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("projects")
      .withIndex("isDeleted", (q) => q.eq("isDeleted", true))
      .order("desc")
      .collect();
  },
});

/**
 * Soft Delete: Move Project to Trash
 * Cascades to children (Breakdowns) and updates parent Budget Item.
 * 🆕 ENHANCED: Updates category usage count
 */
export const moveToTrash = mutation({
  args: {
    id: v.id("projects"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Project not found");

    // 1. Trash Project
    await ctx.db.patch(args.id, {
      isDeleted: true,
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
      updatedBy: userId
    });

    // 2. Trash Linked Breakdowns (Cascade)
    const breakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .withIndex("projectId", (q) => q.eq("projectId", args.id))
      .collect();

    for (const breakdown of breakdowns) {
      await ctx.db.patch(breakdown._id, {
        isDeleted: true,
        deletedAt: now,
        deletedBy: userId
      });
    }

    // Update usage count for the project particular
    await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
      code: existing.particulars,
      delta: -1,
    });

    // Update usage count for implementing agency
    await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
      code: existing.implementingOffice,
      usageContext: "project",
      delta: -1,
    });

    // 🆕 Update category usage count
    if (existing.categoryId) {
      await ctx.runMutation(internal.projectCategories.updateUsageCount, {
        categoryId: existing.categoryId,
        delta: -1,
      });
    }

    // 3. Recalculate Parent Budget to remove this project from totals
    if (existing.budgetItemId) {
      await recalculateBudgetItemMetrics(ctx, existing.budgetItemId, userId);
    }

    // Log Activity
    await logProjectActivity(ctx, userId, {
      action: "updated",
      projectId: args.id,
      previousValues: existing,
      newValues: { ...existing, isDeleted: true },
      reason: args.reason || "Moved to trash"
    });

    return { success: true, message: "Project moved to trash" };
  },
});

/**
 * Restore Project from Trash
 * Cascades restore to children and recalculates Parent Budget.
 * 🆕 ENHANCED: Updates category usage count
 */
export const restoreFromTrash = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Project not found");

    // 1. Restore Project
    await ctx.db.patch(args.id, {
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: Date.now()
    });

    // 2. Restore Breakdowns
    const breakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .withIndex("projectId", (q) => q.eq("projectId", args.id))
      .collect();

    for (const breakdown of breakdowns) {
      // Only restore breakdowns that were deleted at roughly the same time (cascade restore)
      // Or simply restore all attached breakdowns marked as deleted
      if (breakdown.isDeleted) {
        await ctx.db.patch(breakdown._id, {
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined
        });
      }
    }

    // Update usage count for the project particular
    await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
      code: existing.particulars,
      delta: 1,
    });

    // Update usage count for implementing agency
    await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
      code: existing.implementingOffice,
      usageContext: "project",
      delta: 1,
    });

    // 🆕 Update category usage count
    if (existing.categoryId) {
      await ctx.runMutation(internal.projectCategories.updateUsageCount, {
        categoryId: existing.categoryId,
        delta: 1,
      });
    }

    // 3. Recalculate Parent Budget to add this project back to totals
    // Only recalculate if the parent budget item is also restored (not in trash)
    if (existing.budgetItemId) {
      const budgetItem = await ctx.db.get(existing.budgetItemId);
      // Only recalculate if budget item exists and is not deleted
      if (budgetItem && !budgetItem.isDeleted) {
        await recalculateBudgetItemMetrics(ctx, existing.budgetItemId, userId);
      }
    }

    // Also recalculate the project itself to ensure its totals from restored breakdowns are correct
    await recalculateProjectMetrics(ctx, args.id, userId);

    return { success: true, message: "Project restored" };
  },
});

/**
 * Get a single project by ID (with ownership check)
 */
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.id);
    if (!project || project.isDeleted) throw new Error("Project not found");
    return project;
  },
});

/**
 * Get a project by ID for validation purposes (no complex checks)
 * Used by breakdown forms to validate against parent project budget
 */
export const getForValidation = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.id);
    if (!project || project.isDeleted) {
      throw new Error("Project not found");
    }

    // Return fields needed for validation
    return {
      _id: project._id,
      particulars: project.particulars,
      implementingOffice: project.implementingOffice,
      totalBudgetAllocated: project.totalBudgetAllocated,
      totalBudgetUtilized: project.totalBudgetUtilized,
      budgetItemId: project.budgetItemId,
      categoryId: project.categoryId,
      status: project.status,
      autoCalculateBudgetUtilized: project.autoCalculateBudgetUtilized,
    };
  },
});

/**
 * Create a new project
 * 🆕 ENHANCED: Supports autoCalculateBudgetUtilized flag
 * ✅ RETURNS STANDARDIZED ApiResponse
 */
export const create = mutation({
  args: {
    particulars: v.string(),
    budgetItemId: v.optional(v.id("budgetItems")),
    categoryId: v.optional(v.id("projectCategories")),
    implementingOffice: v.string(),
    totalBudgetAllocated: v.number(),
    obligatedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    remarks: v.optional(v.string()),
    year: v.optional(v.number()),
    targetDateCompletion: v.optional(v.number()),
    projectManagerId: v.optional(v.id("users")),
    autoCalculateBudgetUtilized: v.optional(v.boolean()), // 🆕 NEW FLAG
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (userId === null) {
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          },
        };
      }

      // Validate project particular exists and is active
      const particular = await ctx.db
        .query("projectParticulars")
        .withIndex("code", (q) => q.eq("code", args.particulars))
        .first();

      if (!particular) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Project particular "${args.particulars}" does not exist. Please add it in Project Particulars management first.`,
          },
        };
      }

      if (!particular.isActive) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Project particular "${args.particulars}" is inactive and cannot be used. Please activate it first.`,
          },
        };
      }

      // Validate implementing agency exists and is active
      const agency = await ctx.db
        .query("implementingAgencies")
        .withIndex("code", (q) => q.eq("code", args.implementingOffice))
        .first();

      if (!agency) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Implementing agency "${args.implementingOffice}" does not exist. Please add it in Implementing Agencies management first.`,
          },
        };
      }

      if (!agency.isActive) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Implementing agency "${args.implementingOffice}" is inactive and cannot be used. Please activate it first.`,
          },
        };
      }

      // 🆕 Validate category if provided
      if (args.categoryId) {
        const category = await ctx.db.get(args.categoryId);
        if (!category) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Project category not found",
            },
          };
        }
        if (!category.isActive) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Project category is inactive and cannot be used",
            },
          };
        }
      }

      if (args.budgetItemId) {
        const budgetItem = await ctx.db.get(args.budgetItemId);
        if (!budgetItem) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Budget item not found",
            },
          };
        }
      }

      const now = Date.now();
      // Initial utilization rate calculation
      const utilizationRate = args.totalBudgetAllocated > 0
        ? (args.totalBudgetUtilized / args.totalBudgetAllocated) * 100
        : 0;

      // Auto-link department ID if this agency represents a department
      const departmentId = agency.departmentId;

      const projectId = await ctx.db.insert("projects", {
        particulars: args.particulars,
        budgetItemId: args.budgetItemId,
        categoryId: args.categoryId,
        implementingOffice: args.implementingOffice,
        departmentId: departmentId,
        totalBudgetAllocated: args.totalBudgetAllocated,
        obligatedBudget: args.obligatedBudget,
        totalBudgetUtilized: args.totalBudgetUtilized,
        utilizationRate,
        projectCompleted: 0,
        projectDelayed: 0,
        projectsOnTrack: 0,
        status: "ongoing",
        remarks: args.remarks,
        year: args.year,
        targetDateCompletion: args.targetDateCompletion,
        projectManagerId: args.projectManagerId,
        autoCalculateBudgetUtilized: args.autoCalculateBudgetUtilized !== undefined 
          ? args.autoCalculateBudgetUtilized 
          : true, // 🆕 Default to TRUE for new projects
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      });

      // Update usage count for the project particular
      await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
        code: args.particulars,
        delta: 1,
      });

      // Update usage count for implementing agency
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: args.implementingOffice,
        usageContext: "project",
        delta: 1,
      });

      // 🆕 Update category usage count
      if (args.categoryId) {
        await ctx.runMutation(internal.projectCategories.updateUsageCount, {
          categoryId: args.categoryId,
          delta: 1,
        });
      }

      const newProject = await ctx.db.get(projectId);
      await logProjectActivity(ctx, userId, {
        action: "created",
        projectId: projectId,
        newValues: newProject,
        reason: "New project creation"
      });

      // ✅ RECALCULATE PARENT BUDGET ITEM
      if (args.budgetItemId) {
        await recalculateBudgetItemMetrics(ctx, args.budgetItemId, userId);
      }

      // ✅ RETURN STANDARDIZED SUCCESS RESPONSE
      return {
        success: true,
        data: {
          projectId: projectId,
          project: newProject
        },
        message: "Project created successfully",
      };

    } catch (error) {
      // ✅ CATCH ANY UNEXPECTED ERRORS
      console.error("Error creating project:", error);
      return {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: error instanceof Error ? error.message : "An unexpected error occurred while creating the project",
        },
      };
    }
  },
});

/**
 * Update an existing project
 * 🆕 ENHANCED: Supports autoCalculateBudgetUtilized flag
 */
export const update = mutation({
  args: {
    id: v.id("projects"),
    particulars: v.string(),
    budgetItemId: v.optional(v.id("budgetItems")),
    categoryId: v.optional(v.id("projectCategories")),
    implementingOffice: v.string(),
    totalBudgetAllocated: v.number(),
    obligatedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    remarks: v.optional(v.string()),
    year: v.optional(v.number()),
    targetDateCompletion: v.optional(v.number()),
    projectManagerId: v.optional(v.id("users")),
    autoCalculateBudgetUtilized: v.optional(v.boolean()), // 🆕 NEW FLAG
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Project not found");

    // If particular is changing, validate new particular
    if (args.particulars !== existing.particulars) {
      const particular = await ctx.db
        .query("projectParticulars")
        .withIndex("code", (q) => q.eq("code", args.particulars))
        .first();

      if (!particular) {
        throw new Error(
          `Project particular "${args.particulars}" does not exist. Please add it in Project Particulars management first.`
        );
      }

      if (!particular.isActive) {
        throw new Error(
          `Project particular "${args.particulars}" is inactive and cannot be used. Please activate it first.`
        );
      }

      // Update usage counts
      await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
        code: existing.particulars,
        delta: -1,
      });
      await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
        code: args.particulars,
        delta: 1,
      });
    }

    // If implementing office is changing, validate and update counts
    let departmentId = existing.departmentId;

    if (args.implementingOffice !== existing.implementingOffice) {
      const agency = await ctx.db
        .query("implementingAgencies")
        .withIndex("code", (q) => q.eq("code", args.implementingOffice))
        .first();

      if (!agency) {
        throw new Error(
          `Implementing agency "${args.implementingOffice}" does not exist. Please add it in Implementing Agencies management first.`
        );
      }

      if (!agency.isActive) {
        throw new Error(
          `Implementing agency "${args.implementingOffice}" is inactive and cannot be used. Please activate it first.`
        );
      }

      // Update departmentId based on new agency
      departmentId = agency.departmentId;

      // Update usage counts
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: existing.implementingOffice,
        usageContext: "project",
        delta: -1,
      });
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: args.implementingOffice,
        usageContext: "project",
        delta: 1,
      });
    }

    // 🆕 Handle category changes
    if (args.categoryId !== existing.categoryId) {
      // Validate new category if provided
      if (args.categoryId) {
        const category = await ctx.db.get(args.categoryId);
        if (!category) {
          throw new Error("Project category not found");
        }
        if (!category.isActive) {
          throw new Error("Project category is inactive and cannot be used");
        }
      }

      // Update usage counts
      if (existing.categoryId) {
        await ctx.runMutation(internal.projectCategories.updateUsageCount, {
          categoryId: existing.categoryId,
          delta: -1,
        });
      }
      if (args.categoryId) {
        await ctx.runMutation(internal.projectCategories.updateUsageCount, {
          categoryId: args.categoryId,
          delta: 1,
        });
      }
    }

    if (args.budgetItemId) {
      const budgetItem = await ctx.db.get(args.budgetItemId);
      if (!budgetItem) throw new Error("Budget item not found");
    }

    const now = Date.now();
    // Note: Project's own utilization rate calculation (based on manual inputs if no breakdowns exist yet)
    const utilizationRate = args.totalBudgetAllocated > 0
      ? (args.totalBudgetUtilized / args.totalBudgetAllocated) * 100
      : 0;

    const oldBudgetItemId = existing.budgetItemId;

    await ctx.db.patch(args.id, {
      particulars: args.particulars,
      budgetItemId: args.budgetItemId,
      categoryId: args.categoryId,
      implementingOffice: args.implementingOffice,
      departmentId: departmentId,
      totalBudgetAllocated: args.totalBudgetAllocated,
      obligatedBudget: args.obligatedBudget,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate,
      remarks: args.remarks,
      year: args.year,
      targetDateCompletion: args.targetDateCompletion,
      projectManagerId: args.projectManagerId,
      autoCalculateBudgetUtilized: args.autoCalculateBudgetUtilized, // 🆕 NEW FLAG
      updatedAt: now,
      updatedBy: userId,
    });

    const updatedProject = await ctx.db.get(args.id);

    // Log Activity
    await logProjectActivity(ctx, userId, {
      action: "updated",
      projectId: args.id,
      previousValues: existing,
      newValues: updatedProject,
      reason: args.reason
    });

    // ✅ RECALCULATE PARENT BUDGET ITEMS
    // If moved to a different budget item, recalculate the old one
    if (oldBudgetItemId && oldBudgetItemId !== args.budgetItemId) {
      await recalculateBudgetItemMetrics(ctx, oldBudgetItemId, userId);
    }

    // Recalculate the new (or current) budget item
    if (args.budgetItemId) {
      await recalculateBudgetItemMetrics(ctx, args.budgetItemId, userId);
    } else if (oldBudgetItemId && args.budgetItemId === undefined) {
      await recalculateBudgetItemMetrics(ctx, oldBudgetItemId, userId);
    }

    // Also trigger project internal aggregation to ensure it's consistent with its own breakdowns
    await recalculateProjectMetrics(ctx, args.id, userId);

    return args.id;
  },
});

/**
 * 🆕 NEW MUTATION: Toggle Auto-Calculate Flag for Project
 * This allows switching between auto-calculation and manual mode
 */
export const toggleAutoCalculate = mutation({
  args: {
    id: v.id("projects"),
    autoCalculate: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Project not found");

    const now = Date.now();

    // Update the flag
    await ctx.db.patch(args.id, {
      autoCalculateBudgetUtilized: args.autoCalculate,
      updatedAt: now,
      updatedBy: userId,
    });

    // If switching TO auto-calculate, trigger recalculation
    if (args.autoCalculate) {
      await recalculateProjectMetrics(ctx, args.id, userId);
    }
    // If switching TO manual, just recalculate the utilization rate based on current values
    else {
      const utilizationRate = existing.totalBudgetAllocated > 0
        ? (existing.totalBudgetUtilized / existing.totalBudgetAllocated) * 100
        : 0;
      
      await ctx.db.patch(args.id, {
        utilizationRate,
        updatedAt: now,
        updatedBy: userId,
      });
    }

    const updatedProject = await ctx.db.get(args.id);

    // Log the change
    await logProjectActivity(ctx, userId, {
      action: "updated",
      projectId: args.id,
      previousValues: existing,
      newValues: updatedProject,
      reason: args.reason || `Switched to ${args.autoCalculate ? 'auto-calculate' : 'manual'} mode`,
    });

    // Update parent budget item if exists
    if (existing.budgetItemId) {
      await recalculateBudgetItemMetrics(ctx, existing.budgetItemId, userId);
    }

    return {
      success: true,
      mode: args.autoCalculate ? "auto" : "manual",
      message: args.autoCalculate 
        ? "Auto-calculation enabled. Budget utilized will be calculated from breakdowns."
        : "Manual mode enabled. Budget utilized can be entered manually.",
    };
  },
});

/**
 * 🆕 NEW MUTATION: Bulk Toggle Auto-Calculate
 * Toggle auto-calculate for multiple projects at once
 */
export const bulkToggleAutoCalculate = mutation({
  args: {
    ids: v.array(v.id("projects")),
    autoCalculate: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Unauthorized: Only admins can perform bulk actions.");
    }

    const now = Date.now();
    let successCount = 0;
    const affectedBudgetItems = new Set<string>();

    for (const id of args.ids) {
      const existing = await ctx.db.get(id);
      if (!existing || existing.isDeleted) continue;

      // Update the flag
      await ctx.db.patch(id, {
        autoCalculateBudgetUtilized: args.autoCalculate,
        updatedAt: now,
        updatedBy: userId,
      });

      // If switching TO auto-calculate, trigger recalculation
      if (args.autoCalculate) {
        await recalculateProjectMetrics(ctx, id, userId);
      }

      const updatedProject = await ctx.db.get(id);

      // Log the change
      await logProjectActivity(ctx, userId, {
        action: "updated",
        projectId: id,
        previousValues: existing,
        newValues: updatedProject,
        reason: args.reason || `Bulk switched to ${args.autoCalculate ? 'auto-calculate' : 'manual'} mode`,
      });

      // Track affected budget items
      if (existing.budgetItemId) {
        affectedBudgetItems.add(existing.budgetItemId);
      }

      successCount++;
    }

    // Recalculate all affected budget items
    for (const budgetItemId of affectedBudgetItems) {
      await recalculateBudgetItemMetrics(ctx, budgetItemId as any, userId);
    }

    return {
      success: true,
      count: successCount,
      mode: args.autoCalculate ? "auto" : "manual",
      message: `${successCount} project(s) switched to ${args.autoCalculate ? 'auto-calculate' : 'manual'} mode`,
    };
  },
});

/**
 * HARD DELETE: Permanent Removal
 * Cascades delete to breakdowns and updates parent budget.
 * 🆕 ENHANCED: Updates category usage count
 */
export const remove = mutation({
  args: {
    id: v.id("projects"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) throw new Error("User not found");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Project not found");

    const isSuperAdmin = currentUser.role === 'super_admin';
    const isCreator = existing.createdBy === userId;

    // Only Creator or Super Admin can hard delete
    if (!isCreator && !isSuperAdmin) throw new Error("Not authorized");

    const budgetItemId = existing.budgetItemId;
    const categoryId = existing.categoryId;

    // 1. Get Linked Breakdowns
    const breakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .withIndex("projectId", (q) => q.eq("projectId", args.id))
      .collect();

    // 2. Permanent Delete Children (Breakdowns)
    for (const breakdown of breakdowns) {
      await ctx.db.delete(breakdown._id);

      // Update agency usage for breakdown deletion
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: breakdown.implementingOffice,
        usageContext: "breakdown",
        delta: -1,
      });
    }

    // 3. Log Activity
    await logProjectActivity(ctx, userId, {
      action: "deleted",
      projectId: args.id,
      previousValues: existing,
      reason: args.reason || "Permanent Delete"
    });

    // 4. Permanent Delete Project
    await ctx.db.delete(args.id);

    // Update usage count for the project particular
    await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
      code: existing.particulars,
      delta: -1,
    });

    // Update usage count for implementing agency
    await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
      code: existing.implementingOffice,
      usageContext: "project",
      delta: -1,
    });

    // 🆕 Update category usage count
    if (categoryId) {
      await ctx.runMutation(internal.projectCategories.updateUsageCount, {
        categoryId: categoryId,
        delta: -1,
      });
    }

    // 5. Update Parent Budget Item
    if (budgetItemId) {
      await recalculateBudgetItemMetrics(ctx, budgetItemId, userId);
    }

    return { success: true };
  },
});

/**
 * Toggle pin status for a project
 */
export const togglePin = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Project not found");

    const now = Date.now();
    const newPinnedState = !existing.isPinned;

    await ctx.db.patch(args.id, {
      isPinned: newPinnedState,
      pinnedAt: newPinnedState ? now : undefined,
      pinnedBy: newPinnedState ? userId : undefined,
      updatedAt: now,
      updatedBy: userId,
    });

    return args.id;
  },
});

/**
 * BULK ACTION: Move multiple projects to trash
 */
export const bulkMoveToTrash = mutation({
  args: {
    ids: v.array(v.id("projects")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Unauthorized: Only admins can perform bulk actions.");
    }

    const now = Date.now();
    let successCount = 0;

    for (const id of args.ids) {
      const existing = await ctx.db.get(id);
      if (!existing || existing.isDeleted) continue;

      // 1. Trash Project
      await ctx.db.patch(id, {
        isDeleted: true,
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now,
        updatedBy: userId,
      });

      // 2. Trash Linked Breakdowns
      const breakdowns = await ctx.db
        .query("govtProjectBreakdowns")
        .withIndex("projectId", (q) => q.eq("projectId", id))
        .collect();

      for (const breakdown of breakdowns) {
        await ctx.db.patch(breakdown._id, {
          isDeleted: true,
          deletedAt: now,
          deletedBy: userId,
        });
      }

      // Update usage counts
      await ctx.runMutation(internal.projectParticulars.updateUsageCount, {
        code: existing.particulars,
        delta: -1,
      });
      await ctx.runMutation(internal.implementingAgencies.updateUsageCount, {
        code: existing.implementingOffice,
        usageContext: "project",
        delta: -1,
      });
      if (existing.categoryId) {
        await ctx.runMutation(internal.projectCategories.updateUsageCount, {
          categoryId: existing.categoryId,
          delta: -1,
        });
      }

      // Recalculate Parent Budget
      if (existing.budgetItemId) {
        await recalculateBudgetItemMetrics(ctx, existing.budgetItemId, userId);
      }

      // Log Activity
      await logProjectActivity(ctx, userId, {
        action: "deleted",
        projectId: id,
        previousValues: existing,
        reason: args.reason || "Bulk move to trash",
      });

      successCount++;
    }

    return { success: true, count: successCount };
  },
});

/**
 * BULK ACTION: Move multiple projects to a specific category
 */
export const bulkUpdateCategory = mutation({
  args: {
    ids: v.array(v.id("projects")),
    categoryId: v.id("projectCategories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Unauthorized: Only admins can perform bulk actions.");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    const now = Date.now();
    let successCount = 0;

    for (const id of args.ids) {
      const existing = await ctx.db.get(id);
      if (!existing) continue;

      // Skip if already in this category
      if (existing.categoryId === args.categoryId) continue;

      const previousValues = { ...existing };

      // Decrement old category count
      if (existing.categoryId) {
        await ctx.runMutation(internal.projectCategories.updateUsageCount, {
          categoryId: existing.categoryId,
          delta: -1,
        });
      }

      // Update project
      await ctx.db.patch(id, {
        categoryId: args.categoryId,
        updatedAt: now,
        updatedBy: userId,
      });

      // Increment new category count
      await ctx.runMutation(internal.projectCategories.updateUsageCount, {
        categoryId: args.categoryId,
        delta: 1,
      });

      // Log Activity
      await logProjectActivity(ctx, userId, {
        action: "updated",
        projectId: id,
        previousValues: previousValues,
        newValues: { ...existing, categoryId: args.categoryId },
        reason: "Bulk category update",
      });

      successCount++;
    }

    return { success: true, count: successCount };
  },
});