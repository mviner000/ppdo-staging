// app/dashboard/project/[year]/components/table/BudgetTableHeader.tsx

"use client";

import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { SortDirection, SortField } from "@/app/dashboard/project/[year]/types";

interface BudgetTableHeaderProps {
  isAdmin: boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  yearFilter: number[];
  statusFilter: string[];
  uniqueYears: number[];
  uniqueStatuses: string[];
  showHeaderSkeleton: boolean;
  hiddenColumns: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSort: (field: SortField) => void;
  onToggleYearFilter: (year: number) => void;
  onToggleStatusFilter: (status: string) => void;
}

export function BudgetTableHeader({
  isAdmin,
  isAllSelected,
  isIndeterminate,
  sortField,
  sortDirection,
  yearFilter,
  statusFilter,
  uniqueYears,
  uniqueStatuses,
  showHeaderSkeleton,
  hiddenColumns,
  onSelectAll,
  onSort,
  onToggleYearFilter,
  onToggleStatusFilter,
}: BudgetTableHeaderProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    if (sortDirection === "asc") return <ArrowUp className="w-3.5 h-3.5" />;
    return <ArrowDown className="w-3.5 h-3.5" />;
  };

  return (
    <thead>
      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        {isAdmin && (
          <th className="w-10 px-3 py-4 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-20">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
              className={isIndeterminate ? "opacity-50" : ""}
            />
          </th>
        )}

        {/* Particulars */}
        {!hiddenColumns.has("particular") && (
          <th className="px-4 sm:px-6 py-4 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("particular")}
              className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Particulars
              </span>
              <SortIcon field="particular" />
            </button>
          </th>
        )}

        {/* Year */}
        {!hiddenColumns.has("year") && (
          <th className="px-4 sm:px-6 py-4 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    Year
                  </span>
                  {showHeaderSkeleton && <Skeleton className="h-3 w-8 rounded" />}
                  <Filter
                    className={`w-3.5 h-3.5 ${
                      yearFilter.length > 0 ? "text-blue-600" : "opacity-50"
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
                {uniqueYears.length > 0 ? (
                  uniqueYears.map((year) => (
                    <DropdownMenuCheckboxItem
                      key={year}
                      checked={yearFilter.includes(year)}
                      onCheckedChange={() => onToggleYearFilter(year)}
                    >
                      {year}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuCheckboxItem disabled checked={false}>
                    No years available
                  </DropdownMenuCheckboxItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </th>
        )}

        {/* Status */}
        {!hiddenColumns.has("status") && (
          <th className="px-4 sm:px-6 py-4 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    Status
                  </span>
                  {showHeaderSkeleton && (
                    <Skeleton className="h-3 w-10 rounded" />
                  )}
                  <Filter
                    className={`w-3.5 h-3.5 ${
                      statusFilter.length > 0 ? "text-blue-600" : "opacity-50"
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                {uniqueStatuses.length > 0 ? (
                  uniqueStatuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={() => onToggleStatusFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuCheckboxItem disabled checked={false}>
                    No statuses available
                  </DropdownMenuCheckboxItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </th>
        )}

        {/* Budget Allocated */}
        {!hiddenColumns.has("totalBudgetAllocated") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("totalBudgetAllocated")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Allocated Budget
              </span>
              <SortIcon field="totalBudgetAllocated" />
            </button>
          </th>
        )}

        {/* Obligated Budget */}
        {!hiddenColumns.has("obligatedBudget") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("obligatedBudget")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Obligated Budget
              </span>
              <SortIcon field="obligatedBudget" />
            </button>
          </th>
        )}

        {/* Budget Utilized */}
        {!hiddenColumns.has("totalBudgetUtilized") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("totalBudgetUtilized")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Utilized Budget
              </span>
              <SortIcon field="totalBudgetUtilized" />
            </button>
          </th>
        )}

        {/* Utilization Rate */}
        {!hiddenColumns.has("utilizationRate") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("utilizationRate")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Utilization Rate
              </span>
              <SortIcon field="utilizationRate" />
            </button>
          </th>
        )}

        {/* Completed */}
        {!hiddenColumns.has("projectCompleted") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("projectCompleted")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Completed
              </span>
              <SortIcon field="projectCompleted" />
            </button>
          </th>
        )}

        {/* Delayed */}
        {!hiddenColumns.has("projectDelayed") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("projectDelayed")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Delayed
              </span>
              <SortIcon field="projectDelayed" />
            </button>
          </th>
        )}

        {/* Ongoing */}
        {!hiddenColumns.has("projectsOnTrack") && (
          <th className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
            <button
              onClick={() => onSort("projectsOnTrack")}
              className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Ongoing
              </span>
              <SortIcon field="projectsOnTrack" />
            </button>
          </th>
        )}
      </tr>
    </thead>
  );
}