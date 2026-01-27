// convex/dashboard.ts
/**
 * Dashboard API - Optimized queries for the new dashboard feature
 *
 * This module provides efficient data fetching for the dashboard
 * to minimize resource consumption by:
 * - Aggregating data at query time instead of client-side
 * - Returning only necessary fields
 * - Caching and batching computations
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { FiscalYearStats } from "../types/dashboard";

/**
 * Get complete dashboard summary data
 *
 * Returns aggregated statistics for all fiscal years and analytics data
 * optimized for the landing page and year-specific summary views.
 *
 * This query consolidates multiple data sources into a single efficient request.
 */
export const getSummaryData = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch fiscal years
    let fiscalYears;
    if (args.includeInactive) {
      fiscalYears = await ctx.db
        .query("fiscalYears")
        .order("desc")
        .collect();
    } else {
      fiscalYears = await ctx.db
        .query("fiscalYears")
        .withIndex("isActive", (q) => q.eq("isActive", true))
        .order("desc")
        .collect();
    }

    // Fetch all projects and budget items at once (more efficient than per-year queries)
    const allProjects = await ctx.db.query("projects").collect();
    const allBudgetItems = await ctx.db.query("budgetItems").collect();
    const allDepartments = await ctx.db.query("departments").collect(); // 🆕 Fetch departments
    const allBreakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .collect();

    // Build year statistics in a single pass
    const yearStats: Record<string, FiscalYearStats> = {};
    const utilizationByYear: Record<string, Array<{ department: string; rate: number }>> = {};
    const budgetDistributionByYear: Record<
      string,
      Array<{
        label: string;
        value: number;
        subValue: string;
        percentage: number;
      }>
    > = {};
    const heatmapDataByYear: Record<string, Array<{ label: string; values: number[] }>> = {};

    // Initialize stats for all fiscal years
    for (const fy of fiscalYears) {
      const yearKey = fy.year.toString();

      // Get data for this year
      const yearProjects = allProjects.filter((p) => p.year === fy.year);
      const yearBudgets = allBudgetItems.filter((item) => item.year === fy.year);
      const yearBreakdowns = allBreakdowns.filter((bd) => {
        if (!bd.projectId) return false;
        const parentProject = allProjects.find(
          (p) => p._id === bd.projectId
        );
        return parentProject?.year === fy.year;
      });

      // Calculate KPI stats
      const projectCount = yearProjects.length;
      const ongoingCount = yearProjects.filter((p) => p.status === "ongoing").length;
      const completedCount = yearProjects.filter((p) => p.status === "completed").length;
      const delayedCount = yearProjects.filter((p) => p.status === "delayed").length;
      const breakdownCount = yearBreakdowns.length;

      // Calculate budget stats
      const totalBudgetAllocated = yearBudgets.reduce(
        (sum, item) => sum + (item.totalBudgetAllocated || 0),
        0
      );
      const totalBudgetUtilized = yearBudgets.reduce(
        (sum, item) => sum + (item.totalBudgetUtilized || 0),
        0
      );
      const utilizationRate =
        totalBudgetAllocated > 0
          ? (totalBudgetUtilized / totalBudgetAllocated) * 100
          : 0;

      yearStats[yearKey] = {
        projectCount,
        ongoingCount,
        completedCount,
        delayedCount,
        totalBudgetAllocated,
        totalBudgetUtilized,
        utilizationRate,
        breakdownCount,
      };

      // Calculate utilization by department (using departmentId)
      const grouped = yearBudgets.reduce(
        (acc, item) => {
          let label = "Unassigned";
          if (item.departmentId) {
            const dept = allDepartments.find(d => d._id === item.departmentId);
            // Use Code (e.g. "GAD") if available, else Name, else "Unknown"
            label = dept ? (dept.code || dept.name) : "Unknown Dept";
          } else if (item.particulars) {
            // Fallback for old data
            label = item.particulars;
          }

          if (!acc[label]) acc[label] = { allocated: 0, utilized: 0 };
          acc[label].allocated += item.totalBudgetAllocated || 0;
          acc[label].utilized += item.totalBudgetUtilized || 0;
          return acc;
        },
        {} as Record<string, { allocated: number; utilized: number }>
      );

      utilizationByYear[yearKey] = Object.entries(grouped)
        .map(([department, data]) => ({
          department,
          rate: data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 8);

      // Calculate budget distribution
      const categories = Array.from(
        new Set(yearBudgets.map((b) => b.particulars))
      ).slice(0, 6);

      budgetDistributionByYear[yearKey] = categories.map((cat) => {
        const items = yearBudgets.filter((b) => b.particulars === cat);
        const allocated = items.reduce(
          (sum, i) => sum + (i.totalBudgetAllocated || 0),
          0
        );
        const utilized = items.reduce(
          (sum, i) => sum + (i.totalBudgetUtilized || 0),
          0
        );

        // Format amount for subValue
        const formattedAmount = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          notation: "compact"
        }).format(allocated);

        return {
          label: cat || "Uncategorized",
          value: allocated,
          subValue: formattedAmount, // 🆕 Show amount instead of item count
          percentage: allocated > 0 ? (utilized / allocated) * 100 : 0,
        };
      });

      // Calculate heatmap data (activity by office)
      const offices = Array.from(
        new Set(yearProjects.map((p) => p.implementingOffice))
      ).slice(0, 8);

      heatmapDataByYear[yearKey] = offices.map((office) => {
        const officeProjects = yearProjects.filter(
          (p) => p.implementingOffice === office
        );
        const values = Array(12).fill(0);
        officeProjects.forEach((p) => {
          values[new Date(p.createdAt).getMonth()]++;
        });
        return { label: office, values };
      });
    }

    // 🆕 TIMELINE DATA (Archive.org style)
    // Aggregate project creation by Year -> Month
    const timelineData: Record<string, number[]> = {};
    for (const p of allProjects) {
      const date = new Date(p.createdAt);
      const y = date.getFullYear().toString();
      const m = date.getMonth(); // 0-11
      if (!timelineData[y]) timelineData[y] = Array(12).fill(0);
      timelineData[y][m]++;
    }

    // 🆕 TABBED PIE CHART DATA
    // 1. Sector Distribution (by Category)
    const allCategories = await ctx.db.query("projectCategories").collect();
    const sectorMap = new Map<string, number>();
    allProjects.forEach(p => {
      if (p.categoryId) {
        const cat = allCategories.find(c => c._id === p.categoryId);
        const name = cat ? cat.fullName : "Uncategorized";
        sectorMap.set(name, (sectorMap.get(name) || 0) + 1);
      } else {
        sectorMap.set("Uncategorized", (sectorMap.get("Uncategorized") || 0) + 1);
      }
    });

    // 2. Finance (Budget vs Utilization)
    const totalAlloc = allBudgetItems.reduce((acc, curr) => acc + curr.totalBudgetAllocated, 0);
    const totalUtil = allBudgetItems.reduce((acc, curr) => acc + curr.totalBudgetUtilized, 0);
    // Calculate remaining because pie chart usually shows parts of a whole
    const totalRemaining = Math.max(0, totalAlloc - totalUtil);

    // 2b. Budget Breakdown (Allocated = Utilized + Obligated-but-not-Utilized + Unobligated)
    const totalObligated = allBudgetItems.reduce((acc, curr) => acc + (curr.obligatedBudget || 0), 0);
    // "Obligated" slice = Obligated minus Utilized (committed but not yet spent)
    const obligatedNotUtilized = Math.max(0, totalObligated - totalUtil);
    // "Unobligated" slice = Allocated minus Obligated (still available)
    const unobligated = Math.max(0, totalAlloc - totalObligated);
    // Utilization Rate
    const overallUtilizationRate = totalAlloc > 0 ? (totalUtil / totalAlloc) * 100 : 0;

    // 3. Project Progress (Status)
    const statusMap = {
      ongoing: 0,
      completed: 0,
      delayed: 0
    };
    allProjects.forEach(p => {
      if (p.status === "ongoing" || p.status === "completed" || p.status === "delayed") {
        statusMap[p.status]++;
      }
    });

    // 4. Department Distribution (Implementing Office) - using top 5 + Others
    const deptMap = new Map<string, number>();
    allProjects.forEach(p => {
      const office = p.implementingOffice || "Unknown";
      deptMap.set(office, (deptMap.get(office) || 0) + 1);
    });

    return {
      fiscalYears: fiscalYears.map((fy) => ({
        _id: fy._id,
        year: fy.year,
        label: fy.label,
        description: fy.description,
        isActive: fy.isActive,
      })),
      yearStats,
      utilizationByYear,
      budgetDistributionByYear,
      heatmapDataByYear,
      // New Data
      timelineData,
      pieChartData: {
        sector: Array.from(sectorMap.entries()).map(([name, value]) => ({ name, value, color: "#15803D" })), // Placeholder color, UI will handle palette
        finance: [
          { name: "Utilized", value: totalUtil, color: "#15803D" },
          { name: "Remaining", value: totalRemaining, color: "#86EFAC" } // Lighter green
        ],
        status: [
          { name: "Completed", value: statusMap.completed, color: "#15803D" },
          { name: "Ongoing", value: statusMap.ongoing, color: "#22C55E" },
          { name: "Delayed", value: statusMap.delayed, color: "#EF4444" } // Red still makes sense for delayed? Or maybe a dark green/grey? Keeping red for updated alerts.
        ],
        department: Array.from(deptMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) // Top 5
          .map(([name, value]) => ({ name, value, color: "#15803D" })),
        // 🆕 Budget Pie Chart: Allocated breakdown
        budget: [
          { name: "Utilized", value: totalUtil, color: "#15803D" },       // Primary green (spent)
          { name: "Obligated", value: obligatedNotUtilized, color: "#4ADE80" }, // Medium green (committed)
          { name: "Unobligated", value: unobligated, color: "#BBF7D0" }  // Light green (available)
        ],
        // Utilization rate for display
        utilizationRate: overallUtilizationRate
      }
    };
  },
});

