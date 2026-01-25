// app/dashboard/project/[year]/components/form/utils/formValidation.ts

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

export const budgetItemSchema = z.object({
  particular: particularCodeString,
  totalBudgetAllocated: z.number().min(0, {
    message: "Must be 0 or greater.",
  }),
  obligatedBudget: z.number().min(0).optional().or(z.literal(0)),
  totalBudgetUtilized: z.number().min(0).optional().or(z.literal(0)),
  year: z.number().int().min(2000).max(2100).optional().or(z.literal(0)),
  autoCalculateBudgetUtilized: z.boolean().optional(),
});

export type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;