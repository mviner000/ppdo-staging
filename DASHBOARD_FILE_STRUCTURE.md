# Dashboard Restructure - File Structure Reference

## 📂 New Files Created

```
types/
└── dashboard.ts (NEW)
    ├── KPIData
    ├── FiscalYearStats
    ├── FiscalYearSummary
    ├── AnalyticsDataPoint
    ├── DashboardChartProps
    └── DashboardSummaryData

components/ppdo/dashboard/
├── index.ts (UPDATED - barrel export with all components)
├── charts/
│   └── index.ts (NEW - barrel export for charts)
├── landing/ (NEW)
│   ├── index.ts (NEW)
│   ├── FiscalYearLanding.tsx (NEW)
│   └── FiscalYearLandingCard.tsx (NEW)
└── summary/ (NEW)
    ├── index.ts (NEW)
    ├── DashboardSummary.tsx (NEW)
    ├── KPICardsRow.tsx (NEW)
    └── AnalyticsGrid.tsx (NEW)

app/dashboard/
├── page.tsx (UPDATED - now uses FiscalYearLanding)
└── [year]/ (NEW DIRECTORY)
    └── page.tsx (NEW)

convex/
└── dashboard.ts (NEW)
    ├── getSummaryData() - All years + statistics
    └── getYearSummary() - Single year detailed data
```

## 📊 Component Hierarchy

```
DashboardPage (app/dashboard/page.tsx)
└── FiscalYearLanding
    ├── FiscalYearHeader (existing component)
    ├── FiscalYearEmptyState (existing component)
    ├── FiscalYearModal (existing component)
    ├── FiscalYearDeleteDialog (existing component)
    ├── BetaBanner (existing component) ✨ NEW USAGE
    └── [FiscalYearLandingCard] (repeated for each year)
        ├── Folder icon + stats
        ├── Utilization progress bar
        ├── Expandable details
        ├── Dropdown menu (delete)
        └── "View Full Summary" button → navigate to /dashboard/[year]

DashboardYearPage (app/dashboard/[year]/page.tsx)
└── DashboardSummary
    ├── BetaBanner (existing component) ✨ NEW USAGE
    ├── Header with back button
    ├── KPICardsRow
    │   ├── Total Projects card
    │   ├── Ongoing card
    │   ├── Completed card
    │   └── Delayed card
    └── AnalyticsGrid
        ├── GovernmentTrendsAreaChart
        ├── ExecutiveFinancialPie
        ├── StatusDistributionPie
        ├── DepartmentUtilizationHorizontalBar
        ├── BudgetStatusProgressList
        └── ActivityHeatmap
```

## 🔗 Import Paths

### Landing Page
```tsx
import { FiscalYearLanding } from "@/components/ppdo/dashboard/landing";
// or
import { FiscalYearLanding } from "@/components/ppdo/dashboard";
```

### Year Summary
```tsx
import { DashboardSummary } from "@/components/ppdo/dashboard/summary";
// or
import { DashboardSummary } from "@/components/ppdo/dashboard";
```

### Individual Components
```tsx
// KPI Cards
import { KPICardsRow } from "@/components/ppdo/dashboard/summary";

// Analytics Grid
import { AnalyticsGrid } from "@/components/ppdo/dashboard/summary";

// Landing Card
import { FiscalYearLandingCard } from "@/components/ppdo/dashboard/landing";
```

### Chart Components
```tsx
// Old way (still works)
import { GovernmentTrendsAreaChart } from "@/components/dashboard/charts";

// New preferred way
import { GovernmentTrendsAreaChart } from "@/components/ppdo/dashboard/charts";

// Or from barrel export
import { GovernmentTrendsAreaChart } from "@/components/ppdo/dashboard";
```

### Types
```tsx
import type {
  KPIData,
  FiscalYearStats,
  FiscalYearSummary,
  AnalyticsDataPoint,
  DashboardChartProps,
  DashboardSummaryData,
} from "@/types/dashboard";
```

### Convex API
```tsx
import { api } from "@/convex/_generated/api";

// In component
const dashboardData = useQuery(api.dashboard.getSummaryData, {
  includeInactive: false,
});

const yearData = useQuery(api.dashboard.getYearSummary, { year: 2025 });
```

## 📋 Barrel Export Usage

