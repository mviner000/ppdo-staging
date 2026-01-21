// app/dashboard/project/[year]/components/YearBudgetPageHeader.tsx

"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Calendar } from "lucide-react";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";

interface YearBudgetPageHeaderProps {
  year: number;
}

export function YearBudgetPageHeader({ year }: YearBudgetPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6 no-print">

      {/* Title Section */}
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Calendar className="w-6 h-6 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <h1
              className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              Budget Tracking {year}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Monitor budget allocation, utilization, and project status for year {year}
            </p>
          </div>
        </div>

        <ActivityLogSheet type="budgetItem" title={`Budget History ${year}`} />
      </div>
    </div>
  );
}