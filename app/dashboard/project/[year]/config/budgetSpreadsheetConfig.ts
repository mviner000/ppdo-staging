// app/dashboard/project/budget/config/budgetSpreadsheetConfig.ts

import { SpreadsheetConfig, ColumnDefinition } from "@/components/spreadsheet/types";
import { api } from "@/convex/_generated/api";

// Define column definitions with proper types
const BUDGET_COLUMNS: ColumnDefinition[] = [
  { key: "particular", label: "Particular", type: "text", align: "left" },
  { key: "year", label: "Year", type: "number", align: "center" },
  { key: "status", label: "Status", type: "text", align: "center" },
  { key: "totalBudgetAllocated", label: "Total Budget Allocated", type: "currency", align: "right" },
  { key: "obligatedBudget", label: "Obligated Budget", type: "currency", align: "right" },
  { key: "totalBudgetUtilized", label: "Total Budget Utilized", type: "currency", align: "right" },
  { key: "utilizationRate", label: "Utilization Rate", type: "percentage", align: "right" },
  { key: "projectCompleted", label: "Projects Completed", type: "number", align: "center" },
  { key: "projectDelayed", label: "Projects Delayed", type: "number", align: "center" },
  { key: "projectsOnTrack", label: "Projects On Track", type: "number", align: "center" },
];

export const BUDGET_SPREADSHEET_CONFIG: SpreadsheetConfig = {
  tableName: "budgetItems",
  fetchQuery: api.budgetItems.list,
  columns: BUDGET_COLUMNS,
  features: {
    enableExport: true,
    enablePrint: true,
    enableShare: false,
    showTotalsRow: true,
    showTotalsColumn: true,
    viewMode: "viewer", // ✅ Added: Required property for SpreadsheetFeatures
  },
  title: "Budget Tracking",
  accentColor: "#3b82f6",
};