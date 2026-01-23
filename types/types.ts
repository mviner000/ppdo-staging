// types/types.ts

// ===== SHARED STATUS TYPE =====

/**
 * STRICT 3-STATUS SYSTEM used across entire application
 * MUST match backend schema exactly
 */
export type ProjectStatus = "completed" | "ongoing" | "delayed";

// ===== API RESPONSE TYPE (NEW) =====
/**
 * Standardized response structure from Backend Mutations
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ===== BUDGET ITEM TYPES =====

/**
 * Frontend BudgetItem interface
 * NOTE: projectCompleted, projectDelayed, projectsOnTrack are READ-ONLY
 */
export interface BudgetItem {
  id: string;
  particular: string; // ✅ Frontend uses 'particular'
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  
  // 🔒 READ-ONLY: Calculated from child projects
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  
  year?: number;
  status?: ProjectStatus;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  notes?: string;
}

export interface BudgetItemFormData {
  particular: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  year?: number;
  status?: ProjectStatus;
  notes?: string;
  departmentId?: string;
  fiscalYear?: number;
}

export interface BudgetItemFromDB {
  _id: string;
  _creationTime: number;
  particulars: string; // ✅ Database uses 'particulars'
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  notes?: string;
  year?: number;
  status?: ProjectStatus;
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

export interface Project {
  id: string;
  particulars: string;
  budgetItemId?: string;
  categoryId?: string;
  implementingOffice: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOngoing: number;
  remarks?: string;
  year?: number;
  status?: ProjectStatus;
  targetDateCompletion?: number;
  projectManagerId?: string;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
}

export interface ProjectFormData {
  particulars: string;
  budgetItemId?: string;
  categoryId?: string;
  implementingOffice: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  remarks?: string;
  year?: number;
  status?: ProjectStatus;
  targetDateCompletion?: number;
  projectManagerId?: string;
}

export interface ProjectFromDB {
  _id: string;
  _creationTime: number;
  particulars: string;
  budgetItemId?: string;
  categoryId?: string;
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
  status?: ProjectStatus;
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

export interface GovtProjectBreakdown {
  id: string;
  projectName: string;
  implementingOffice: string;
  projectId?: string;
  municipality?: string;
  barangay?: string;
  district?: string;
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
  balance?: number;
  status?: ProjectStatus;
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

// ✅ Allow string to prevent strict typing errors in sorting
export type SortDirection = "asc" | "desc" | null;
export type SortField = string | null; 

export interface ColumnFilter {
  field: string;
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

export const PARTICULAR_FULL_NAMES: Record<string, string> = {
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

export function getStatusDisplayText(status: ProjectStatus): string {
  const mapping: Record<ProjectStatus, string> = {
    completed: "Completed",
    ongoing: "Ongoing",
    delayed: "Delayed",
  };
  return mapping[status] || "Ongoing";
}

export function getStatusColorClass(status: ProjectStatus): string {
  const mapping: Record<ProjectStatus, string> = {
    completed: "text-green-600 dark:text-green-400",
    ongoing: "text-blue-600 dark:text-blue-400",
    delayed: "text-red-600 dark:text-red-400",
  };
  return mapping[status] || "text-zinc-600 dark:text-zinc-400";
}

export function calculateAggregateStatus<T extends { status?: ProjectStatus }>(
  items: T[]
): ProjectStatus {
  if (items.length === 0) return "ongoing";
  
  let hasOngoing = false;
  let hasDelayed = false;
  let hasCompleted = false;
  
  for (const item of items) {
    const status = item.status;
    if (status === "ongoing") hasOngoing = true;
    else if (status === "delayed") hasDelayed = true;
    else if (status === "completed") hasCompleted = true;
  }
  
  if (hasOngoing) return "ongoing";
  if (hasDelayed) return "delayed";
  if (hasCompleted) return "completed";
  
  return "ongoing";
}

// ===== FINANCIAL BREAKDOWN (LEGACY) =====

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

// ===== REMARKS (LEGACY - RESTORED) =====

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