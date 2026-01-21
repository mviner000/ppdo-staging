// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/BudgetStatusBar.tsx

"use client";

import { BudgetAllocationStatus } from "../../types/form.types";
import { formatCurrency, calculatePercentageUsed } from "../../utils/form.utils";

interface BudgetStatusBarProps {
  budgetAllocationStatus: BudgetAllocationStatus;
  currentAllocated: number;
}

export function BudgetStatusBar({ 
  budgetAllocationStatus, 
  currentAllocated 
}: BudgetStatusBarProps) {
  const percentageUsed = calculatePercentageUsed(
    budgetAllocationStatus.siblingTotal + currentAllocated,
    budgetAllocationStatus.parentTotal
  );

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-600 dark:text-zinc-400">
          Budget Usage: {formatCurrency(budgetAllocationStatus.siblingTotal + currentAllocated)} of {formatCurrency(budgetAllocationStatus.parentTotal)}
        </span>
        <span className={`font-medium ${
          budgetAllocationStatus.isExceeded
            ? "text-red-600 dark:text-red-400"
            : "text-green-600 dark:text-green-400"
        }`}>
          {percentageUsed.toFixed(1)}%
        </span>
      </div>
      
      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            budgetAllocationStatus.isExceeded
              ? "bg-red-500"
              : "bg-green-500"
          }`}
          style={{
            width: `${Math.min(percentageUsed, 100)}%`
          }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          Available: {formatCurrency(budgetAllocationStatus.available)}
        </span>
        {budgetAllocationStatus.isExceeded && (
          <span className="text-red-600 dark:text-red-400 font-medium">
            Over budget by {formatCurrency(budgetAllocationStatus.difference)}
          </span>
        )}
      </div>
    </div>
  );
}