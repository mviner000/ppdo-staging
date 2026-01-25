// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/ProjectTitleField.tsx

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
import { BreakdownFormValues } from "./utils/formValidation";

interface ProjectTitleFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function ProjectTitleField({ form }: ProjectTitleFieldProps) {
  return (
    <FormField
      control={form.control}
      name="projectTitle"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Project Title
          </FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Multi-Purpose Building..."
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
