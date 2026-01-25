// app/dashboard/project/[year]/components/form/YearField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BudgetItemFormValues } from "./utils/formValidation";

interface YearFieldProps {
  form: UseFormReturn<BudgetItemFormValues>;
  isYearAutoFilled: boolean;
}

export function YearField({ form, isYearAutoFilled }: YearFieldProps) {
  return (
    <FormField
      name="year"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Year {isYearAutoFilled && <span className="text-xs text-blue-500">(Auto-filled from URL)</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="e.g. 2024"
              min="2000"
              max="2100"
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              disabled={isYearAutoFilled}
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                const value = e.target.value.trim();
                field.onChange(value ? parseInt(value) : undefined);
              }}
            />
          </FormControl>
          {isYearAutoFilled && (
            <FormDescription className="text-zinc-500 dark:text-zinc-400">
              Year is automatically set based on the current page URL and cannot be changed.
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}