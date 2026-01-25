// app/dashboard/project/[year]/[particularId]/components/form/YearField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProjectFormValues } from "./utils/formValidation";

interface YearFieldProps {
  form: UseFormReturn<ProjectFormValues>;
  urlYear?: number;
}

export function YearField({ form, urlYear }: YearFieldProps) {
  return (
    <FormField
      name="year"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Year {urlYear && <span className="text-xs text-blue-500">(Auto-filled)</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="e.g. 2024"
              min="2000"
              max="2100"
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                const value = e.target.value.trim();
                field.onChange(value ? parseInt(value) : undefined);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}