### Landing Page Example
```tsx
import { FiscalYearLanding } from "@/components/ppdo/dashboard";

export default function Dashboard() {
  return <FiscalYearLanding />;
}
```

### Summary Page Example
```tsx
import { DashboardSummary } from "@/components/ppdo/dashboard";

export default function YearDashboard() {
  return <DashboardSummary year={2025} />;
}
```

### All Components Example
```tsx
import {
  FiscalYearLanding,
  DashboardSummary,
  KPICardsRow,
  AnalyticsGrid,
  // ... all charts
  GovernmentTrendsAreaChart,
  ActivityHeatmap,
} from "@/components/ppdo/dashboard";
```

## 🔄 Data Flow Overview

### 1. Landing Page Data
```
User visits /dashboard
    ↓
FiscalYearLanding renders
    ↓
useQuery(api.dashboard.getSummaryData)
    ↓
Convex aggregates all fiscal years + stats
    ↓
Component maps over years
    ↓
FiscalYearLandingCard rendered for each year
    ↓
User clicks "View Full Summary"
    ↓
Navigate to /dashboard/[year]
```

### 2. Year Summary Data
```
User visits /dashboard/2025
    ↓
DashboardSummary year={2025} renders
    ↓
useQuery(api.dashboard.getSummaryData)
    ↓
Component useMemo filters data for year 2025
    ↓
KPICardsRow + AnalyticsGrid render with filtered data
    ↓
All charts display year-specific analytics
```

## 🎯 Key Features by File

### FiscalYearLanding.tsx
- Fiscal year card grid
- Create/delete fiscal years
- Beta banner
- Empty state
- Loading state
- Modal integration

### FiscalYearLandingCard.tsx
- Individual year card
- Summary stats display
- Expandable details
- Utilization progress bar
- Dropdown menu
- Navigation trigger

### DashboardSummary.tsx
- Year-specific analytics
- KPI calculation
- Data filtering by year
- Beta banner
- Back navigation
- Responsive layout

### KPICardsRow.tsx
- 4-column KPI display
- Responsive grid
- Color-coded cards
- Total, Ongoing, Completed, Delayed

### AnalyticsGrid.tsx
- Chart layout management
- Responsive grid system
- 3-row analytics display
- Full-width heatmap

### dashboard.ts (Convex)
- getSummaryData() - Optimized all-years query
- getYearSummary() - Single-year lightweight query
- Server-side aggregation
- Pre-computed statistics
- Filtered data structures

## ✨ Beta Banner Integration

Both landing and summary pages include:
```tsx
<BetaBanner
  featureName="Dashboard"
  message="The new dashboard with fiscal year filtering is in beta..."
  variant="info"
  storageKey="dashboard-beta-banner-dismissed"
  userRole={user?.role}
/>
```

Features:
- Dismissible by super_admin only
- Persists dismissal via localStorage
- Blue "info" variant styling
- Appears at top of page

## 🚀 Performance Optimizations

1. **Single Bulk Query** - getSummaryData fetches all years once
2. **Server-Side Aggregation** - Calculations on server, not client
3. **Filtered Response** - Only needed fields returned
4. **Stable Data Structure** - Same shape prevents unnecessary renders
5. **useMemo Filtering** - Client-side year filtering with memoization
6. **Responsive Images** - Charts scale appropriately
7. **Code Splitting** - Components lazy-loadable via dynamic imports

## 📱 Responsive Breakpoints

### Landing Page Cards
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 2 columns

### KPI Cards Row
- Mobile: 2 columns
- Tablet (md): 4 columns (stacked differently)
- Desktop (lg): 4 columns (full row)

### Analytics Grid
- Mobile: 1 column (stacked)
- Tablet (md): varies per section
- Desktop (lg): 3 columns or full width

## 🌓 Dark Mode Support

All components include:
- `dark:bg-zinc-900` for backgrounds
- `dark:text-zinc-50` for text
- `dark:border-zinc-700` for borders
- `dark:hover:shadow-lg/50` for interactive elements
- Proper contrast ratios for accessibility

## ✅ No Breaking Changes

All existing dashboard routes remain unchanged:
- `/dashboard/office` ✅
- `/dashboard/project/[year]` ✅
- `/dashboard/trust-funds/[year]` ✅
- `/dashboard/special-education-funds/[year]` ✅
- `/dashboard/special-health-funds/[year]` ✅
- All other routes ✅

Chart components still accessible from old location for backward compatibility.

