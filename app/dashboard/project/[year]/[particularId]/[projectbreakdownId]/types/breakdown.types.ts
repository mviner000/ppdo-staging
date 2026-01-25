// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/types/breakdown.types.ts

import { Id } from "@/convex/_generated/dataModel";

export interface Breakdown {
  _id: Id<"govtProjectBreakdowns"> | Id<"trustFundBreakdowns">;
  _creationTime: number;
  projectName: string;
  implementingOffice: string;
  projectId?: Id<"projects">;
  trustFundId?: Id<"trustFunds">;
  projectTitle?: string;
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
  utilizationRate?: number;
  balance?: number;
  dateStarted?: number;
  targetDate?: number;
  completionDate?: number;
  projectAccomplishment?: number;
  status?: "completed" | "ongoing" | "delayed";
  remarks?: string;
  district?: string;
  municipality?: string;
  barangay?: string;
  reportDate?: number;
  batchId?: string;
  fundSource?: string;
}

export type ColumnType = "text" | "number" | "date" | "status" | "currency";
export type ColumnAlign = "left" | "right" | "center";

export interface ColumnConfig {
  key: keyof Breakdown;
  label: string;
  width: number;
  type: ColumnType;
  align: ColumnAlign;
}

export interface BreakdownHistoryTableProps {
  breakdowns: Breakdown[];
  onPrint: () => void;
  onAdd?: () => void;
  onEdit?: (breakdown: Breakdown) => void;
  onDelete?: (id: string) => void;
  onOpenTrash?: () => void;
}

export interface RowHeights {
  [rowId: string]: number;
}

export interface ColumnTotals {
  [key: string]: number;
}

export interface TableSettings {
  tableIdentifier: string;
  columns: Array<{
    fieldKey: string;
    width: number;
    isVisible: boolean;
  }>;
  customRowHeights?: string;
}