// app/dashboard/project/[year]/[particularId]/components/form/ManualInputSection.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, AlertTriangle } from "lucide-react";
import { ProjectFormValues } from "./utils/formValidation";
import { formatNumberWithCommas, parseFormattedNumber, formatNumberForDisplay } from "./utils/formHelpers";

interface ManualInputSectionProps {
  form: UseFormReturn<ProjectFormValues>;
  showManualInput: boolean;
  setShowManualInput: (show: boolean) => void;
  autoCalculate: boolean;
  displayObligated: string;
  setDisplayObligated: (value: string) => void;
  displayUtilized: string;
  setDisplayUtilized: (value: string) => void;
  isObligatedExceeded: boolean;
  isBudgetExceeded: boolean;
}

export function ManualInputSection({
  form,
  showManualInput,
  setShowManualInput,
  autoCalculate,
  displayObligated,
  setDisplayObligated,
  displayUtilized,
  setDisplayUtilized,
  isObligatedExceeded,
  isBudgetExceeded,
}: ManualInputSectionProps) {
  const handleToggleManualInput = () => {
    const nextState = !showManualInput;
    setShowManualInput(nextState);
    if (!nextState) {
      form.setValue("obligatedBudget", 0);
      form.setValue("totalBudgetUtilized", 0);
      setDisplayObligated("");
      setDisplayUtilized("");
    }
  };

  return (
    <div className="pt-2 space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleManualInput}
          disabled={autoCalculate === true}
          className="text-xs flex items-center gap-2 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-700 dark:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showManualInput ? (
            <><MinusCircle className="w-3 h-3" /> Hide Manual Inputs</>
          ) : (
            <><PlusCircle className="w-3 h-3" /> Input Utilized and Obligated Budget</>
          )}
        </Button>
        {autoCalculate && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Disabled: Auto-calculate is ON
          </span>
        )}
      </div>

      {showManualInput && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border border-orange-200 dark:border-orange-800/50 rounded-lg p-4 bg-orange-50/50 dark:bg-orange-950/10">
          <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-300 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              This feature is under development, the entire system auto calculation may be not true, better use the project breakdown page to input the specific obligated and utilized budget.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="obligatedBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700 dark:text-zinc-300">
                    Obligated Budget <span className="text-xs text-zinc-500">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                        ₱
                      </span>
                      <Input
                        placeholder="0"
                        className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${isObligatedExceeded
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-zinc-300 dark:border-zinc-700"
                          }`}
                        value={displayObligated}
                        onChange={(e) => {
                          const value = e.target.value;
                          const formatted = formatNumberWithCommas(value);
                          setDisplayObligated(formatted);
                          const numericValue = parseFormattedNumber(formatted);
                          field.onChange(numericValue > 0 ? numericValue : undefined);
                        }}
                        onBlur={() => {
                          const numericValue = parseFormattedNumber(displayObligated);
                          if (numericValue > 0) {
                            setDisplayObligated(formatNumberForDisplay(numericValue));
                          } else {
                            setDisplayObligated("");
                          }
                          field.onChange(numericValue > 0 ? numericValue : undefined);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="totalBudgetUtilized"
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
                        disabled={autoCalculate === true}
                        className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${isBudgetExceeded
                          ? "border-orange-500 focus-visible:ring-orange-500"
                          : "border-zinc-300 dark:border-zinc-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        value={displayUtilized}
                        onChange={(e) => {
                          const value = e.target.value;
                          const formatted = formatNumberWithCommas(value);
                          setDisplayUtilized(formatted);
                          const numericValue = parseFormattedNumber(formatted);
                          field.onChange(numericValue);
                        }}
                        onBlur={() => {
                          const numericValue = parseFormattedNumber(displayUtilized);
                          if (numericValue > 0) {
                            setDisplayUtilized(formatNumberForDisplay(numericValue));
                          } else {
                            setDisplayUtilized("");
                          }
                          field.onChange(numericValue);
                        }}
                      />
                    </div>
                  </FormControl>
                  {autoCalculate && (
                    <FormDescription className="text-xs text-blue-600 dark:text-blue-400">
                      This field is read-only because auto-calculate is enabled
                    </FormDescription>
                  )}
                  {isBudgetExceeded && (
                    <p className="text-xs text-orange-500 mt-1">
                      ⚠️ Warning: Utilized budget exceeds allocated budget.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
