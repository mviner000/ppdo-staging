// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/CurrencyInput.tsx

"use client";

import { Control, UseFormReturn } from "react-hook-form";
import { AlertTriangle, Info } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { BreakdownFormValues } from "../../types/form.types";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
  formatNumberForDisplay,
} from "../../utils/form.utils";

interface CurrencyInputProps {
  control: Control<BreakdownFormValues>;
  form: UseFormReturn<BreakdownFormValues>;
  name: keyof BreakdownFormValues;
  label: string;
  displayValue: string;
  setDisplayValue: (value: string) => void;
  showWarning?: boolean;
  tooltipContent?: React.ReactNode;
  statusBar?: React.ReactNode;
  warningMessage?: string;
  warningDetails?: {
    title: string;
    message: string;
  };
  criticalWarning?: string;
}

export function CurrencyInput({
  control,
  form,
  name,
  label,
  displayValue,
  setDisplayValue,
  showWarning = false,
  tooltipContent,
  statusBar,
  warningMessage,
  warningDetails,
  criticalWarning,
}: CurrencyInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className="text-zinc-700 dark:text-zinc-300">
              {label}
            </FormLabel>
            {tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {tooltipContent}
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
                  showWarning
                    ? "border-red-500 focus-visible:ring-red-500 pr-10"
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
              {showWarning && (
                <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
          </FormControl>

          {/* Status Bar (for allocated budget) */}
          {statusBar}

          {/* Warning Details */}
          {warningDetails && (
            <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                {warningDetails.title}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {warningDetails.message}
              </p>
            </div>
          )}

          {/* Warning Message */}
          {warningMessage && (
            <p className="text-xs text-orange-500 mt-1">
              {warningMessage}
            </p>
          )}

          {/* Critical Warning */}
          {criticalWarning && (
            <p className="text-xs text-red-500 mt-1">
              {criticalWarning}
            </p>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}