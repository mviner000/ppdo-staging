// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/RemarksField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { BreakdownFormValues } from "./utils/formValidation";

interface RemarksFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function RemarksField({ form }: RemarksFieldProps) {
  return (
    <FormField
      control={form.control}
      name="remarks"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300 text-xs">
            Remarks
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={field.value || ""}
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
              rows={2}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}