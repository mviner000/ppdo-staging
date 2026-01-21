// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/BudgetWarningAlert.tsx

"use client";

import { AlertTriangle } from "lucide-react";
import { BudgetWarning } from "../../types/form.types";
import { formatCurrency } from "../../utils/form.utils";

interface BudgetWarningAlertProps {
  warning: BudgetWarning;
}

export function BudgetWarningAlert({ warning }: BudgetWarningAlertProps) {
  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Budget Allocation Warning
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {warning.message}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white dark:bg-zinc-900 p-2 rounded border">
              <p className="text-zinc-500 dark:text-zinc-400">Parent Budget</p>
              <p className="font-semibold">{formatCurrency(warning.parentBudget)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-100 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">Total Allocated</p>
              <p className="font-semibold text-red-700 dark:text-red-300">
                {formatCurrency(warning.allocatedTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}