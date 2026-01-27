// components/ppdo/dashboard/summary/DashboardSummary.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBanner } from "@/components/ui/beta-banner";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { KPICardsRow } from "./KPICardsRow";
import { AnalyticsGrid } from "./AnalyticsGrid";
import { LoginTrailDialog } from "@/components/LoginTrailDialog";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

interface DashboardSummaryProps {
  year: number;
}

/**
 * DashboardSummary Component
 *
 * Year-specific analytics dashboard showing:
 * - KPI cards for the selected year
 * - All analytics charts filtered by year
 * - Budget utilization metrics
 * - Project status distribution
 */
export function DashboardSummary({ year }: DashboardSummaryProps) {
  const router = useRouter();
  const { accentColorValue } = useAccentColor();
  const { user } = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch optimized dashboard data
  const dashboardData = useQuery(api.dashboard.getSummaryData, {
    includeInactive: false,
  });

  // Get year-specific analytics data
  const analyticsData = useMemo(() => {
    if (!dashboardData) {
      return {
        kpiData: { totalProjects: 0, ongoing: 0, completed: 0, delayed: 0 },
        timelineData: {},
        pieChartData: { sector: [], finance: [], status: [], department: [], budget: [] },
        utilizationData: [],
        budgetDistributionData: [],
      };
    }

    const yearStats = dashboardData.yearStats[year.toString()] || {
      projectCount: 0,
      ongoingCount: 0,
      completedCount: 0,
      delayedCount: 0,
      totalBudgetAllocated: 0,
      totalBudgetUtilized: 0,
      utilizationRate: 0,
      breakdownCount: 0,
    };

    // Build analytics from the year data
    const trendData = [
      {
        label: year.toString(),
        allocated: yearStats.totalBudgetAllocated,
        utilized: yearStats.totalBudgetUtilized,
      },
    ];

    const statusData = [
      { status: "ongoing" as const, count: yearStats.ongoingCount },
      { status: "completed" as const, count: yearStats.completedCount },
      { status: "delayed" as const, count: yearStats.delayedCount },
    ];

    // Get year-specific utilization data
    const yearUtilization = dashboardData.utilizationByYear[year.toString()] || [];
    const budgetDistribution = dashboardData.budgetDistributionByYear[year.toString()] || [];
    const heatmapData = dashboardData.heatmapDataByYear[year.toString()] || [];

    return {
      kpiData: {
        totalProjects: yearStats.projectCount,
        ongoing: yearStats.ongoingCount,
        completed: yearStats.completedCount,
        delayed: yearStats.delayedCount,
      },
      timelineData: dashboardData.timelineData || {},
      pieChartData: dashboardData.pieChartData || { sector: [], finance: [], status: [], department: [], budget: [] },
      utilizationData: yearUtilization,
      budgetDistributionData: budgetDistribution,
    };
  }, [dashboardData, year]);

  if (!isMounted) return null;

  if (dashboardData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent mb-4"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Beta Banner */}
      <BetaBanner
        featureName="Dashboard"
        message="The new dashboard with fiscal year filtering is in beta. We're actively improving the experience."
        variant="info"
        storageKey="dashboard-beta-banner-dismissed"
        userRole={user?.role}
      />

      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Calendar
                className="w-6 h-6"
                style={{ color: accentColorValue }}
              />
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {year} Summary
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Detailed analytics and performance metrics for this fiscal year
            </p>
          </div>
        </div>
        <div className="ml-auto">
          <LoginTrailDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardsRow
        totalProjects={analyticsData.kpiData.totalProjects}
        ongoing={analyticsData.kpiData.ongoing}
        completed={analyticsData.kpiData.completed}
        delayed={analyticsData.kpiData.delayed}
        accentColor={accentColorValue}
      />

      {/* Analytics Grid */}
      <AnalyticsGrid
        timelineData={analyticsData.timelineData}
        pieChartData={analyticsData.pieChartData}
        utilizationData={analyticsData.utilizationData}
        budgetDistributionData={analyticsData.budgetDistributionData}
      />
    </div>
  );
}
