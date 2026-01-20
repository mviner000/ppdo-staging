// app/dashboard/project/budget/[particularId]/types.ts

import { Id } from "@/convex/_generated/dataModel";
import { SortState, ContextMenuState } from "@/lib/shared/types/table.types";

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: string;
  particulars: string;
  implementingOffice: string;
  categoryId?: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOngoing: number;
  remarks?: string;
  year?: number;
  status?: "completed" | "ongoing" | "delayed";
  targetDateCompletion?: number;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  budgetItemId?: string;
  projectManagerId?: string;
  _creationTime?: number;
  autoCalculateBudgetUtilized?: boolean; // 🆕 NEW: Auto-calculate toggle
}

// 🆕 SIMPLIFIED: Explicit interface instead of complex Omit type
export interface ProjectFormData {
  particulars: string;
  implementingOffice: string;
  categoryId?: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  remarks?: string;
  year?: number;
  targetDateCompletion?: number;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  budgetItemId?: string;
  projectManagerId?: string;
  _creationTime?: number;
  autoCalculateBudgetUtilized?: boolean; // 🆕 NEW: Auto-calculate toggle
}

// ============================================================================
// SORTING & FILTERING TYPES (using shared types)
// ============================================================================

export type ProjectSortField = keyof Project;

// Use shared SortState
export type ProjectSortState = SortState<ProjectSortField>;

// Use shared ContextMenuState
export type ProjectContextMenuState = ContextMenuState<Project>;

// Legacy support - remove in future
export type SortDirection = "asc" | "desc" | null;

export interface ProjectFilterState {
  searchQuery: string;
  statusFilter: string[];
  officeFilter: string[];
  yearFilter: number[];
  sortField: ProjectSortField | null;
  sortDirection: SortDirection;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface ProjectCategory {
  _id: Id<"projectCategories">;
  code: string;
  fullName: string;
  description?: string;
  colorCode?: string;
  iconName?: string;
  displayOrder?: number;
  isSystemDefault?: boolean;
  usageCount?: number;
}

export interface GroupedProjects {
  category: ProjectCategory | null;
  projects: Project[];
}

// ============================================================================
// TABLE COLUMN TYPES
// ============================================================================

export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  align?: "left" | "center" | "right";
}

// ============================================================================
// TOTALS TYPES
// ============================================================================

export interface ProjectTotals {
  totalBudgetAllocated: number;
  obligatedBudget: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOngoing: number;
}

// ============================================================================
// BULK OPERATION RESPONSE TYPES
// ============================================================================

export interface BulkOperationResponse {
  success: boolean;
  message?: string;
  data?: {
    processed?: number;
    failed?: number;
    details?: Record<string, any>;
  };
  error?: {
    message: string;
    code?: string;
  };
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ProjectsTableProps {
  projects: Project[];
  particularId: string;
  budgetItemId?: string;
  budgetItemYear?: number;
  onAdd?: (project: ProjectFormData) => void | Promise<void>; // 🆕 SIMPLIFIED
  onEdit?: (id: string, project: ProjectFormData) => void; // 🆕 SIMPLIFIED
  onDelete?: (id: string) => void;
  onOpenTrash?: () => void;
  newlyAddedProjectId?: string | null;
  expandButton?: React.ReactNode;
}