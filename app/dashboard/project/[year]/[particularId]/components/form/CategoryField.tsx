// app/dashboard/project/[year]/[particularId]/components/form/CategoryField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import { Id } from "@/convex/_generated/dataModel";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProjectCategoryCombobox } from "../ProjectCategoryCombobox";
import { ProjectFormValues } from "./utils/formValidation";

interface CategoryFieldProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function CategoryField({ form }: CategoryFieldProps) {
  return (
    <FormField
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Project Category <span className="text-xs text-zinc-500">(Optional)</span>
          </FormLabel>
          <FormControl>
            <ProjectCategoryCombobox
              value={field.value as Id<"projectCategories"> | undefined}
              onChange={(value) => field.onChange(value || undefined)}
              disabled={false}
              error={form.formState.errors.categoryId?.message}
            />
          </FormControl>
          <FormDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
            Categorize your project for better organization and reporting
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}