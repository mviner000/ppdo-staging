// types/dashboard.ts
/**
 * Centralized types for dashboard components and data
 */

export interface KPIData {
  label: string;
  value: number;
  status?: 'active' | 'completed' | 'delayed' | 'pending';
  color?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface FiscalYearStats {
  projectCount: number;
  ongoingCount: number;
  completedCount: number;
  delayedCount: number;
  totalBudgetAllocated: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  breakdownCount: number;
}

export interface FiscalYearSummary {
  _id: string;
  year: number;
  label?: string;
  description?: string;
  isActive: boolean;
  stats: FiscalYearStats;
}

export interface AnalyticsDataPoint {
  label: string;
  allocated?: number;
  utilized?: number;
  obligated?: number;
  rate?: number;
  value?: number;
  values?: number[];
  department?: string;
  status?: string;
  count?: number;
  subValue?: string;
  percentage?: number;
  [key: string]: any;
}

export interface DashboardChartProps {
  title: string;
  subtitle?: string;
  data: AnalyticsDataPoint[];
  isLoading?: boolean;
  className?: string;
  accentColor?: string;
}

export interface DashboardSummaryData {
  year: number;
  kpiData: {
    totalProjects: number;
    ongoing: number;
    completed: number;
    delayed: number;
  };
  trendData: AnalyticsDataPoint[];
  financialData: {
    allocated: number;
    utilized: number;
    obligated: number;
  };
  statusData: Array<{
    status: 'ongoing' | 'completed' | 'delayed';
    count: number;
  }>;
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
  heatmapData: Array<{
    label: string;
    values: number[];
  }>;
}

export interface PieChartCategory {
  name: string;
  value: number;
  color: string;
}

export interface DashboardPieChartData {
  sector: PieChartCategory[];
  finance: PieChartCategory[];
  status: PieChartCategory[];
  department: PieChartCategory[];
}

export interface TimelineData {
  [year: string]: number[];
}
