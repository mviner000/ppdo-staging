// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/BasicInfoSection.tsx

"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BreakdownFormValues } from "../../types/form.types";
import { ImplementingOfficeSelector } from "../ImplementingOfficeSelector";

interface BasicInfoSectionProps {
  control: Control<BreakdownFormValues>;
  accentColor: string;
}

export function BasicInfoSection({ control, accentColor }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Basic Information
        </h3>
      </div>

      <FormField
        control={control}
        name="projectTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300">
              Project Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Multi-Purpose Building..."
                className="bg-white dark:bg-zinc-900"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="implementingOffice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300">
              Implementing Office <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <ImplementingOfficeSelector
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}