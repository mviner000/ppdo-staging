// app/dashboard/page.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import { DepartmentUtilizationHorizontalBar } from "../../components/dashboard/charts/DepartmentUtilizationHorizontalBar";
import { GovernmentTrendsAreaChart } from "../../components/dashboard/charts/GovernmentTrendsAreaChart";
import { ActivityHeatmap } from "../../components/dashboard/charts/ActivityHeatmap";
import { BudgetStatusProgressList } from "../../components/dashboard/charts/BudgetStatusProgressList";
import { ExecutiveFinancialPie } from "../../components/dashboard/charts/ExecutiveFinancialPie";
import { StatusDistributionPie } from "../../components/dashboard/charts/StatusDistributionPie";
import { LoginTrailDialog } from "@/components/LoginTrailDialog";
export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch real government data
  const projects = useQuery(api.projects.list, {});
  const budgetItems = useQuery(api.budgetItems.list, {});

  // 1. Government Trends (Allocated vs Utilized)
  const trendData = useMemo(() => {
    if (!budgetItems) return [];

    // Group by year or fiscalYear
    const yearly = budgetItems.reduce((acc, item) => {
      const year = (item.year || item.fiscalYear || new Date().getFullYear()).toString();
      if (!acc[year]) acc[year] = { allocated: 0, utilized: 0 };
      acc[year].allocated += item.totalBudgetAllocated;
      acc[year].utilized += item.totalBudgetUtilized;
      return acc;
    }, {} as Record<string, { allocated: number; utilized: number }>);

    return Object.entries(yearly)
      .map(([label, data]) => ({ label, allocated: data.allocated, utilized: data.utilized }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [budgetItems]);

  // 2. Financial Overview (Pie Data)
  const financialData = useMemo(() => {
    if (!budgetItems) return { allocated: 0, utilized: 0, obligated: 0 };
    return budgetItems.reduce((acc, item) => ({
      allocated: acc.allocated + item.totalBudgetAllocated,
      utilized: acc.utilized + item.totalBudgetUtilized,
      obligated: acc.obligated + (item.obligatedBudget || 0),
    }), { allocated: 0, utilized: 0, obligated: 0 });
  }, [budgetItems]);

  // 3. Project Status Distribution (Pie Data)
  const statusData = useMemo(() => {
    if (!projects) return [];
    const counts = projects.reduce((acc, p) => {
      const status = p.status || "not_started";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { status: "ongoing", count: counts["ongoing"] || 0 },
      { status: "completed", count: counts["completed"] || 0 },
      { status: "delayed", count: counts["delayed"] || 0 },
    ] as { status: "ongoing" | "completed" | "delayed" | "not_started"; count: number }[];
  }, [projects]);

  // 4. Department Utilization (Horizontal Bar)
  const utilizationData = useMemo(() => {
    if (!budgetItems) return [];
    const grouped = budgetItems.reduce((acc, item) => {
      const label = item.particulars;
      if (!acc[label]) acc[label] = { allocated: 0, utilized: 0 };
      acc[label].allocated += item.totalBudgetAllocated;
      acc[label].utilized += item.totalBudgetUtilized;
      return acc;
    }, {} as Record<string, { allocated: number; utilized: number }>);

    return Object.entries(grouped)
      .map(([department, data]) => ({
        department,
        rate: data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [budgetItems]);

  // 5. Project Activity (Heatmap)
  const heatmapData = useMemo(() => {
    if (!projects) return [];
    const offices = Array.from(new Set(projects.map(p => p.implementingOffice))).slice(0, 8);
    return offices.map(office => {
      const officeProjects = projects.filter(p => p.implementingOffice === office);
      const values = Array(12).fill(0);
      officeProjects.forEach(p => { values[new Date(p.createdAt).getMonth()]++; });
      return { label: office, values };
    });
  }, [projects]);

  // 6. Budget Status (Progress List)
  const budgetDistributionData = useMemo(() => {
    if (!budgetItems) return [];
    const categories = Array.from(new Set(budgetItems.map(b => b.particulars))).slice(0, 6);
    return categories.map(cat => {
      const items = budgetItems.filter(b => b.particulars === cat);
      const allocated = items.reduce((sum, i) => sum + i.totalBudgetAllocated, 0);
      const utilized = items.reduce((sum, i) => sum + i.totalBudgetUtilized, 0);
      return {
        label: cat,
        value: allocated,
        subValue: `${items.length} projects · ₱${new Intl.NumberFormat(undefined, { notation: "compact" }).format(allocated)}`,
        percentage: allocated > 0 ? (utilized / allocated) * 100 : 0
      };
    });
  }, [budgetItems]);

  if (!isMounted) return null;

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Government Performance Dashboard
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Real-time tracking of development and financial metrics
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <LoginTrailDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="group bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide mb-2">Total Projects</p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            {projects ? projects.length : 0}
          </p>
        </div>
        <div className="group bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide mb-2">Ongoing</p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-500">
            {projects?.filter(p => p.status === "ongoing").length || 0}
          </p>
        </div>
        <div className="group bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide mb-2">Completed</p>
          <p className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-500">
            {projects?.filter(p => p.status === "completed").length || 0}
          </p>
        </div>
        <div className="group bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-700 shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide mb-2">Delayed</p>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-500">
            {projects?.filter(p => p.status === "delayed").length || 0}
          </p>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="space-y-4 sm:space-y-6">
        {/* Row 1: High Level Trends & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Trend Chart - 2 columns on large screens */}
          <div className="lg:col-span-2">
            <GovernmentTrendsAreaChart
              title="Budget Allocation vs. Utilization"
              subtitle="Fiscal performance trends over years"
              data={trendData}
              isLoading={!budgetItems}
            />
          </div>
          {/* Financial Pie Chart - 1 column */}
          <div>
            <ExecutiveFinancialPie
              data={financialData}
              isLoading={!budgetItems}
            />
          </div>
        </div>

        {/* Row 2: Operational Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatusDistributionPie
            data={statusData}
            isLoading={!projects}
          />
          <DepartmentUtilizationHorizontalBar
            data={utilizationData}
            isLoading={!budgetItems}
          />
          <BudgetStatusProgressList
            title="Sector Distribution"
            subtitle="Budget allocation by sector"
            data={budgetDistributionData}
            isLoading={!budgetItems}
          />
        </div>

        {/* Row 3: Activity Heatmap (Full Width) */}
        <div>
          <ActivityHeatmap
            data={heatmapData}
            isLoading={!projects}
          />
        </div>
      </div>
    </div>
  );
}
