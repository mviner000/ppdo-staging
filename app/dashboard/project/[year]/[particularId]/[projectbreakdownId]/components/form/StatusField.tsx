// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/StatusField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreakdownFormValues } from "./utils/formValidation";

interface StatusFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function StatusField({ form }: StatusFieldProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Status
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}