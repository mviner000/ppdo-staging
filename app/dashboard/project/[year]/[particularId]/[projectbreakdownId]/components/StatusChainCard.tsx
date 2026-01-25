// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/StatusChainCard.tsx

"use client";

import { getStatusColor } from "../utils/page-helpers";

interface StatusChainCardProps {
  breakdownCount: number;
  stats: any;
  projectStatus?: string;
  parentStatus?: string;
}

export function StatusChainCard({
  breakdownCount,
  stats,
  projectStatus = "ONGOING",
  parentStatus = "ONGOING",
}: StatusChainCardProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 no-print animate-in fade-in duration-500">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Status Chain
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Breakdowns */}
        <div className="text-center">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Breakdown Items
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {breakdownCount}
          </div>
          {stats && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              {stats.statusCounts.ongoing} ongoing • {stats.statusCounts.delayed} delayed • {stats.statusCounts.completed} completed
            </div>
          )}
        </div>

        {/* Project Status */}
        <div className="text-center border-l border-r border-blue-200 dark:border-blue-800 px-6">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Project Status
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(projectStatus)}`}>
            {projectStatus.toUpperCase()}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Auto-calculated from {breakdownCount} breakdowns
          </div>
        </div>

        {/* Budget Status */}
        <div className="text-center">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Budget Status
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(parentStatus)}`}>
            {parentStatus.toUpperCase()}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Auto-calculated from project
          </div>
        </div>
      </div>

      {/* Rules Legend */}
      <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Status Calculation Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
            <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">1. Ongoing Priority</div>
            <div className="text-zinc-600 dark:text-zinc-400">Any ongoing item sets parent to ongoing</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
            <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">2. Delayed Priority</div>
            <div className="text-zinc-600 dark:text-zinc-400">If no ongoing, any delayed sets parent to delayed</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
            <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">3. Completed</div>
            <div className="text-zinc-600 dark:text-zinc-400">Only if all items are completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}