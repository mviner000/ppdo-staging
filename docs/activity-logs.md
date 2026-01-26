# Activity Logs: Technical Architecture & Implementation (Refactor Branch)

This document provides a meticulous, in-depth analysis of the **Activity Logs** ecosystem within the PPDO project, specifically reflecting the architecture in the `refactor-project-breakdownv1` branch.

---

## 🏗️ System Overview

The Activity Logs system tracks all critical operations across seven major domains. The architecture in this branch introduces a **Uniform Breakdown Framework**, centralizing financial and audit logic for all breakdown-style entities.

### 📋 Tracked Domains
| Domain | Table / Logger | Framework | Purpose |
| :--- | :--- | :--- | :--- |
| **Projects** | `projectActivities` | Snapshot + Diff | Main project lifecycle auditing. |
| **Budgets** | `budgetItemActivities` | Snapshot + Diff | Budget item and FY allocation audit. |
| **Gov't Projects** | `govtProjectBreakdownActivities` | **BreakdownBase** | Detailed govt project breakdowns. |
| **Trust Funds** | `trustFundActivities` | Snapshot + Diff | Main trust fund financial audit. |
| **TF Breakdowns** | `trustFundBreakdownActivities` | **BreakdownBase** | Specialized trust fund breakdowns. |
| **SEF (Education)** | `specialEducationFundActivities` | Snapshot + Diff | Special Education Fund auditing. |
| **SEF Breakdowns** | `specialEducationFundBreakdownActivities` | **BreakdownBase** | SEF specific project breakdowns. |
| **SHF (Health)** | `specialHealthFundActivities` | Snapshot + Diff | Special Health Fund auditing. |
| **SHF Breakdowns** | `specialHealthFundBreakdownActivities` | **BreakdownBase** | SHF specific project breakdowns. |

---

## 🔙 Backend Architecture (Convex)

The refactored backend emphasizes **DRY (Don't Repeat Yourself)** principles and **Historical Integrity**.

### 1. The Uniform Breakdown Framework (`breakdownBase.ts`)
This shared library provides the engine for all breakdown-style activity logs. It handles:
- **Recursive Diffing**: Identifying exactly which fields changed between states.
- **Smart Summaries**: Automatically flagging budget shifts, status transitions, and location updates.
- **Financial Calculation Validation**: Ensures `balance` and `utilizationRate` snapshots in the logs match the calculated state at the time of the action.

### 2. Specialized Loggers
Each fund type has a dedicated logger (e.g., `specialEducationFundActivityLogger.ts`) that implements a standard interface:
- **`logActivity`**: Captures single record changes.
- **`logBulkActivity`**: Groups multiple changes (like Excel imports) under a single `batchId` for easier frontend auditing.

```typescript
// Standard Activity Structure across schemas
{
  action: "created" | "updated" | "deleted" | "bulk_created" | "restored",
  breakdownId: v.optional(v.id("...")),
  previousValues: v.optional(v.string()), // Complete JSON snapshot
  newValues: v.optional(v.string()),      // Complete JSON snapshot
  changeSummary: v.optional(v.object({ ... })), // Highlighted changes
  performedBy: v.id("users"),
  timestamp: v.number(),
  batchId: v.optional(v.string()),       // Link for bulk operations
}
```

---

## 🎨 Frontend Implementation

The frontend is designed to be polymorphic, rendering diverse log structures through a single interface.

### 1. Data Aggregation (`useActivityLogData.ts`)
This hook consumes a `type` discriminator and dynamically routes to the correct Convex query. In this branch, support has been expanded to includes queries for **SEF**, **SHF**, and their respective **Breakdown** activities.

### 2. Rendering Engine (`ActivityLogCard.tsx`)
The UI uses **Selective Tracking** via the `trackedFieldsByType` constant. This ensures that only relevant business fields (e.g., `received`, `utilized`, `allocatedBudget`) are displayed in the "From → To" diff view, hiding technical timestamps or internal IDs.

**Key Rendering Logic:**
- **Financial Auto-Detection**: Fields containing "Budget", "Allocated", "Received", or "Utilized" are automatically formatted as **Philippine Peso (PHP)**.
- **Narrative Building**: The card dynamically adjusts its header based on the entity type (e.g., *"Processed trust fund XYZ"* vs *"Processed breakdown for ABC"*).

---

## 🔄 Lifecycle of an Audit Entry

1.  **Intercept**: A mutation (e.g., `updateBreakdown`) is triggered.
2.  **Snapshot**: The system captures the state *before* any changes are applied.
3.  **Process**: The update is executed, and `breakdownBase.ts` calculates the new financials.
4.  **Log**: The specialized logger is called. It uses `calculateChangedFields` to generate a diff.
5.  **Persist**: A new activity record is created, capturing the user's name, role, and department *at that specific moment*.
6.  **Reflect**: The `ActivityLogSheet` updates in real-time, grouping the new entry under the current month.

---

> [!IMPORTANT]
> **Refactor Note**: By using `breakdownBase.ts`, the system ensures that adding a new fund type (e.g., a "Tourism Fund") only requires a few lines of boilerplate schema and a new logger file, as 90% of the audit logic is now shared.

> [!TIP]
> **Audit Power**: The `batchId` field allows administrators to see all records changed in a single Excel import or bulk edit operation, providing a "Mass Action" audit view.
