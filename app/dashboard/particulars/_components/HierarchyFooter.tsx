// app/dashboard/particulars/_components/HierarchyFooter.tsx

"use client";

import { Badge } from "@/components/ui/badge";

interface HierarchyFooterProps {
  budgetItems: number;
  projects: number;
  breakdowns: number;
}

export function HierarchyFooter({ budgetItems, projects, breakdowns }: HierarchyFooterProps) {
  return (
    <div className="border-t px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Totals:
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 text-xs bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
              {budgetItems} Budget Items
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 text-xs bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300">
              {projects} Projects
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 text-xs bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
              {breakdowns} Breakdowns
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}