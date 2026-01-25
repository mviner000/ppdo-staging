// app/dashboard/project/[year]/[particularId]/components/form/RemarksField.tsx

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
import { ProjectFormValues } from "./utils/formValidation";

interface RemarksFieldProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function RemarksField({ form }: RemarksFieldProps) {
  return (
    <FormField
      name="remarks"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Remarks <span className="text-xs text-zinc-500">(Optional)</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add any additional notes or comments..."
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
              rows={3}
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