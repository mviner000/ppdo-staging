// app/dashboard/project/[year]/[particularId]/components/form/AllocatedBudgetField.tsx

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Info, AlertTriangle } from "lucide-react";
import { ProjectFormValues } from "./utils/formValidation";
import { formatNumberWithCommas, parseFormattedNumber, formatNumberForDisplay, formatCurrency } from "./utils/formHelpers";
import { BudgetAvailabilityResult } from "./utils/budgetCalculations";

interface AllocatedBudgetFieldProps {
  form: UseFormReturn<ProjectFormValues>;
  displayValue: string;
  setDisplayValue: (value: string) => void;
  budgetAvailability: BudgetAvailabilityResult;
  parentBudgetItem: any;
}

export function AllocatedBudgetField({ 
  form, 
  displayValue, 
  setDisplayValue,
  budgetAvailability,
  parentBudgetItem
}: AllocatedBudgetFieldProps) {
  return (
    <FormField
      name="totalBudgetAllocated"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <span>Total Budget Allocated</span>
              {!budgetAvailability.isLoading && parentBudgetItem && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Available: {formatCurrency(budgetAvailability.available)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                ₱
              </span>
              <Input
                placeholder="0"
                className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${budgetAvailability.isOverBudget
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-zinc-300 dark:border-zinc-700"
                  }`}
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
          {budgetAvailability.isOverBudget && (
            <div className="flex items-start gap-1 mt-1 text-xs text-red-600 font-medium animate-in slide-in-from-top-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Warning: Amount exceeds parent budget availability ({formatCurrency(budgetAvailability.available)})
              </span>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}