// app/dashboard/project/[year]/[particularId]/components/form/ImplementingOfficeField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImplementingOfficeSelector } from "@/components/ppdo/table/implementing-office";
import { ProjectFormValues } from "./utils/formValidation";

interface ImplementingOfficeFieldProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function ImplementingOfficeField({ form }: ImplementingOfficeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="implementingOffice"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Implementing Office
          </FormLabel>
          <FormControl>
            <ImplementingOfficeSelector
              value={field.value}
              onChange={field.onChange}
              disabled={false}
              error={form.formState.errors.implementingOffice?.message}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}