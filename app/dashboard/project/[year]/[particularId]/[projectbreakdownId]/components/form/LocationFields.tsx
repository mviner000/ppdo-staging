// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/LocationFields.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BreakdownFormValues } from "./utils/formValidation";

interface LocationFieldsProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function LocationFields({ form }: LocationFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="district"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
              District
            </FormLabel>
            <Input 
              {...field} 
              value={field.value || ""} 
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="municipality"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
              Municipality
            </FormLabel>
            <Input 
              {...field} 
              value={field.value || ""} 
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="barangay"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
              Barangay
            </FormLabel>
            <Input 
              {...field} 
              value={field.value || ""} 
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </FormItem>
        )}
      />
    </div>
  );
}