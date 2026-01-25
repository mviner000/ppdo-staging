// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/AllocatedBudgetField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { BreakdownFormValues } from "./utils/formValidation";
import { BudgetAllocationStatus } from "./utils/budgetCalculations";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
  formatNumberForDisplay,
  formatCurrency,
} from "./utils/formHelpers";

interface AllocatedBudgetFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
  displayValue: string;
  setDisplayValue: (value: string) => void;
  budgetAllocationStatus: BudgetAllocationStatus;
}

export function AllocatedBudgetField({
  form,
  displayValue,
  setDisplayValue,
  budgetAllocationStatus,
}: AllocatedBudgetFieldProps) {
  return (
    <FormField
      control={form.control}
      name="allocatedBudget"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className="text-zinc-700 dark:text-zinc-300">
              Allocated Budget
            </FormLabel>
            {!budgetAllocationStatus.isLoading && !budgetAllocationStatus.noProjectId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Parent project budget: {formatCurrency(budgetAllocationStatus.parentTotal)}<br />
                      Sibling allocations: {formatCurrency(budgetAllocationStatus.siblingTotal)}<br />
                      Available: {formatCurrency(budgetAllocationStatus.available)}<br />
                      {budgetAllocationStatus.siblingCount} sibling breakdown(s)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                ₱
              </span>
              <Input
                placeholder="0"
                className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${
                  budgetAllocationStatus.isExceeded
                    ? "border-red-500 focus-visible:ring-red-500"
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}