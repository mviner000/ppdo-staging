// app/dashboard/project/[year]/components/table/BudgetTableTotalsRow.tsx

"use client";

import { BudgetTotals } from "@/app/dashboard/project/[year]/types";
import { getUtilizationColor } from "@/app/dashboard/project/[year]/utils";

interface BudgetTableTotalsRowProps {
  totals: BudgetTotals;
  totalUtilizationRate: number;
  hiddenColumns: Set<string>;
}

export function BudgetTableTotalsRow({
  totals,
  totalUtilizationRate,
  hiddenColumns,
}: BudgetTableTotalsRowProps) {
  return (
    <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-semibold">
      {/* Empty cell for checkbox column */}
      <td></td>
      
      {/* Particular - "TOTAL" label */}
      {!hiddenColumns.has("particular") && (
        <td className="px-4 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
          TOTAL
        </td>
      )}
      
      {/* Year - Empty */}
      {!hiddenColumns.has("year") && (
        <td className="px-4 sm:px-6 py-4"></td>
      )}
      
      {/* Status - Empty */}
      {!hiddenColumns.has("status") && (
        <td className="px-4 sm:px-6 py-4"></td>
      )}
      
      {/* Budget Allocated */}
      {!hiddenColumns.has("totalBudgetAllocated") && (
        <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
          ₱{totals.totalBudgetAllocated.toLocaleString()}
        </td>
      )}
      
      {/* Obligated Budget */}
      {!hiddenColumns.has("obligatedBudget") && (
        <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
          ₱{totals.obligatedBudget.toLocaleString()}
        </td>
      )}
      
      {/* Budget Utilized */}
      {!hiddenColumns.has("totalBudgetUtilized") && (
        <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
          ₱{totals.totalBudgetUtilized.toLocaleString()}
        </td>
      )}
      
      {/* Utilization Rate */}
      {!hiddenColumns.has("utilizationRate") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span
            className={`text-sm font-semibold ${getUtilizationColor(
              totalUtilizationRate
            )}`}
          >
            {totalUtilizationRate.toFixed(1)}%
          </span>
        </td>
      )}
      
      {/* Completed */}
      {!hiddenColumns.has("projectCompleted") && (
        <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
          {Math.round(totals.projectCompleted)}
        </td>
      )}
      
      {/* Delayed */}
      {!hiddenColumns.has("projectDelayed") && (
        <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
          {Math.round(totals.projectDelayed)}
        </td>
      )}
      
      {/* Ongoing */}
      {!hiddenColumns.has("projectsOnTrack") && (
        <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
          {Math.round(totals.projectsOnTrack)}
        </td>
      )}
    </tr>
  );
}