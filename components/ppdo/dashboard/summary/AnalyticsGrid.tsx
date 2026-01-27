// components/ppdo/dashboard/summary/AnalyticsGrid.tsx
"use client";

import {
  BudgetStatusProgressList,
  DepartmentUtilizationHorizontalBar,
  ProjectActivityTimeline,
  TabbedPieChart,
} from "@/components/ppdo/dashboard/charts";
import { TimelineData, DashboardPieChartData } from "@/types/dashboard";

interface AnalyticsGridProps {
  timelineData: TimelineData;
  pieChartData: DashboardPieChartData;
  utilizationData: Array<{
    department: string;
    rate: number;
  }>;
  budgetDistributionData: Array<{
    label: string;
    value: number;
    subValue: string;
    percentage: number;
  }>;
}

export function AnalyticsGrid({
  timelineData,
  pieChartData,
  utilizationData,
  budgetDistributionData,
}: AnalyticsGridProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: Pie Chart & Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TabbedPieChart
          data={pieChartData}
          isLoading={false}
        />
        <DepartmentUtilizationHorizontalBar
          data={utilizationData}
          isLoading={false}
        />
      </div>

      {/* Row 2: Timeline (Full Width) */}
      <div>
        <ProjectActivityTimeline
          data={timelineData}
          isLoading={false}
        />
      </div>

      {/* Row 3: Budget Status List (Full Width or distributed) */}
      <div>
        <BudgetStatusProgressList
          title="Sector Distribution"
          subtitle="Budget allocation by sector"
          data={budgetDistributionData}
          isLoading={false}
        />
      </div>
    </div>
  );
}
