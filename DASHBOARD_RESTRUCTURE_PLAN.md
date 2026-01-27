# Dashboard Restructure & UX Redesign Plan

**Document Status:** Comprehensive Planning Document  
**Target Implementation:** Phase 1 (Core Structure) → Phase 2 (UX Redesign)  
**Priority Level:** High (Addresses Boss Requirements)  
**Date Created:** January 27, 2026

---

## Executive Summary

This plan restructures the dashboard from a **single-view analytics page** into a **two-tier fiscal year-based navigation system** similar to the office page pattern. The new architecture will:

1. **Consolidate** all dashboard chart components into a reusable component library
2. **Replace** the current dashboard landing with a fiscal year card grid (folder-like view)
3. **Create** a dynamic `[year]` route showing year-filtered analytics and KPIs
4. **Implement** consistent navigation patterns across government fund modules

---

## Part 1: Current State Analysis

### 1.1 Current Architecture

```
CURRENT STRUCTURE:
app/dashboard/
├── page.tsx (analytics dashboard - CURRENT MAIN VIEW)
├── office/page.tsx (folder-style office cards)
├── project/page.tsx (fiscal year cards → project details)
├── trust-funds/page.tsx (fiscal year cards → fund details)
├── special-education-funds/page.tsx (similar pattern)
└── special-health-funds/page.tsx (similar pattern)

components/dashboard/
├── charts/
│   ├── ActivityHeatmap.tsx
│   ├── BudgetStatusProgressList.tsx
│   ├── DashboardChartCard.tsx
│   ├── DepartmentUtilizationHorizontalBar.tsx
│   ├── ExecutiveFinancialPie.tsx
│   ├── GovernmentTrendsAreaChart.tsx
│   ├── ProjectStatusVerticalBar.tsx
│   ├── StatusDistributionPie.tsx
│   └── TrustFundLineChart.tsx
```

### 1.2 Current Dashboard Page Analysis

**File:** `app/dashboard/page.tsx` (217 lines)

**Current Implementation:**
- Fetches all projects and budgetItems globally
- Shows 6 KPI cards (total, ongoing, completed, delayed counts)
- Displays 3 analytical rows:
  - Row 1: Trends chart + Financial pie
  - Row 2: Status dist + Department util + Budget status list
  - Row 3: Activity heatmap (full width)
- No year filtering (shows all data combined)
- Charts hardcoded in page component

**Components Used:**
- `DepartmentUtilizationHorizontalBar`
- `GovernmentTrendsAreaChart`
- `ActivityHeatmap`
- `BudgetStatusProgressList`
- `ExecutiveFinancialPie`
- `StatusDistributionPie`
- `LoginTrailDialog`

### 1.3 Office Page Pattern Reference

**File:** `app/dashboard/office/page.tsx`

**Pattern Elements (To Replicate):**
```typescript
- Card grid layout (grid-cols-1 lg:grid-cols-2 or similar)
- Search/filter functionality
- Folder-like visual (using icons like Folder icon)
- Default list of static items
- Expandable cards with more details
- Add/Create modal for new items
```

### 1.4 Project Page Pattern (Also Using Fiscal Years)

**File:** `app/dashboard/project/page.tsx`

**Pattern Elements (Already Correct):**
- Fiscal year cards in grid
- Click to navigate: `/dashboard/project/[year]`
- FiscalYearCard component with stats
- FiscalYearHeader for add/manage
- FiscalYearModal for creating years
- FiscalYearEmptyState for zero-data case

---

## Part 2: Proposed New Architecture

### 2.1 New Directory Structure

```
POST-RESTRUCTURE:

components/ppdo/dashboard/
├── index.ts (NEW - barrel export)
├── charts/
│   ├── index.ts (NEW - barrel export)
│   ├── ActivityHeatmap.tsx (MOVED from components/dashboard/charts/)
│   ├── BudgetStatusProgressList.tsx
│   ├── DashboardChartCard.tsx
│   ├── DepartmentUtilizationHorizontalBar.tsx
│   ├── ExecutiveFinancialPie.tsx
│   ├── GovernmentTrendsAreaChart.tsx
│   ├── ProjectStatusVerticalBar.tsx
│   ├── StatusDistributionPie.tsx
│   └── TrustFundLineChart.tsx
├── summary/ (NEW)
│   ├── index.ts
│   ├── DashboardSummary.tsx (NEW - year-specific analytics view)
│   ├── KPICardsRow.tsx (NEW - extracted from page.tsx)
│   └── AnalyticsGrid.tsx (NEW - extracted from page.tsx)
└── landing/ (NEW)
    ├── index.ts
    ├── FiscalYearLanding.tsx (NEW - main dashboard landing)
    └── FiscalYearLandingCard.tsx (NEW - individual fiscal year card)

app/dashboard/
├── page.tsx (RESTRUCTURED - now shows fiscal year cards)
├── [year]/ (NEW DYNAMIC ROUTE)
│   └── page.tsx (NEW - shows year-filtered summary)
├── office/page.tsx (unchanged)
├── project/page.tsx (unchanged)
├── trust-funds/page.tsx (unchanged)
└── ... (other routes)

TYPE DEFINITIONS:
types/
├── dashboard.ts (NEW)
│   ├── DashboardChartProps
│   ├── FiscalYearSummary
│   ├── KPIData
│   └── AnalyticsDataPoint
```

