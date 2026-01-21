// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/BudgetOverviewCard.tsx

"use client";

import { Package, TrendingUp, Info } from "lucide-react";
import { BudgetAllocationStatus } from "../../types/form.types";
import { formatCurrency } from "../../utils/form.utils";

interface BudgetOverviewCardProps {
  budgetAllocationStatus: BudgetAllocationStatus;
  currentAllocated: number;
}

export function BudgetOverviewCard({ 
  budgetAllocationStatus, 
  currentAllocated 
}: BudgetOverviewCardProps) {
  // Show message when no project ID
  if (budgetAllocationStatus.noProjectId) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              No Parent Project Linked
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              This breakdown is not linked to a parent project. Budget validation is disabled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-top-2 fade-in duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Parent Project Budget Overview
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 dark:bg-zinc-900/60 rounded-lg p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total Budget</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(budgetAllocationStatus.parentTotal)}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 rounded-lg p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Remaining Available</p>
              <p className={`text-lg font-bold ${
                budgetAllocationStatus.available <= 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}>
                {formatCurrency(budgetAllocationStatus.available)}
              </p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 rounded-lg p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Siblings Allocated</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(budgetAllocationStatus.siblingTotal)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {budgetAllocationStatus.siblingCount} breakdown(s)
              </p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 rounded-lg p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Your Input</p>
              <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(currentAllocated)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Current entry
              </p>
            </div>
          </div>
        </div>
      </div>

      {budgetAllocationStatus.siblings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
              Sibling Breakdowns ({budgetAllocationStatus.siblings.length})
            </p>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {budgetAllocationStatus.siblings.map((sibling) => (
              <div 
                key={sibling._id} 
                className="flex items-center justify-between bg-white/40 dark:bg-zinc-900/40 rounded px-2.5 py-1.5 text-xs border border-blue-100/50 dark:border-blue-900/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {sibling.projectTitle || sibling.implementingOffice}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px]">
                    {sibling.implementingOffice}
                  </p>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(sibling.allocatedBudget || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}