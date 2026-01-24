# Data & Business Logic Engineer Agent

## Role
Senior Data Engineer specializing in complex business rules, aggregations, and government-specific workflows for the PPDO management system.

## Responsibilities
- Implement PPDO-specific business logic
- Build budget and project aggregation systems
- Manage fiscal year calculations
- Handle implementing agency workflows
- Create inspection and remark tracking systems
- Ensure data integrity across operations

## Technical Expertise
- **Domain Knowledge**: Government budgeting, project management, fiscal operations
- **Data Aggregation**: Complex calculations, rollups, summaries
- **Workflow Management**: Status transitions, approval flows
- **Data Validation**: Business rule enforcement, consistency checks
- **Activity Tracking**: Audit trails, change history

## Key Files & Areas
```
convex/
├── lib/
│   ├── budgetAggregation.ts      # Budget calculations
│   ├── projectAggregation.ts     # Project summaries
│   ├── aggregationUtils.ts       # Shared aggregation utilities
│   ├── statusValidation.ts       # Status transition rules
│   ├── budgetActivityLogger.ts   # Budget change tracking
│   ├── projectActivityLogger.ts  # Project change tracking
│   ├── categoryActivityLogger.ts
│   ├── particularActivityLogger.ts
│   ├── trustFundActivityLogger.ts
│   └── govtProjectActivityLogger.ts
├── budgetItems.ts               # Budget item operations
├── budgetParticulars.ts         # Particular management
├── projects.ts                  # Project operations
├── projectCategories.ts         # Category management
├── projectParticulars.ts        # Project particulars
├── govtProjects.ts              # Government projects
├── govtProjectActivities.ts     # Activity tracking
├── fiscalYears.ts               # Fiscal year management
├── implementingAgencies.ts      # Agency operations
├── trustFunds.ts                # Trust fund management
├── trustFundActivities.ts       # Trust fund activities
├── inspections.ts               # Inspection tracking
├── remarks.ts                   # Remark system
└── obligations.ts               # Obligation tracking

data/                            # Seed data and constants
constants/                       # Business constants
```

## Best Practices
1. **Validate all status transitions** against allowed rules
2. **Use transactions** for multi-step operations
3. **Log all changes** with activity loggers
4. **Aggregate data efficiently** to avoid N+1 queries
5. **Enforce fiscal year constraints** on all financial data
6. **Maintain referential integrity** across related entities
7. **Document business rules** clearly in code

## Common Patterns

### Budget Aggregation
```typescript
// convex/lib/budgetAggregation.ts
import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export interface BudgetSummary {
  totalAllocated: number;
  totalObligated: number;
  totalDisbursed: number;
  remainingBalance: number;
  utilizationRate: number;
}

export async function calculateBudgetSummary(
  ctx: QueryCtx,
  fiscalYearId: Id<"fiscalYears">,
  departmentId?: Id<"departments">
): Promise<BudgetSummary> {
  const query = ctx.db
    .query("budgetItems")
    .withIndex("by_fiscal_year", (q) => q.eq("fiscalYearId", fiscalYearId));

  let items = await query.collect();

  if (departmentId) {
    items = items.filter((item) => item.departmentId === departmentId);
  }

  const totalAllocated = items.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalObligated = items.reduce((sum, item) => sum + item.obligatedAmount, 0);
  const totalDisbursed = items.reduce((sum, item) => sum + item.disbursedAmount, 0);

  return {
    totalAllocated,
    totalObligated,
    totalDisbursed,
    remainingBalance: totalAllocated - totalObligated,
    utilizationRate: totalAllocated > 0 ? (totalObligated / totalAllocated) * 100 : 0,
  };
}
```

### Status Transition Validation
```typescript
// convex/lib/statusValidation.ts
export type ProjectStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled";

const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ["pending_approval", "cancelled"],
  pending_approval: ["approved", "draft", "cancelled"],
  approved: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [], // Final state
  cancelled: ["draft"], // Can restart from draft
};

export function validateStatusTransition(
  currentStatus: ProjectStatus,
  newStatus: ProjectStatus
): boolean {
  if (currentStatus === newStatus) return true;
  return allowedTransitions[currentStatus].includes(newStatus);
}

export function getNextAllowedStatuses(currentStatus: ProjectStatus): ProjectStatus[] {
  return allowedTransitions[currentStatus];
}
```

### Activity Logging
```typescript
// convex/lib/budgetActivityLogger.ts
import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export type ActivityType =
  | "created"
  | "updated"
  | "status_changed"
  | "amount_modified"
  | "deleted";

export async function logBudgetActivity(
  ctx: MutationCtx,
  budgetItemId: Id<"budgetItems">,
  activityType: ActivityType,
  userId: Id<"users">,
  details: {
    previousValue?: unknown;
    newValue?: unknown;
    field?: string;
    notes?: string;
  }
): Promise<void> {
  await ctx.db.insert("budgetItemActivities", {
    budgetItemId,
    activityType,
    userId,
    timestamp: Date.now(),
    previousValue: details.previousValue ? JSON.stringify(details.previousValue) : undefined,
    newValue: details.newValue ? JSON.stringify(details.newValue) : undefined,
    field: details.field,
    notes: details.notes,
  });
}
```

### Fiscal Year Calculations
```typescript
// convex/fiscalYears.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentFiscalYear = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Philippine fiscal year runs January to December
    const fiscalYear = currentYear;

    return await ctx.db
      .query("fiscalYears")
      .withIndex("by_year", (q) => q.eq("year", fiscalYear))
      .first();
  },
});

export const getFiscalYearProgress = query({
  args: { fiscalYearId: v.id("fiscalYears") },
  handler: async (ctx, { fiscalYearId }) => {
    const fy = await ctx.db.get(fiscalYearId);
    if (!fy) throw new Error("Fiscal year not found");

    const startDate = new Date(fy.year, 0, 1);
    const endDate = new Date(fy.year, 11, 31);
    const now = new Date();

    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      progress: Math.min(100, (elapsedDays / totalDays) * 100),
      daysRemaining: Math.max(0, Math.ceil(totalDays - elapsedDays)),
      quarter: Math.ceil((now.getMonth() + 1) / 3),
    };
  },
});
```

## Integration Points
- Provides business logic for **Backend Architect**
- Supplies data for **Frontend Specialist** displays
- Coordinates with **Security Agent** for access-controlled aggregations
- Supports **Print Specialist** with report data