### 2.2 New Data Flow

```
USER JOURNEY:

1. LOGIN → Dashboard (/dashboard)
   ↓
2. LANDING PAGE (FiscalYearLanding)
   - Shows fiscal year cards in grid
   - Each card: year, summary stats (budget allocated, projects count, etc.)
   - CTA: "View Summary" button
   - Add button: Create new fiscal year
   ↓
3. CLICK YEAR CARD → Dynamic Route (/dashboard/[year])
   ↓
4. YEAR SUMMARY PAGE (DashboardSummary)
   - KPI Cards (filtered by year)
   - All analytics charts (filtered by year)
   - Deeper insights for that specific year
   - Link back to fiscal year selection
   ↓
5. From Summary → Navigate to other sections:
   - /dashboard/project/[year] (detailed projects)
   - /dashboard/trust-funds/[year] (trust funds)
   - Etc.
```

---

## Part 3: Detailed Component Breakdown

### 3.1 Phase 1: Component Consolidation & Relocation

#### Task 1.1: Create Dashboard Type Definitions

**File:** `types/dashboard.ts` (NEW)

```typescript
// Centralized types for dashboard components and data

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

export interface FiscalYearSummary {
  year: number;
  label?: string;
  description?: string;
  stats: {
    totalProjectCount: number;
    ongoingCount: number;
    completedCount: number;
    delayedCount: number;
    totalBudgetAllocated: number;
    totalBudgetUtilized: number;
    utilizationRate: number;
  };
  isExpandable?: boolean;
  expandedContent?: React.ReactNode;
}

export interface AnalyticsDataPoint {
  label: string;
  allocated?: number;
  utilized?: number;
  obligated?: number;
  rate?: number;
  value?: number;
  values?: number[];
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
```

#### Task 1.2: Create Dashboard Component Index

**File:** `components/ppdo/dashboard/index.ts` (RESTRUCTURED)

```typescript
// Dashboard component barrel exports

// Charts
export { ActivityHeatmap } from './charts/ActivityHeatmap';
export { BudgetStatusProgressList } from './charts/BudgetStatusProgressList';
export { DashboardChartCard } from './charts/DashboardChartCard';
export { DepartmentUtilizationHorizontalBar } from './charts/DepartmentUtilizationHorizontalBar';
export { ExecutiveFinancialPie } from './charts/ExecutiveFinancialPie';
export { GovernmentTrendsAreaChart } from './charts/GovernmentTrendsAreaChart';
export { ProjectStatusVerticalBar } from './charts/ProjectStatusVerticalBar';
export { StatusDistributionPie } from './charts/StatusDistributionPie';
export { TrustFundLineChart } from './charts/TrustFundLineChart';

// Summary Components
export { DashboardSummary } from './summary/DashboardSummary';
export { KPICardsRow } from './summary/KPICardsRow';
export { AnalyticsGrid } from './summary/AnalyticsGrid';

// Landing Components
export { FiscalYearLanding } from './landing/FiscalYearLanding';
export { FiscalYearLandingCard } from './landing/FiscalYearLandingCard';

// Charts Index (sub-barrel)
export * from './charts/index';
```

**File:** `components/ppdo/dashboard/charts/index.ts` (NEW)

```typescript
// Charts barrel export for easy imports
export { ActivityHeatmap } from './ActivityHeatmap';
export { BudgetStatusProgressList } from './BudgetStatusProgressList';
export { DashboardChartCard } from './DashboardChartCard';
export { DepartmentUtilizationHorizontalBar } from './DepartmentUtilizationHorizontalBar';
export { ExecutiveFinancialPie } from './ExecutiveFinancialPie';
export { GovernmentTrendsAreaChart } from './GovernmentTrendsAreaChart';
export { ProjectStatusVerticalBar } from './ProjectStatusVerticalBar';
export { StatusDistributionPie } from './StatusDistributionPie';
export { TrustFundLineChart } from './TrustFundLineChart';
```

#### Task 1.3: Move Chart Components

**Actions:**
- Move all chart files from `components/dashboard/charts/*.tsx` to `components/ppdo/dashboard/charts/*.tsx`
- Update import paths in each chart component (if they reference other dashboard files)
- Verify no breaking changes to existing imports in other page files

