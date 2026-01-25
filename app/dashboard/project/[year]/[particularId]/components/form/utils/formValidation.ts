// app/dashboard/project/[year]/[particularId]/components/form/utils/formValidation.ts

import { z } from "zod";

const particularCodeString = z
  .string()
  .min(1, { message: "This field is required." })
  .refine((val) => val.trim().length > 0, {
    message: "Cannot be empty or only whitespace.",
  })
  .refine((val) => /^[\p{L}0-9_%\s,.\-@]+$/u.test(val), {
    message: "Only letters (including accents), numbers, underscores, percentage signs, spaces, commas, periods, hyphens, and @ are allowed.",
  })
  .transform((val) => val.trim());

export const projectSchema = z
  .object({
    particulars: particularCodeString,
    implementingOffice: z.string().min(1, { message: "Implementing office is required." }),
    categoryId: z.string().optional(),
    totalBudgetAllocated: z.number().min(0, { message: "Must be 0 or greater." }),
    obligatedBudget: z.number().min(0).optional().or(z.literal(0)),
    totalBudgetUtilized: z.number().min(0),
    remarks: z.string().optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    autoCalculateBudgetUtilized: z.boolean().optional(),
  })
  .refine(
    (data) => !data.obligatedBudget || data.obligatedBudget <= data.totalBudgetAllocated,
    {
      message: "Obligated budget cannot exceed allocated budget.",
      path: ["obligatedBudget"],
    }
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;