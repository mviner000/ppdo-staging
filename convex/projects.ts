// convex/projects.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get all projects ordered by creation date (newest first)
 * Pinned items will appear first
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
        .withIndex("departmentId", (q) => q.eq("departmentId", args.departmentId!))
        .order("desc")
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("createdAt")
        .order("desc")
        .collect();
    }

    // Sort: pinned items first (by pinnedAt desc), then unpinned items
    const sortedProjects = projects.sort((a, b) => {
      // Both pinned - sort by pinnedAt (most recent first)
      if (a.isPinned && b.isPinned) {
        return (b.pinnedAt || 0) - (a.pinnedAt || 0);
      }
      // Only a is pinned
      if (a.isPinned) return -1;
      // Only b is pinned
      if (b.isPinned) return 1;
      // Neither pinned - sort by creation time
      return b._creationTime - a._creationTime;
    });

    // Enrich with department information
    const projectsWithDepartments = await Promise.all(
      sortedProjects.map(async (project) => {
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
 * Get project by name
 */
export const getByProjectName = query({
  args: {
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db
      .query("projects")
      .withIndex("projectName", (q) => q.eq("projectName", args.projectName))
      .first();

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
    totalBudgetAllocated: v.number(),
    obligatedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    projectCompleted: v.number(),
    projectDelayed: v.number(),
    projectsOnTrack: v.number(),
    notes: v.optional(v.string()),
    year: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("done"),
        v.literal("pending"),
        v.literal("ongoing")
      )
    ),
    targetDateCompletion: v.optional(v.number()),
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

    // Check if project name already exists
    const existing = await ctx.db
      .query("projects")
      .withIndex("projectName", (q) => q.eq("projectName", args.projectName))
      .first();

    if (existing) {
      throw new Error("Project with this name already exists");
    }

    // Calculate utilization rate
    const utilizationRate =
      args.totalBudgetAllocated > 0
        ? (args.totalBudgetUtilized / args.totalBudgetAllocated) * 100
        : 0;

    const now = Date.now();

    const projectData: any = {
      projectName: args.projectName,
      departmentId: args.departmentId,
      totalBudgetAllocated: args.totalBudgetAllocated,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate: utilizationRate,
      projectCompleted: args.projectCompleted,
      projectDelayed: args.projectDelayed,
      projectsOnTrack: args.projectsOnTrack,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      updatedBy: userId,
      isPinned: false,
    };

    // Only add optional fields if they have values
    if (args.obligatedBudget !== undefined) projectData.obligatedBudget = args.obligatedBudget;
    if (args.notes !== undefined) projectData.notes = args.notes;
    if (args.year !== undefined) projectData.year = args.year;
    if (args.status !== undefined) projectData.status = args.status;
    if (args.targetDateCompletion !== undefined) projectData.targetDateCompletion = args.targetDateCompletion;
    if (args.projectManagerId !== undefined) projectData.projectManagerId = args.projectManagerId;

    const projectId = await ctx.db.insert("projects", projectData);

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
    totalBudgetAllocated: v.number(),
    obligatedBudget: v.optional(v.number()),
    totalBudgetUtilized: v.number(),
    projectCompleted: v.number(),
    projectDelayed: v.number(),
    projectsOnTrack: v.number(),
    notes: v.optional(v.string()),
    year: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("done"),
        v.literal("pending"),
        v.literal("ongoing")
      )
    ),
    targetDateCompletion: v.optional(v.number()),
    projectManagerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    // Verify department exists
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    // Check if project name is being changed and if it conflicts
    if (args.projectName !== existing.projectName) {
      const conflictingProject = await ctx.db
        .query("projects")
        .withIndex("projectName", (q) => q.eq("projectName", args.projectName))
        .first();
      
      if (conflictingProject && conflictingProject._id !== args.id) {
        throw new Error("Project with this name already exists");
      }
    }

    // Calculate utilization rate
    const utilizationRate =
      args.totalBudgetAllocated > 0
        ? (args.totalBudgetUtilized / args.totalBudgetAllocated) * 100
        : 0;

    const now = Date.now();

    const updateData: any = {
      projectName: args.projectName,
      departmentId: args.departmentId,
      totalBudgetAllocated: args.totalBudgetAllocated,
      totalBudgetUtilized: args.totalBudgetUtilized,
      utilizationRate: utilizationRate,
      projectCompleted: args.projectCompleted,
      projectDelayed: args.projectDelayed,
      projectsOnTrack: args.projectsOnTrack,
      updatedBy: userId,
      updatedAt: now,
    };

    // Only add optional fields if they have values
    if (args.obligatedBudget !== undefined) updateData.obligatedBudget = args.obligatedBudget;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.year !== undefined) updateData.year = args.year;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.targetDateCompletion !== undefined) updateData.targetDateCompletion = args.targetDateCompletion;
    if (args.projectManagerId !== undefined) updateData.projectManagerId = args.projectManagerId;

    await ctx.db.patch(args.id, updateData);

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

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Pin a project to the top of the list
 */
