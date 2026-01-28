// app/dashboard/project/[year]/components/table/BudgetTableRow.tsx

"use client";

import { Pin, Calculator } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BudgetItem } from "@/app/dashboard/project/[year]/types";
import { getUtilizationColor, getProjectStatusColor, getStatusColor } from "@/app/dashboard/project/[year]/utils";

interface BudgetTableRowProps {
  item: BudgetItem;
  isAdmin: boolean;
  isSelected: boolean;
  hiddenColumns: Set<string>;
  onContextMenu: (e: React.MouseEvent, item: BudgetItem) => void;
  onClick: (item: BudgetItem, e: React.MouseEvent) => void;
  onSelectRow: (id: string, checked: boolean) => void;
}

export function BudgetTableRow({
  item,
  isAdmin,
  isSelected,
  hiddenColumns,
  onContextMenu,
  onClick,
  onSelectRow,
}: BudgetTableRowProps) {
  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, item)}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).closest("button") ||
          (e.target as HTMLElement).closest("[role='checkbox']")
        )
          return;
        onClick(item, e);
      }}
      className={`
        border-b border-zinc-200 dark:border-zinc-800 
        hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
        transition-colors cursor-pointer
        ${item.isPinned ? "bg-amber-50 dark:bg-amber-950/20" : ""}
        ${isSelected ? "bg-blue-50 dark:bg-blue-900/10" : ""}
      `}
    >
      {/* Checkbox */}
      {isAdmin && (
        <td className="px-3 py-4 text-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectRow(item.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}

      {/* Particular */}
      {!hiddenColumns.has("particular") && (
        <td className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            {item.isPinned && (
              <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
            )}
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {item.particular}
            </span>
            {item.autoCalculateBudgetUtilized && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0" title="Auto-calculate enabled">
                <Calculator className="w-3 h-3" />
              </div>
            )}
          </div>
        </td>
      )}

      {/* Year */}
      {!hiddenColumns.has("year") && (
        <td className="px-4 sm:px-6 py-4 text-center">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {item.year || "-"}
          </span>
        </td>
      )}

      {/* Status */}
      {!hiddenColumns.has("status") && (
        <td className="px-4 sm:px-6 py-4 text-center">
          <span
            className={`text-sm font-medium ${getStatusColor(item.status)}`}
          >
            {item.status
              ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
              : "-"}
          </span>
        </td>
      )}

      {/* Budget Allocated */}
      {!hiddenColumns.has("totalBudgetAllocated") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            ₱{item.totalBudgetAllocated.toLocaleString()}
          </span>
        </td>
      )}

      {/* Obligated Budget */}
      {!hiddenColumns.has("obligatedBudget") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {item.obligatedBudget
              ? `₱${item.obligatedBudget.toLocaleString()}`
              : "-"}
          </span>
        </td>
      )}

      {/* Budget Utilized */}
      {!hiddenColumns.has("totalBudgetUtilized") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            ₱{item.totalBudgetUtilized.toLocaleString()}
          </span>
        </td>
      )}

      {/* Utilization Rate */}
      {!hiddenColumns.has("utilizationRate") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span
            className={`text-sm font-semibold ${getUtilizationColor(
              item.utilizationRate
            )}`}
          >
            {item.utilizationRate.toFixed(1)}%
          </span>
        </td>
      )}

      {/* Completed */}
      {!hiddenColumns.has("projectCompleted") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span
            className={`text-sm font-medium ${getProjectStatusColor(
              item.projectCompleted
            )}`}
          >
            {Math.round(item.projectCompleted)}
          </span>
        </td>
      )}

      {/* Delayed */}
      {!hiddenColumns.has("projectDelayed") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span
            className={`text-sm font-medium ${getProjectStatusColor(
              item.projectDelayed
            )}`}
          >
            {Math.round(item.projectDelayed)}
          </span>
        </td>
      )}

      {/* Ongoing */}
      {!hiddenColumns.has("projectsOnTrack") && (
        <td className="px-4 sm:px-6 py-4 text-right">
          <span
            className={`text-sm font-medium ${getProjectStatusColor(
              item.projectsOnTrack
            )}`}
          >
            {Math.round(item.projectsOnTrack)}
          </span>
        </td>
      )}
    </tr>
  );
}