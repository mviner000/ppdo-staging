// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/constants/table.constants.ts

import { ColumnConfig } from "../types/breakdown.types";

export const TABLE_IDENTIFIER = "govtProjectBreakdowns";

// 🆕 UPDATED: Compact row height
export const DEFAULT_ROW_HEIGHT = 42; // Changed from 48

// 🆕 UPDATED: Minimum heights for resizing
export const MIN_COLUMN_WIDTH = 80;
export const MIN_ROW_HEIGHT = 28; // Changed from 32

export const TABLE_HEIGHT = "700px";

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { 
    key: "projectTitle", 
    label: "Project Name", 
    width: 200, // Reduced from 260
    type: "text", 
    align: "left" 
  },
  { 
    key: "implementingOffice", 
    label: "Implementing Office", 
    width: 160, // Reduced from 180
    type: "text", 
    align: "left" 
  },
  { 
    key: "allocatedBudget", 
    label: "Allocated Budget", 
    width: 120, // Reduced from 140
    type: "currency", 
    align: "right" 
  },
  { 
    key: "obligatedBudget", 
    label: "Obligated Budget", 
    width: 120, // Reduced from 140
    type: "currency", 
    align: "right" 
  },
  { 
    key: "budgetUtilized", 
    label: "Budget Utilized", 
    width: 120, // Reduced from 140
    type: "currency", 
    align: "right" 
  },
  { 
    key: "utilizationRate", 
    label: "Utilization Rate", 
    width: 100, // Reduced from 140
    type: "number", 
    align: "right" 
  },
  { 
    key: "balance", 
    label: "Balance", 
    width: 120, // Reduced from 140
    type: "currency", 
    align: "right" 
  },
  { 
    key: "dateStarted", 
    label: "Date Started", 
    width: 110, // Reduced from 130
    type: "date", 
    align: "left" 
  },
  { 
    key: "targetDate", 
    label: "Target Date", 
    width: 110, // Reduced from 130
    type: "date", 
    align: "left" 
  },
  { 
    key: "completionDate", 
    label: "Completion Date", 
    width: 110, // Reduced from 130
    type: "date", 
    align: "left" 
  },
  { 
    key: "projectAccomplishment", 
    label: "Accomplishment %", // Shortened
    width: 80, // Reduced from 90
    type: "number", 
    align: "right" 
  },
  { 
    key: "status", 
    label: "Status", 
    width: 100, // Reduced from 130
    type: "status", 
    align: "center" 
  },
  { 
    key: "remarks", 
    label: "Remarks", 
    width: 180, // Reduced from 220
    type: "text", 
    align: "left" 
  },
];

export const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
};

export const LOCALE = "en-PH";