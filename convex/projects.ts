// convex/projects.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get all projects for a specific budget item (by budgetItemId)
 */
export const getProjectsByBudgetItem = query({
  args: {
    budgetItemId: v.id("budgetItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("budgetItemId", (q) => q.eq("budgetItemId", args.budgetItemId))
      .order("desc")
      .collect();

    // Enrich with department information
    const projectsWithDepartments = await Promise.all(
      projects.map(async (project) => {
        const department = await ctx.db.get(project.departmentId);
        return {
          ...project,
          departmentName: department?.name,
          departmentCode: department?.code,
        };
      })
    );

    return projectsWithDepartments;
  },
});

/**
 * Get all projects (optionally filtered by department)
 */
export const list = query({
  args: {
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    let projects;
    
    if (args.departmentId !== undefined) {
      projects = await ctx.db
        .query("projects")
        .withIndex("departmentId", (q) => 
          q.eq("departmentId", args.departmentId!)
        )
        .order("desc")
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .order("desc")
        .collect();
    }

    // Enrich with department information
    const projectsWithDepartments = await Promise.all(
      projects.map(async (project) => {
        const department = await ctx.db.get(project.departmentId);
        return {
          ...project,
          departmentName: department?.name,
          departmentCode: department?.code,
        };
      })
    );

    return projectsWithDepartments;
  },
});

/**
 * Get a single project by ID
 */
export const get = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.id);
    
    if (!project) {
      return null;
    }
    
    // Enrich with department information
    const department = await ctx.db.get(project.departmentId);
    
    return {
      ...project,
      departmentName: department?.name,
      departmentCode: department?.code,
    };
  },
});

/**
 * Create a new project
 */
export const create = mutation({
  args: {
    projectName: v.string(),
    departmentId: v.id("departments"),
    allocatedBudget: v.number(),
    revisedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
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
    projectManagerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify department exists
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    const now = Date.now();
    
    // Calculate utilization rate and balance
    const effectiveBudget = args.revisedBudget ?? args.allocatedBudget;
    const utilizationRate = effectiveBudget > 0 
      ? (args.totalBudgetUtilized / effectiveBudget) * 100 
      : 0;
    const balance = effectiveBudget - args.totalBudgetUtilized;

    const projectId = await ctx.db.insert("projects", {
      projectName: args.projectName,
      departmentId: args.departmentId,
      allocatedBudget: args.allocatedBudget,
      revisedBudget: args.revisedBudget,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate,
      balance,
      dateStarted: args.dateStarted,
      completionDate: args.completionDate,
      expectedCompletionDate: args.expectedCompletionDate,
      projectAccomplishment: args.projectAccomplishment,
      status: args.status ?? "on_track",
      remarks: args.remarks,
      budgetItemId: args.budgetItemId,
      projectManagerId: args.projectManagerId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

/**
 * Update an existing project
 */
export const update = mutation({
  args: {
    id: v.id("projects"),
    projectName: v.string(),
    departmentId: v.id("departments"),
    allocatedBudget: v.number(),
    revisedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
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
    projectManagerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existingProject = await ctx.db.get(args.id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Verify department exists
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    const now = Date.now();
    
    // Calculate utilization rate and balance
    const effectiveBudget = args.revisedBudget ?? args.allocatedBudget;
    const utilizationRate = effectiveBudget > 0 
      ? (args.totalBudgetUtilized / effectiveBudget) * 100 
      : 0;
    const balance = effectiveBudget - args.totalBudgetUtilized;

    await ctx.db.patch(args.id, {
      projectName: args.projectName,
      departmentId: args.departmentId,
      allocatedBudget: args.allocatedBudget,
      revisedBudget: args.revisedBudget,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate,
      balance,
      dateStarted: args.dateStarted,
      completionDate: args.completionDate,
      expectedCompletionDate: args.expectedCompletionDate,
      projectAccomplishment: args.projectAccomplishment,
      status: args.status ?? "on_track",
      remarks: args.remarks,
      budgetItemId: args.budgetItemId,
      projectManagerId: args.projectManagerId,
      updatedBy: userId,
      updatedAt: now,
    });

    return args.id;
  },
});

/**
 * Delete a project
 */
export const remove = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existingProject = await ctx.db.get(args.id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Get projects by status
 */
export const getProjectsByStatus = query({
  args: {
    status: v.union(
      v.literal("on_track"),
      v.literal("delayed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("on_hold")
    ),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    let projects;

    if (args.departmentId !== undefined) {
      projects = await ctx.db
        .query("projects")
        .withIndex("statusAndDepartment", (q) => 
          q.eq("status", args.status).eq("departmentId", args.departmentId!)
        )
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("status", (q) => q.eq("status", args.status))
        .collect();
    }

    return projects;
  },
});

/**
 * Get project statistics
 */
export const getStatistics = query({
  args: {
    budgetItemId: v.optional(v.id("budgetItems")),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    let projects;
    
    if (args.budgetItemId !== undefined) {
      projects = await ctx.db
        .query("projects")
        .withIndex("budgetItemId", (q) => q.eq("budgetItemId", args.budgetItemId!))
        .collect();
    } else if (args.departmentId !== undefined) {
      projects = await ctx.db
        .query("projects")
        .withIndex("departmentId", (q) => q.eq("departmentId", args.departmentId!))
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .collect();
    }

    const totalProjects = projects.length;
    const totalAllocatedBudget = projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
    const totalRevisedBudget = projects.reduce((sum, p) => sum + (p.revisedBudget ?? p.allocatedBudget), 0);
    const totalUtilized = projects.reduce((sum, p) => sum + p.totalBudgetUtilized, 0);
    const totalBalance = projects.reduce((sum, p) => sum + p.balance, 0);
    const avgUtilizationRate = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + p.utilizationRate, 0) / totalProjects 
      : 0;
    const avgAccomplishment = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + p.projectAccomplishment, 0) / totalProjects 
      : 0;

    const statusCounts = {
      on_track: projects.filter(p => p.status === "on_track").length,
      delayed: projects.filter(p => p.status === "delayed").length,
      completed: projects.filter(p => p.status === "completed").length,
      cancelled: projects.filter(p => p.status === "cancelled").length,
      on_hold: projects.filter(p => p.status === "on_hold").length,
    };

    return {
      totalProjects,
      totalAllocatedBudget,
      totalRevisedBudget,
      totalUtilized,
      totalBalance,
      avgUtilizationRate,
      avgAccomplishment,
      statusCounts,
    };
  },
});