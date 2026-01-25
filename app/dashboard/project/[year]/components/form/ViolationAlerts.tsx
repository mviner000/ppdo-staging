"use client";

import { AlertCircle } from "lucide-react";
import { formatNumberForDisplay } from "./utils/formHelpers";

interface ViolationAlertsProps {
  isObligatedExceeded: boolean;
  isBudgetExceeded: boolean;
  totalBudgetAllocated: number;
  obligatedBudget: number;
  totalBudgetUtilized: number;
}

export function ViolationAlerts({
  isObligatedExceeded,
  isBudgetExceeded,
  totalBudgetAllocated,
  obligatedBudget,
  totalBudgetUtilized,
}: ViolationAlertsProps) {
  if (!isObligatedExceeded && !isBudgetExceeded) {
    return null;
  }

  return (
    <>
      {isObligatedExceeded && totalBudgetAllocated > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Obligated Budget Exceeded
            </p>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
              Obligated budget (₱{formatNumberForDisplay(obligatedBudget || 0)}) cannot exceed allocated amount (₱{formatNumberForDisplay(totalBudgetAllocated)})
            </p>
          </div>
        </div>
      )}

      {isBudgetExceeded && totalBudgetAllocated > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Utilized Budget Exceeded
            </p>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
              Utilized budget (₱{formatNumberForDisplay(totalBudgetUtilized)}) cannot exceed allocated amount (₱{formatNumberForDisplay(totalBudgetAllocated)})
            </p>
          </div>
        </div>
      )}
    </>
  );
}