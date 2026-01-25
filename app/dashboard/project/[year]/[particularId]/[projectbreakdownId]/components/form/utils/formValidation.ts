// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/utils/formValidation.ts

import { z } from "zod";

/**
 * Breakdown form validation schema
 * Matches existing validation rules from types/form.types.ts
 */
export const breakdownSchema = z.object({
  projectName: z.string().optional(),
  implementingOffice: z.string().min(1, { message: "Implementing office is required." }),
  projectTitle: z.string().optional(),
  allocatedBudget: z.number().min(0).optional(),
  obligatedBudget: z.number().min(0).optional(),
  budgetUtilized: z.number().min(0).optional(),
  utilizationRate: z.number().min(0).max(100).optional(),
  balance: z.number().optional(),
  dateStarted: z.number().optional(),
  targetDate: z.number().optional(),
  completionDate: z.number().optional(),
  projectAccomplishment: z.number().min(0).max(100).optional(),
  status: z.enum(["ongoing", "completed", "delayed"]).optional(),
  remarks: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  barangay: z.string().optional(),
  reportDate: z.number().optional(),
  batchId: z.string().optional(),
  fundSource: z.string().optional(),
});

/**
 * Inferred TypeScript type from schema
 */
export type BreakdownFormValues = z.infer<typeof breakdownSchema>;