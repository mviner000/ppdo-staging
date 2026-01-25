// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/UtilizedBudgetField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
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
  formatCurrency,
} from "./utils/formHelpers";

interface UtilizedBudgetFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
  displayValue: string;
  setDisplayValue: (value: string) => void;
  currentAllocated: number;
  currentUtilized: number;
  budgetAllocationStatus: BudgetAllocationStatus;
  isOverSelfUtilized: boolean;
}

export function UtilizedBudgetField({
  form,
  displayValue,
  setDisplayValue,
  currentAllocated,
  currentUtilized,
  budgetAllocationStatus,
  isOverSelfUtilized,
}: UtilizedBudgetFieldProps) {
  const isOverParent =
    currentUtilized > budgetAllocationStatus.parentTotal &&
    budgetAllocationStatus.parentTotal > 0;

  return (
    <FormField
      control={form.control}
      name="budgetUtilized"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Budget Utilized
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                ₱
              </span>
              <Input
                placeholder="0"
                className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${
                  isOverSelfUtilized
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
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
          {isOverSelfUtilized && (
            <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Utilization Warning
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Utilized ({formatCurrency(currentUtilized)}) exceeds allocated budget ({formatCurrency(currentAllocated)}) by {formatCurrency(currentUtilized - currentAllocated)}
              </p>
            </div>
          )}
          {isOverParent && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Critical Warning: Utilized budget exceeds parent project total allocated budget.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}