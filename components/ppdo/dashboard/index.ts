// components/ppdo/dashboard/index.ts
/**
 * Dashboard component barrel exports
 * Provides unified access to all dashboard components
 */

// Charts
export {
  BudgetStatusProgressList,
  DashboardChartCard,
  DepartmentUtilizationHorizontalBar,
  ProjectActivityTimeline,
  ProjectStatusVerticalBar,
  TabbedPieChart,
  TrustFundLineChart,
} from './charts';

// Summary Components
export {
  DashboardSummary,
  KPICardsRow,
  AnalyticsGrid,
} from './summary';

// Landing Components
export {
  FiscalYearLanding,
  FiscalYearLandingCard,
} from './landing';