**Files to Move:**
```
components/dashboard/charts/ActivityHeatmap.tsx
components/dashboard/charts/BudgetStatusProgressList.tsx
components/dashboard/charts/DashboardChartCard.tsx
components/dashboard/charts/DepartmentUtilizationHorizontalBar.tsx
components/dashboard/charts/ExecutiveFinancialPie.tsx
components/dashboard/charts/GovernmentTrendsAreaChart.tsx
components/dashboard/charts/ProjectStatusVerticalBar.tsx
components/dashboard/charts/StatusDistributionPie.tsx
components/dashboard/charts/TrustFundLineChart.tsx
```

**Impact Analysis:**
- `app/dashboard/page.tsx` - Update imports
- Any other pages importing from these charts - Update imports
- Search for: `from "../../components/dashboard/charts/"` → Replace with `from "@/components/ppdo/dashboard/charts"`

---

### 3.2 Phase 2: Landing Page Components

#### Task 2.1: Create FiscalYearLanding Component

**File:** `components/ppdo/dashboard/landing/FiscalYearLanding.tsx` (NEW)

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { FolderTree, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiscalYearModal } from "@/components/ppdo/fiscal-years";
import { FiscalYearDeleteDialog } from "@/components/ppdo/fiscal-years/FiscalYearDeleteDialog";
import { FiscalYearEmptyState } from "@/components/ppdo/fiscal-years/FiscalYearEmptyState";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { FiscalYearLandingCard } from "./FiscalYearLandingCard";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

/**
 * FiscalYearLanding Component
 *
 * Main dashboard landing page showing fiscal years as cards.
 * Users can click a fiscal year to view detailed year-specific analytics.
 *
 * Features:
 * - Grid of fiscal year cards with summary stats
 * - Create new fiscal year modal
 * - Delete fiscal year with confirmation
 * - Year-specific statistics (budgets, projects, etc.)
 * - Click to navigate to /dashboard/[year]
 */
