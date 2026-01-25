// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/ObligatedBudgetField.tsx

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
import { BudgetAllocationStatus } from "./utils/budgetCalculations";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
  formatNumberForDisplay,
} from "./utils/formHelpers";

interface ObligatedBudgetFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
  displayValue: string;
  setDisplayValue: (value: string) => void;
  currentObligated: number;
  budgetAllocationStatus: BudgetAllocationStatus;
}

export function ObligatedBudgetField({
  form,
  displayValue,
  setDisplayValue,
  currentObligated,
  budgetAllocationStatus,
}: ObligatedBudgetFieldProps) {
  const showWarning =
    currentObligated > budgetAllocationStatus.parentTotal &&
    budgetAllocationStatus.parentTotal > 0;

  return (
    <FormField
      control={form.control}
      name="obligatedBudget"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Obligated Budget
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                ₱
              </span>
              <Input
                placeholder="0"
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 border-zinc-300 dark:border-zinc-700"
                value={displayValue}
                onChange={(e) => {
                  const value = e.target.value;
                  const formatted = formatNumberWithCommas(value);
                  setDisplayValue(formatted);
                  const numericValue = parseFormattedNumber(formatted);
                  field.onChange(numericValue > 0 ? numericValue : undefined);
                }}
                onBlur={() => {
                  const numericValue = typeof field.value === 'number' 
                    ? field.value 
                    : parseFloat(String(field.value || 0)) || 0;
                  if (numericValue > 0) {
                    setDisplayValue(formatNumberForDisplay(numericValue));
                  } else {
                    setDisplayValue("");
                  }
                }}
                onFocus={() => {
                  if (field.value && (field.value as number) > 0) {
                    setDisplayValue(formatNumberForDisplay(field.value as number));
                  }
                }}
              />
            </div>
          </FormControl>
          {showWarning && (
            <p className="text-xs text-orange-500 mt-1">
              ⚠️ Warning: Obligated budget exceeds parent project total allocated budget.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}