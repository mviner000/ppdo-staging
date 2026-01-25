// app/dashboard/project/[year]/components/form/AllocatedBudgetField.tsx

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
import { BudgetItemFormValues } from "./utils/formValidation";
import { formatNumberWithCommas, parseFormattedNumber, formatNumberForDisplay } from "./utils/formHelpers";

interface AllocatedBudgetFieldProps {
  form: UseFormReturn<BudgetItemFormValues>;
  displayValue: string;
  setDisplayValue: (value: string) => void;
}

export function AllocatedBudgetField({ 
  form, 
  displayValue, 
  setDisplayValue 
}: AllocatedBudgetFieldProps) {
  return (
    <FormField
      name="totalBudgetAllocated"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Total Budget Allocated
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                ₱
              </span>
              <Input
                placeholder="0"
                className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 pl-8"
                value={displayValue}
                onChange={(e) => {
                  const value = e.target.value;
                  const formatted = formatNumberWithCommas(value);
                  setDisplayValue(formatted);
                  const numericValue = parseFormattedNumber(formatted);
                  field.onChange(numericValue);
                }}
                onBlur={() => {
                  const numericValue = parseFormattedNumber(displayValue);
                  if (numericValue > 0) {
                    setDisplayValue(formatNumberForDisplay(numericValue));
                  } else {
                    setDisplayValue("");
                  }
                  field.onChange(numericValue);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}