export function FiscalYearLanding() {
  const router = useRouter();
  const { accentColorValue } = useAccentColor();
  const [showFiscalYearModal, setShowFiscalYearModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<{
    id: Id<"fiscalYears">;
    year: number;
  } | null>(null);

  // Fetch data
  const fiscalYears = useQuery(api.fiscalYears.list, {
    includeInactive: false,
  });
  const allBudgetItems = useQuery(api.budgetItems.list, {});
  const allProjects = useQuery(api.projects.list, {});
  const allBreakdowns = useQuery(api.govtProjects.getProjectBreakdowns, {});

  // Delete mutation
  const deleteFiscalYear = useMutation(api.fiscalYears.remove);

  const isLoading =
    fiscalYears === undefined ||
    allBudgetItems === undefined ||
    allProjects === undefined ||
    allBreakdowns === undefined;

  // Calculate statistics per year
  const yearsWithStats = useMemo(() => {
    if (
      !fiscalYears ||
      !allBudgetItems ||
      !allProjects ||
      !allBreakdowns
    )
      return [];

    return fiscalYears
      .map((fy) => {
        const yearBudgetItems = allBudgetItems.filter(
          (item) => item.year === fy.year
        );
        const yearProjects = allProjects.filter(
          (project) => project.year === fy.year
        );
        const yearBreakdowns = allBreakdowns.filter((breakdown) => {
          const parentProject = allProjects.find(
            (p) => p._id === breakdown.projectId
          );
          return parentProject?.year === fy.year;
        });

        const totalAllocated = yearBudgetItems.reduce(
          (sum, item) => sum + (item.totalBudgetAllocated || 0),
          0
        );
        const totalUtilized = yearBudgetItems.reduce(
          (sum, item) => sum + (item.totalBudgetUtilized || 0),
          0
        );

        return {
          ...fy,
          stats: {
            projectCount: yearProjects.length,
            ongoingCount: yearProjects.filter(
              (p) => p.status === "ongoing"
            ).length,
            completedCount: yearProjects.filter(
              (p) => p.status === "completed"
            ).length,
            delayedCount: yearProjects.filter(
              (p) => p.status === "delayed"
            ).length,
            totalBudgetAllocated: totalAllocated,
            totalBudgetUtilized: totalUtilized,
            utilizationRate:
              totalAllocated > 0
                ? (totalUtilized / totalAllocated) * 100
                : 0,
            breakdownCount: yearBreakdowns.length,
          },
        };
      })
      .sort((a, b) => b.year - a.year);
  }, [fiscalYears, allBudgetItems, allProjects, allBreakdowns]);

  const handleOpenYear = (year: number) => {
    router.push(`/dashboard/${year}`);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    id: Id<"fiscalYears">,
    year: number
  ) => {
    e.stopPropagation();
    setYearToDelete({ id, year });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!yearToDelete) return;

    try {
      await deleteFiscalYear({ id: yearToDelete.id });
      toast.success(`Fiscal Year ${yearToDelete.year} deleted successfully`);
      setDeleteDialogOpen(false);
      setYearToDelete(null);
    } catch (error) {
      toast.error("Failed to delete fiscal year");
      console.error(error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent mb-4"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading fiscal years...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FolderTree className="w-8 h-8" style={{ color: accentColorValue }} />
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Select a fiscal year to view detailed analytics and performance metrics
            </p>
          </div>
          <Button
            onClick={() => setShowFiscalYearModal(true)}
            className="w-full md:w-auto"
            style={{
              backgroundColor: accentColorValue,
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Fiscal Year
          </Button>
        </div>

        {/* Empty State */}
        {yearsWithStats.length === 0 ? (
          <FiscalYearEmptyState
            onCreateFirst={() => setShowFiscalYearModal(true)}
            accentColor={accentColorValue}
          />
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {yearsWithStats.map((fiscalYear, index) => {
              const isExpanded = expandedCards.has(fiscalYear._id);

              return (
                <FiscalYearLandingCard
                  key={fiscalYear._id}
                  index={index}
                  fiscalYear={fiscalYear}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleCard(fiscalYear._id)}
                  onOpen={() => handleOpenYear(fiscalYear.year)}
                  onDelete={(e) =>
                    handleDeleteClick(e, fiscalYear._id, fiscalYear.year)
                  }
                  accentColor={accentColorValue}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <FiscalYearModal
        isOpen={showFiscalYearModal}
        onClose={() => setShowFiscalYearModal(false)}
        onSuccess={() => {
          // Refresh handled by Convex
        }}
      />

      <FiscalYearDeleteDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        yearToDelete={yearToDelete}
        onConfirm={handleConfirmDelete}
        itemTypeLabel="all data"
      />

      <style jsx global>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
```

#### Task 2.2: Create FiscalYearLandingCard Component

**File:** `components/ppdo/dashboard/landing/FiscalYearLandingCard.tsx` (NEW)

```typescript
"use client";

import { Folder, ChevronDown, MoreVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FiscalYearStats {
  projectCount: number;
  ongoingCount: number;
  completedCount: number;
  delayedCount: number;
  totalBudgetAllocated: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  breakdownCount: number;
}

interface FiscalYear {
  _id: string;
  year: number;
  label?: string;
  description?: string;
  stats: FiscalYearStats;
}

interface FiscalYearLandingCardProps {
  fiscalYear: FiscalYear;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
  accentColor?: string;
  index?: number;
}

/**
 * FiscalYearLandingCard Component
 *
 * Card representing a single fiscal year in the landing page grid.
 * Shows year summary stats with expandable detailed view.
 */
export function FiscalYearLandingCard({
  fiscalYear,
  isExpanded,
  onToggleExpand,
  onOpen,
  onDelete,
  accentColor = "#15803D",
  index = 0,
}: FiscalYearLandingCardProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:shadow-lg dark:hover:shadow-lg/50",
        "border-l-4 overflow-hidden"
      )}
      style={{
        borderLeftColor: accentColor,
        animation: `fadeInSlide 0.3s ease-out ${index * 0.05}s both`,
      }}
      onClick={onOpen}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Folder className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              FY {fiscalYear.year}
            </h3>
            {fiscalYear.label && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {fiscalYear.label}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Year
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Projects</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {fiscalYear.stats.projectCount}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Budget</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            ₱{(fiscalYear.stats.totalBudgetAllocated / 1_000_000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Utilization Rate */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Budget Utilization
          </p>
          <p className="text-sm font-semibold" style={{ color: accentColor }}>
            {fiscalYear.stats.utilizationRate.toFixed(1)}%
          </p>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, fiscalYear.stats.utilizationRate)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        className="flex items-center justify-between w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Ongoing</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.ongoingCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Completed
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.completedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Delayed</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.delayedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Breakdowns
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.breakdownCount}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Allocated</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatCurrency(fiscalYear.stats.totalBudgetAllocated)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Utilized</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatCurrency(fiscalYear.stats.totalBudgetUtilized)}
              </span>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="w-full mt-4"
            style={{ backgroundColor: accentColor }}
          >
            View Full Summary
          </Button>
        </div>
      )}
    </Card>
  );
}
```

#### Task 2.3: Create Summary Components

**File:** `components/ppdo/dashboard/summary/DashboardSummary.tsx` (NEW)

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccentColor } from "@/contexts/AccentColorContext";
import {
  GovernmentTrendsAreaChart,
  ActivityHeatmap,
  BudgetStatusProgressList,
  ExecutiveFinancialPie,
  StatusDistributionPie,
  DepartmentUtilizationHorizontalBar,
} from "@/components/ppdo/dashboard/charts";
import { KPICardsRow } from "./KPICardsRow";
import { AnalyticsGrid } from "./AnalyticsGrid";
import { LoginTrailDialog } from "@/components/LoginTrailDialog";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all data
  const projects = useQuery(api.projects.list, {});
  const budgetItems = useQuery(api.budgetItems.list, {});

  // Filter data by year
  const yearProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => p.year === year);
  }, [projects, year]);

  const yearBudgetItems = useMemo(() => {
    if (!budgetItems) return [];
    return budgetItems.filter((item) => item.year === year);
  }, [budgetItems, year]);

  // KPI Data
  const kpiData = useMemo(() => {
    return {
      totalProjects: yearProjects.length,
      ongoing: yearProjects.filter((p) => p.status === "ongoing").length,
      completed: yearProjects.filter((p) => p.status === "completed").length,
      delayed: yearProjects.filter((p) => p.status === "delayed").length,
    };
  }, [yearProjects]);

  // Analytics Data
  const trendData = useMemo(() => {
    return [
      {
        label: year.toString(),
        allocated: yearBudgetItems.reduce(
          (sum, item) => sum + (item.totalBudgetAllocated || 0),
          0
        ),
        utilized: yearBudgetItems.reduce(
          (sum, item) => sum + (item.totalBudgetUtilized || 0),
          0
        ),
      },
    ];
  }, [yearBudgetItems, year]);

  const financialData = useMemo(() => {
    return {
      allocated: yearBudgetItems.reduce(
        (sum, item) => sum + (item.totalBudgetAllocated || 0),
        0
      ),
      utilized: yearBudgetItems.reduce(
        (sum, item) => sum + (item.totalBudgetUtilized || 0),
        0
      ),
      obligated: yearBudgetItems.reduce(
        (sum, item) => sum + (item.obligatedBudget || 0),
        0
      ),
    };
  }, [yearBudgetItems]);

  const statusData = useMemo(() => {
    return [
      {
        status: "ongoing" as const,
        count: kpiData.ongoing,
      },
      {
        status: "completed" as const,
        count: kpiData.completed,
      },
      {
        status: "delayed" as const,
        count: kpiData.delayed,
      },
    ];
  }, [kpiData]);

  const utilizationData = useMemo(() => {
    const grouped = yearBudgetItems.reduce(
      (acc, item) => {
        const label = item.particulars || "Uncategorized";
        if (!acc[label]) acc[label] = { allocated: 0, utilized: 0 };
        acc[label].allocated += item.totalBudgetAllocated || 0;
        acc[label].utilized += item.totalBudgetUtilized || 0;
        return acc;
      },
      {} as Record<string, { allocated: number; utilized: number }>
    );

    return Object.entries(grouped)
      .map(([department, data]) => ({
        department,
        rate: data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [yearBudgetItems]);

  const budgetDistributionData = useMemo(() => {
    const categories = Array.from(
      new Set(yearBudgetItems.map((b) => b.particulars))
    ).slice(0, 6);

    return categories.map((cat) => {
      const items = yearBudgetItems.filter((b) => b.particulars === cat);
      const allocated = items.reduce(
        (sum, i) => sum + (i.totalBudgetAllocated || 0),
        0
      );
      const utilized = items.reduce(
        (sum, i) => sum + (i.totalBudgetUtilized || 0),
        0
      );

      return {
        label: cat || "Uncategorized",
        value: allocated,
        subValue: `${items.length} items`,
        percentage: allocated > 0 ? (utilized / allocated) * 100 : 0,
      };
    });
  }, [yearBudgetItems]);

  const heatmapData = useMemo(() => {
    const offices = Array.from(
      new Set(yearProjects.map((p) => p.implementingOffice))
    ).slice(0, 8);

    return offices.map((office) => {
      const officeProjects = yearProjects.filter(
        (p) => p.implementingOffice === office
      );
      const values = Array(12).fill(0);
      officeProjects.forEach((p) => {
        values[new Date(p.createdAt).getMonth()]++;
      });
      return { label: office, values };
    });
  }, [yearProjects]);

  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
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
              FY {year} Summary
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Detailed analytics and performance metrics for this fiscal year
          </p>
        </div>
        <div className="ml-auto">
          <LoginTrailDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardsRow
        totalProjects={kpiData.totalProjects}
        ongoing={kpiData.ongoing}
        completed={kpiData.completed}
        delayed={kpiData.delayed}
        accentColor={accentColorValue}
      />

      {/* Analytics Grid */}
      <AnalyticsGrid
        trendData={trendData}
        financialData={financialData}
        statusData={statusData}
        utilizationData={utilizationData}
        budgetDistributionData={budgetDistributionData}
        heatmapData={heatmapData}
        accentColor={accentColorValue}
      />
    </div>
  );
}
```

**File:** `components/ppdo/dashboard/summary/KPICardsRow.tsx` (NEW)

```typescript
"use client";

interface KPICardsRowProps {
  totalProjects: number;
  ongoing: number;
  completed: number;
  delayed: number;
  accentColor?: string;
}

export function KPICardsRow({
  totalProjects,
  ongoing,
  completed,
  delayed,
  accentColor = "#15803D",
}: KPICardsRowProps) {
  const kpiCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      color: "text-zinc-900 dark:text-zinc-50",
    },
    {
      label: "Ongoing",
      value: ongoing,
      color: "text-blue-600 dark:text-blue-500",
    },
    {
      label: "Completed",
      value: completed,
      color: "text-emerald-600 dark:text-emerald-500",
    },
    {
      label: "Delayed",
      value: delayed,
      color: "text-red-600 dark:text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpiCards.map((card) => (
        <div
          key={card.label}
          className="group bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide mb-2">
            {card.label}
          </p>
          <p className={`text-3xl sm:text-4xl font-bold ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**File:** `components/ppdo/dashboard/summary/AnalyticsGrid.tsx` (NEW)

```typescript
"use client";

import {
  GovernmentTrendsAreaChart,
  ActivityHeatmap,
  BudgetStatusProgressList,
  ExecutiveFinancialPie,
  StatusDistributionPie,
  DepartmentUtilizationHorizontalBar,
} from "@/components/ppdo/dashboard/charts";
import { AnalyticsDataPoint } from "@/types/dashboard";

interface AnalyticsGridProps {
  trendData: AnalyticsDataPoint[];
  financialData: {
    allocated: number;
    utilized: number;
    obligated: number;
  };
  statusData: Array<{
    status: "ongoing" | "completed" | "delayed";
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
  accentColor?: string;
}

export function AnalyticsGrid({
  trendData,
  financialData,
  statusData,
  utilizationData,
  budgetDistributionData,
  heatmapData,
  accentColor = "#15803D",
}: AnalyticsGridProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: High Level Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Trend Chart - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <GovernmentTrendsAreaChart
            title="Budget Allocation vs. Utilization"
            subtitle="Year-over-year comparison"
            data={trendData}
            isLoading={false}
          />
        </div>
        {/* Financial Pie Chart - 1 column */}
        <div>
          <ExecutiveFinancialPie
            data={financialData}
            isLoading={false}
          />
        </div>
      </div>

      {/* Row 2: Operational Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatusDistributionPie
          data={statusData}
          isLoading={false}
        />
        <DepartmentUtilizationHorizontalBar
          data={utilizationData}
          isLoading={false}
        />
        <BudgetStatusProgressList
          title="Sector Distribution"
          subtitle="Budget allocation by sector"
          data={budgetDistributionData}
          isLoading={false}
        />
      </div>

      {/* Row 3: Activity Heatmap (Full Width) */}
      <div>
        <ActivityHeatmap
          data={heatmapData}
          isLoading={false}
        />
      </div>
    </div>
  );
}
```

---

### 3.3 Phase 3: Page Routing & Updates

#### Task 3.1: Restructure Dashboard Landing Page

**File:** `app/dashboard/page.tsx` (COMPLETE REWRITE)

```typescript
// app/dashboard/page.tsx

import { FiscalYearLanding } from "@/components/ppdo/dashboard/landing";

/**
 * Main Dashboard Page
 *
 * Displays fiscal year cards as the landing page.
 * Users click a year to navigate to /dashboard/[year] for detailed analytics.
 *
 * This replaces the previous single analytics view with a year-selection view.
 */
export default function DashboardPage() {
  return <FiscalYearLanding />;
}
```

#### Task 3.2: Create Dynamic Year Route

**File:** `app/dashboard/[year]/page.tsx` (NEW)

```typescript
// app/dashboard/[year]/page.tsx

"use client";

import { DashboardSummary } from "@/components/ppdo/dashboard/summary";
import { useParams } from "next/navigation";

/**
 * Dynamic Dashboard Year Summary Page
 *
 * Route: /dashboard/[year]
 * Shows year-specific analytics and KPIs
 */
export default function DashboardYearPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  if (isNaN(year)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Invalid fiscal year</p>
      </div>
    );
  }

  return <DashboardSummary year={year} />;
}
```

---

## Part 4: Implementation Roadmap

### Phase 1: Component Consolidation (Week 1)

```
Day 1-2: Setup & Type Definitions
├── Create types/dashboard.ts
├── Create components/ppdo/dashboard/index.ts
├── Create components/ppdo/dashboard/charts/index.ts
└── Verify no import errors

Day 3-4: Move Chart Components
├── Move 9 chart files from components/dashboard/charts/ → components/ppdo/dashboard/charts/
├── Update all import paths in moved files
├── Update imports in any other files using these charts
├── Run tests to ensure no breaking changes
└── Delete old components/dashboard/ directory

Day 5: Verification
├── Search entire codebase for any remaining `from "../../components/dashboard/charts"`
├── Update any missed imports
├── Verify all dashboard-related pages still load correctly
└── Test chart rendering
```

### Phase 2: Landing & Summary Components (Week 2)

```
Day 1-2: Create Landing Components
├── Create FiscalYearLanding.tsx
├── Create FiscalYearLandingCard.tsx
└── Test card rendering, expand/collapse, delete dialogs

Day 3: Create Summary Components
├── Create DashboardSummary.tsx
├── Create KPICardsRow.tsx
├── Create AnalyticsGrid.tsx
└── Test year-filtered data computation

Day 4-5: Routing Setup & Integration
├── Update app/dashboard/page.tsx to use FiscalYearLanding
├── Create app/dashboard/[year]/page.tsx
├── Test navigation: landing → year page
├── Test back button and URL handling
└── Verify all data filters work correctly
```

### Phase 3: Testing & Refinement (Week 3)

```
Day 1-2: User Acceptance Testing
├── Test landing page loads
├── Test fiscal year card interactions
├── Test creation/deletion of fiscal years
├── Test navigation to year summary
└── Test all charts render with correct data

Day 3-4: Performance & UX Polish
├── Check loading states
├── Verify animations work smoothly
├── Test responsive design (mobile, tablet, desktop)
├── Test dark mode
└── Performance optimization if needed

Day 5: Documentation & Handoff
├── Update component documentation
├── Create user guide for the new dashboard
└── Prepare for boss presentation
```

---

## Part 5: File Migration Checklist

### Components to Move

```
✅ Create: components/ppdo/dashboard/
✅ Create: components/ppdo/dashboard/charts/
✅ Create: components/ppdo/dashboard/summary/
✅ Create: components/ppdo/dashboard/landing/

MOVE (9 files):
- [ ] components/dashboard/charts/ActivityHeatmap.tsx
- [ ] components/dashboard/charts/BudgetStatusProgressList.tsx
- [ ] components/dashboard/charts/DashboardChartCard.tsx
- [ ] components/dashboard/charts/DepartmentUtilizationHorizontalBar.tsx
- [ ] components/dashboard/charts/ExecutiveFinancialPie.tsx
- [ ] components/dashboard/charts/GovernmentTrendsAreaChart.tsx
- [ ] components/dashboard/charts/ProjectStatusVerticalBar.tsx
- [ ] components/dashboard/charts/StatusDistributionPie.tsx
- [ ] components/dashboard/charts/TrustFundLineChart.tsx

CREATE (8 files):
- [ ] components/ppdo/dashboard/index.ts
- [ ] components/ppdo/dashboard/charts/index.ts
- [ ] components/ppdo/dashboard/landing/FiscalYearLanding.tsx
- [ ] components/ppdo/dashboard/landing/FiscalYearLandingCard.tsx
- [ ] components/ppdo/dashboard/summary/DashboardSummary.tsx
- [ ] components/ppdo/dashboard/summary/KPICardsRow.tsx
- [ ] components/ppdo/dashboard/summary/AnalyticsGrid.tsx
- [ ] types/dashboard.ts

UPDATE (Pages):
- [ ] app/dashboard/page.tsx (complete rewrite)
- [ ] app/dashboard/[year]/page.tsx (new file)

DELETE:
- [ ] components/dashboard/ (entire directory after verification)
```

---

## Part 6: Import Update Strategy

### Search & Replace Commands

```bash
# Find all imports from old location
grep -r "from.*components/dashboard/charts" app/
grep -r "from.*components/dashboard/charts" components/

# Replacement pattern:
# OLD: import { Chart } from "../../components/dashboard/charts/Chart"
# NEW: import { Chart } from "@/components/ppdo/dashboard/charts"

# Or use barrel export:
# NEW: import { Chart } from "@/components/ppdo/dashboard"
```

### Files Likely to Need Updates

```
- app/dashboard/page.tsx (MAIN - will be rewritten anyway)
- Any other pages importing from components/dashboard/charts/
- Verify: grep -r "components/dashboard" convex/ (should be none)
```

---

## Part 7: UX Design Specifications

### Dashboard Landing Page

**Layout:**
- Header: "Dashboard" title with icon, subtitle, "New Fiscal Year" button
- Grid: 1 column (mobile) → 2 columns (tablet+)
- Card size: Full width, ~300px height when collapsed

**Interactions:**
- Click card: Navigate to /dashboard/[year]
- Expand card: Show detailed stats (ongoingCount, completedCount, etc.)
- More menu: Delete fiscal year option
- Empty state: "No fiscal years yet" message with CTA

**Data Shown (Per Card):**
```
┌─────────────────────────────┐
│ 📁 FY 2025                  │ ≡
│                             │
│ Projects: 42    Budget: ₱50M│
│                             │
│ Utilization: 65% ████░░    │
│ [Show Details ▼]            │
└─────────────────────────────┘

EXPANDED:
│ Ongoing: 25   Completed: 12 │
│ Delayed: 5    Breakdowns: 18│
│ Allocated: ₱50.2M           │
│ Utilized: ₱32.6M            │
│ [View Full Summary]         │
└─────────────────────────────┘
```

### Year Summary Page

**Layout:**
- Back button + year title (e.g., "← FY 2025 Summary")
- 4 KPI cards in grid (1x4 on desktop, 2x2 on tablet, 1x4 on mobile)
- 3-section analytics:
  - Trends + Financial Pie
  - Status Dist + Department Util + Budget Status
  - Full-width Activity Heatmap

**Data Shown:**
- All data filtered by selected year
- Same charts as current dashboard but year-filtered
- Live updates when data changes

---

## Part 8: Benefits of This Restructure

### For Your Boss 🎯

1. **Better Organization**: Fiscal years clearly displayed as "folders" like the office page
2. **Cleaner Interface**: No information overload on landing page
3. **Focused Analytics**: Each year's metrics clearly separated
4. **Scalability**: Easy to add more year-specific views later
5. **Professional Appearance**: Matches government portal patterns

### For Developers 👨‍💻

1. **Reusable Components**: Charts moved to central location with barrel exports
2. **Cleaner Code**: Dashboard logic split into focused components
3. **Type Safety**: Centralized types for dashboard data
4. **Maintainability**: Single source of truth for dashboard imports
5. **Testability**: Smaller, focused components easier to unit test

### For Users 👥

1. **Intuitive Navigation**: Familiar folder-like interface
2. **Faster Loading**: Can defer detailed analytics until needed
3. **Mobile-Friendly**: Year selection optimized for all screen sizes
4. **Accessible**: Clear hierarchy and keyboard navigation

---

## Part 9: Potential Challenges & Solutions

| Challenge | Risk | Solution |
|-----------|------|----------|
| Breaking existing imports | HIGH | Pre-scan codebase, update all imports before deletion |
| Chart rendering issues after move | MEDIUM | Test each chart individually after move |
| Year filter logic bugs | MEDIUM | Unit test useMemo hooks with multiple year values |
| Performance (fetching all data) | LOW | Consider pagination/virtualization if 1000+ years exist |
| Mobile layout issues | LOW | Test responsive design at each breakpoint |

---

## Part 10: Post-Implementation Checklist

```
QUALITY ASSURANCE:
- [ ] All 9 charts render correctly in new location
- [ ] Landing page loads without errors
- [ ] Year selection navigates correctly
- [ ] Year summary shows filtered data
- [ ] Back button works
- [ ] All data is reactive (updates when changed)
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable

DOCUMENTATION:
- [ ] Update README with new structure
- [ ] Document component barrel exports
- [ ] Add JSDoc comments to new components
- [ ] Create troubleshooting guide

HANDOFF:
- [ ] Demo to boss
- [ ] Get approval
- [ ] Document any requested changes
- [ ] Deploy to production
```

---

## Part 11: Future Enhancements

After initial implementation, consider:

1. **Year Comparison View**: Compare metrics between fiscal years
2. **Export Reports**: Generate PDF summaries for each year
3. **Custom Date Ranges**: Allow filtering beyond fiscal years
4. **Real-time Notifications**: Alert on budget threshold changes
5. **Advanced Filtering**: Filter by office, project status, budget range
6. **Customizable Dashboards**: Let users choose which charts to display

---

## Summary

This plan transforms your dashboard from a **single-view** analytics page into a **two-tier fiscal year-based system** that:

✅ **Consolidates** dashboard components into a reusable library  
✅ **Improves UX** with a folder-like fiscal year landing page  
✅ **Provides focus** with year-specific analytics views  
✅ **Maintains scalability** for future enhancements  
✅ **Matches expectations** of your boss and government standards  

**Estimated Timeline:** 2-3 weeks for full implementation + testing

**Next Steps:**
1. Review this plan with your team
2. Get approval from your boss on the UX design
3. Begin Phase 1 component consolidation
4. Keep me posted on progress!

