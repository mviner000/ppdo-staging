// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/types/form.types.ts

import { z } from "zod";

/**
 * Zod schema for breakdown form validation
 */
export const breakdownSchema = z.object({
  projectName: z.string().min(1, { message: "Project name is required." }),
  implementingOffice: z.string().min(1, { message: "Implementing office is required." }),
  projectTitle: z.string().optional(),
  allocatedBudget: z.number().min(0, { message: "Must be 0 or greater." }).optional(),
  obligatedBudget: z.number().min(0).optional(),
  budgetUtilized: z.number().min(0).optional(),
  utilizationRate: z.number().min(0).max(100).optional(),
  balance: z.number().optional(),
  dateStarted: z.number().optional(),
  targetDate: z.number().optional(),
  completionDate: z.number().optional(),
  projectAccomplishment: z.number().min(0).max(100).optional(),
  status: z.enum(["completed", "ongoing", "delayed"]).optional(),
  remarks: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  barangay: z.string().optional(),
  reportDate: z.number().optional(),
  batchId: z.string().optional(),
  fundSource: z.string().optional(),
});

/**
 * Inferred TypeScript type from Zod schema
 */
export type BreakdownFormValues = z.infer<typeof breakdownSchema>;

/**
 * Props for BreakdownForm component
 */
export interface BreakdownFormProps {
  breakdown?: BreakdownFormData | null;
  onSave: (breakdown: Omit<BreakdownFormData, "_id">) => void;
  onCancel: () => void;
  defaultProjectName?: string;
  defaultImplementingOffice?: string;
  projectId?: string;
}

/**
 * Form data structure (matches Breakdown interface)
 */
export interface BreakdownFormData {
  _id: string;
  projectName: string;
  implementingOffice: string;
  projectId?: string;
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

/**
 * Budget warning state
 */
export interface BudgetWarning {
  show: boolean;
  message: string;
  allocatedTotal: number;
  parentBudget: number;
  difference: number;
}

/**
 * Budget allocation status
 */
export interface BudgetAllocationStatus {
  available: number;
  isExceeded: boolean;
  difference: number;
  parentTotal: number;
  siblingTotal: number;
  allocatedTotal: number;
  siblingCount: number;
  siblings: any[];
  isLoading: boolean;
  noProjectId: boolean;
}