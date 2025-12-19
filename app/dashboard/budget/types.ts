// app/dashboard/budget/types.ts

// ===== SHARED STATUS TYPE =====

/**
 * STRICT 3-STATUS SYSTEM used across entire application
 * MUST match backend schema exactly
 */
export type ProjectStatus = "completed" | "ongoing" | "delayed";

// ===== BUDGET ITEM TYPES =====

/**
 * Frontend BudgetItem interface
 * NOTE: projectCompleted, projectDelayed, projectsOnTrack are READ-ONLY
 * They are calculated automatically from child project statuses
 */
export interface BudgetItem {
  id: string;
  particular: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  
  // 🔒 READ-ONLY: Calculated from child projects
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  
  year?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  notes?: string;
}

/**
 * BudgetItem data when creating/updating
 * EXCLUDES the calculated project count fields
 */
export interface BudgetItemFormData {
  particular: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  year?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  notes?: string;
  departmentId?: string;
  fiscalYear?: number;
}

/**
 * BudgetItem as stored in Convex database
 */
export interface BudgetItemFromDB {
  _id: string;
  _creationTime: number;
  particulars: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  
  // Calculated fields
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  
  notes?: string;
  year?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  departmentId?: string;
  fiscalYear?: number;
  
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
}

// ===== PROJECT TYPES =====

/**
 * Frontend Project interface
 */
export interface Project {
  id: string;
  particulars: string;
  budgetItemId?: string;
  implementingOffice: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  
  // 🔒 READ-ONLY: Auto-calculated from govtProjectBreakdowns
  projectCompleted: number;
  projectDelayed: number;
  projectsOngoing: number; // Frontend term for projectsOnTrack
  
  remarks?: string;
  year?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  targetDateCompletion?: number;
  projectManagerId?: string;
  
  // Pin fields
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
}

/**
 * Project data when creating/updating
 * ⚠️ EXCLUDES projectCompleted, projectDelayed, projectsOngoing
 * These are auto-calculated from govtProjectBreakdowns
 */
export interface ProjectFormData {
  particulars: string;
  budgetItemId?: string;
  implementingOffice: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  remarks?: string;
  year?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  targetDateCompletion?: number;
  projectManagerId?: string;
}

/**
 * Project as stored in Convex database
 */
export interface ProjectFromDB {
  _id: string;
  _creationTime: number;
  particulars: string;
  budgetItemId?: string;
  implementingOffice: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  remarks?: string;
  year?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  targetDateCompletion?: number;
  projectManagerId?: string;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
}

// ===== GOVERNMENT PROJECT BREAKDOWN TYPES =====

/**
 * Government Project Breakdown interface
 */
export interface GovtProjectBreakdown {
  id: string;
  projectName: string;
  implementingOffice: string;
  projectId?: string; // Parent project link
  municipality?: string;
  barangay?: string;
  district?: string;
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
  balance?: number;
  status?: ProjectStatus; // ✅ FIXED: Uses strict 3-status
  dateStarted?: number;
  targetDate?: number;
  completionDate?: number;
  remarks?: string;
  projectTitle?: string;
  utilizationRate?: number;
  projectAccomplishment?: number;
  reportDate?: number;
  batchId?: string;
  fundSource?: string;
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  updatedBy?: string;
}

// ===== UTILITY TYPES =====

export type SortDirection = "asc" | "desc" | null;
export type SortField = keyof BudgetItem | null;

export interface ColumnFilter {
  field: keyof BudgetItem;
  value: any;
}

// ===== CONSTANTS =====

export const BUDGET_PARTICULARS = [
  "GAD",
  "LDRRMP",
  "LCCAP",
  "LCPC",
  "SCPD",
  "POPS",
  "CAIDS",
  "LNP",
  "PID",
  "ACDP",
  "LYDP",
  "20%_DF",
] as const;

export type BudgetParticular = (typeof BUDGET_PARTICULARS)[number];

export const PARTICULAR_FULL_NAMES: Record<BudgetParticular, string> = {
  GAD: "GENDER AND DEVELOPMENT",
  LDRRMP: "LOCAL DISASTER RISK REDUCTION AND MANAGEMENT PLAN",
  LCCAP: "LOCAL CLIMATE CHANGE ACTION PLAN",
  LCPC: "LOCAL COUNCIL FOR THE PROTECTION OF CHILDREN",
  SCPD: "SUSTAINABLE COMMUNITY PLANNING AND DEVELOPMENT",
  POPS: "PROVINCIAL OPERATIONS AND PLANNING SERVICES",
  CAIDS: "CLIMATE CHANGE ADAPTATION AND INTEGRATED DISASTER SERVICES",
  LNP: "LOCAL NUTRITION PROGRAM",
  PID: "PROVINCIAL INTEGRATED DEVELOPMENT",
  ACDP: "AGRICULTURAL AND COMMUNITY DEVELOPMENT PROGRAM",
  LYDP: "LOCAL YOUTH DEVELOPMENT PROGRAM",
  "20%_DF": "20% DEVELOPMENT FUND",
};

// ===== STATUS DISPLAY HELPERS =====

/**
 * Helper to get display text for status
 */
export function getStatusDisplayText(status: ProjectStatus): string {
  const mapping: Record<ProjectStatus, string> = {
    completed: "Completed",
    ongoing: "Ongoing",
    delayed: "Delayed",
  };
  return mapping[status];
}

/**
 * Helper to get color class for status
 */
export function getStatusColorClass(status: ProjectStatus): string {
  const mapping: Record<ProjectStatus, string> = {
    completed: "text-green-600 dark:text-green-400",
    ongoing: "text-blue-600 dark:text-blue-400",
    delayed: "text-red-600 dark:text-red-400",
  };
  return mapping[status];
}

// ===== FINANCIAL BREAKDOWN =====

export interface FinancialBreakdownItem {
  id: string;
  code?: string;
  description: string;
  appropriation: number;
  obligation: number;
  balance: number;
  level: number;
  children?: FinancialBreakdownItem[];
}

// ===== REMARKS =====

export interface Remark {
  id: string;
  projectId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  authorRole?: string;
}