export const pin = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Get the user to check role
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has access (admin or super_admin)
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized: Only admins can pin items");
    }

    // Get the project
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Update the project
    await ctx.db.patch(args.id, {
      isPinned: true,
      pinnedAt: Date.now(),
      pinnedBy: userId,
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    return { success: true };
  },
});

/**
 * Unpin a project
 */
export const unpin = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Get the user to check role
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has access (admin or super_admin)
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized: Only admins can unpin items");
    }

    // Get the project
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Update the project
    await ctx.db.patch(args.id, {
      isPinned: false,
      pinnedAt: undefined,
      pinnedBy: undefined,
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    return { success: true };
  },
});

/**
 * Get projects by status
 */
export const getProjectsByStatus = query({
  args: {
    status: v.union(
      v.literal("done"),
      v.literal("pending"),
      v.literal("ongoing")
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
        .withIndex("departmentAndStatus", (q) => 
          q.eq("departmentId", args.departmentId!).eq("status", args.status)
        )
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("status", (q) => q.eq("status", args.status))
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
 * Get project statistics
 */
export const getStatistics = query({
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
        .withIndex("departmentId", (q) => q.eq("departmentId", args.departmentId!))
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .collect();
    }

    const totalProjects = projects.length;
    const totalAllocated = projects.reduce((sum, p) => sum + p.totalBudgetAllocated, 0);
    const totalObligated = projects.reduce((sum, p) => sum + (p.obligatedBudget || 0), 0);
    const totalUtilized = projects.reduce((sum, p) => sum + p.totalBudgetUtilized, 0);
    
    const averageUtilizationRate = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + p.utilizationRate, 0) / totalProjects 
      : 0;
    
    const totalCompleted = projects.reduce((sum, p) => sum + p.projectCompleted, 0);
    const totalDelayed = projects.reduce((sum, p) => sum + p.projectDelayed, 0);
    const totalOnTrack = projects.reduce((sum, p) => sum + p.projectsOnTrack, 0);
    
    const averageProjectCompleted = totalProjects > 0 
      ? totalCompleted / totalProjects 
      : 0;
    
    const averageProjectDelayed = totalProjects > 0 
      ? totalDelayed / totalProjects 
      : 0;
    
    const averageProjectsOnTrack = totalProjects > 0 
      ? totalOnTrack / totalProjects 
      : 0;

    const statusCounts = {
      done: projects.filter(p => p.status === "done").length,
      pending: projects.filter(p => p.status === "pending").length,
      ongoing: projects.filter(p => p.status === "ongoing").length,
    };

    return {
      totalProjects,
      totalAllocated,
      totalObligated,
      totalUtilized,
      averageUtilizationRate,
      totalCompleted,
      totalDelayed,
      totalOnTrack,
      averageProjectCompleted,
      averageProjectDelayed,
      averageProjectsOnTrack,
      statusCounts,
    };
  },
});