/**
 * Get dashboard data for a specific fiscal year
 *
 * More lightweight query if you only need one year's data
 */
export const getYearSummary = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch data for specific year
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();

    const budgetItems = await ctx.db
      .query("budgetItems")
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();

    const allBreakdowns = await ctx.db.query("govtProjectBreakdowns").collect();
    const yearBreakdowns = allBreakdowns.filter((bd) => {
      if (!bd.projectId) return false;
      const parentProject = projects.find((p) => p._id === bd.projectId);
      return !!parentProject;
    });

    // Calculate statistics
    const projectCount = projects.length;
    const ongoingCount = projects.filter((p) => p.status === "ongoing").length;
    const completedCount = projects.filter((p) => p.status === "completed").length;
    const delayedCount = projects.filter((p) => p.status === "delayed").length;
    const breakdownCount = yearBreakdowns.length;

    const totalBudgetAllocated = budgetItems.reduce(
      (sum, item) => sum + (item.totalBudgetAllocated || 0),
      0
    );
    const totalBudgetUtilized = budgetItems.reduce(
      (sum, item) => sum + (item.totalBudgetUtilized || 0),
      0
    );
    const utilizationRate =
      totalBudgetAllocated > 0
        ? (totalBudgetUtilized / totalBudgetAllocated) * 100
        : 0;

    // Build utilization data
    const grouped = budgetItems.reduce(
      (acc, item) => {
        const label = item.particulars || "Uncategorized";
        if (!acc[label]) acc[label] = { allocated: 0, utilized: 0 };
        acc[label].allocated += item.totalBudgetAllocated || 0;
        acc[label].utilized += item.totalBudgetUtilized || 0;
        return acc;
      },
      {} as Record<string, { allocated: number; utilized: number }>
    );

    const utilizationData = Object.entries(grouped)
      .map(([department, data]) => ({
        department,
        rate: data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);

    // Build budget distribution
    const categories = Array.from(
      new Set(budgetItems.map((b) => b.particulars))
    ).slice(0, 6);

    const budgetDistribution = categories.map((cat) => {
      const items = budgetItems.filter((b) => b.particulars === cat);
      const allocated = items.reduce((sum, i) => sum + (i.totalBudgetAllocated || 0), 0);
      const utilized = items.reduce((sum, i) => sum + (i.totalBudgetUtilized || 0), 0);

      return {
        label: cat || "Uncategorized",
        value: allocated,
        subValue: `${items.length} items`,
        percentage: allocated > 0 ? (utilized / allocated) * 100 : 0,
      };
    });

    // Build heatmap data
    const offices = Array.from(new Set(projects.map((p) => p.implementingOffice))).slice(
      0,
      8
    );

    const heatmapData = offices.map((office) => {
      const officeProjects = projects.filter((p) => p.implementingOffice === office);
      const values = Array(12).fill(0);
      officeProjects.forEach((p) => {
        values[new Date(p.createdAt).getMonth()]++;
      });
      return { label: office, values };
    });

    return {
      year: args.year,
      stats: {
        projectCount,
        ongoingCount,
        completedCount,
        delayedCount,
        breakdownCount,
        totalBudgetAllocated,
        totalBudgetUtilized,
        utilizationRate,
      },
      utilizationData,
      budgetDistribution,
      heatmapData,
    };
  },
});
