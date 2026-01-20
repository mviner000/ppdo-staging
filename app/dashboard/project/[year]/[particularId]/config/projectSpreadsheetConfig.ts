// app/dashboard/project/budget/[particularId]/config/projectSpreadsheetConfig.ts

import { SpreadsheetConfig, ColumnDefinition } from "@/components/spreadsheet/types";
import { api } from "@/convex/_generated/api";

// Define column definitions with proper types for projects
const PROJECT_COLUMNS: ColumnDefinition[] = [
  { key: "particulars", label: "Particulars", type: "text", align: "left" },
  { key: "implementingOffice", label: "Implementing Office", type: "text", align: "left" },
  { key: "year", label: "Year", type: "number", align: "center" },
  { key: "status", label: "Status", type: "text", align: "center" },
  { key: "totalBudgetAllocated", label: "Budget Allocated", type: "currency", align: "right" },
  { key: "obligatedBudget", label: "Obligated Budget", type: "currency", align: "right" },
  { key: "totalBudgetUtilized", label: "Budget Utilized", type: "currency", align: "right" },
  { key: "utilizationRate", label: "Utilization Rate", type: "percentage", align: "right" },
  { key: "projectCompleted", label: "Completed", type: "number", align: "right" },
  { key: "projectDelayed", label: "Delayed", type: "number", align: "right" },
  { key: "projectsOngoing", label: "Ongoing", type: "number", align: "right" },
];

export const createProjectSpreadsheetConfig = (
  budgetItemId: string,
  particular: string
): SpreadsheetConfig => ({
  tableName: "projects",
  fetchQuery: api.projects.list,
  columns: PROJECT_COLUMNS,
  features: {
    enableExport: true,
    enablePrint: true,
    enableShare: false,
    showTotalsRow: true,
    showTotalsColumn: true,
    viewMode: "viewer", // ✅ ADDED: Set to "viewer" for read-only or "editor" for editable
  },
  title: `Projects - ${particular}`,
  accentColor: "#3b82f6",
  filters: { budgetItemId },
});