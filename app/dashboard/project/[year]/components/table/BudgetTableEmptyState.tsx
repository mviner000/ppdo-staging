// app/dashboard/project/[year]/components/table/BudgetTableEmptyState.tsx

"use client";

import { Search } from "lucide-react";

export function BudgetTableEmptyState() {
  return (
    <tr>
      <td colSpan={11} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <Search className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            No results found
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Try adjusting your search or filters
          </p>
        </div>
      </td>
    </tr>
  );
}