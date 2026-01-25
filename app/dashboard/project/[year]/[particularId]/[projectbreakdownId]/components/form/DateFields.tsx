// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/DateFields.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BreakdownFormValues } from "./utils/formValidation";
import { timestampToDate, dateToTimestamp } from "./utils/formHelpers";

interface DateFieldsProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function DateFields({ form }: DateFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="dateStarted"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
              Date Started
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                value={timestampToDate(field.value)}
                onChange={(e) => field.onChange(dateToTimestamp(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="targetDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
              Target Date
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                value={timestampToDate(field.value)}
                onChange={(e) => field.onChange(dateToTimestamp(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="completionDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
              Completion Date
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                value={timestampToDate(field.value)}
                onChange={(e) => field.onChange(dateToTimestamp(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}