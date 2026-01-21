// app/dashboard/project/[year]/[particularId]/components/ParticularPageHeader.tsx

"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronRight, Folder, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calculator, Eye, EyeOff } from "lucide-react";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";
import { Id } from "@/convex/_generated/dataModel";

interface ParticularPageHeaderProps {
  particularFullName: string;
  budgetItemId?: Id<"budgetItems">;
  budgetItemParticulars?: string;
  budgetItemStatus?: "completed" | "ongoing" | "delayed";
  showDetails: boolean;
  onToggleDetails: () => void;
  onRecalculate: () => void;
}

export function ParticularPageHeader({
  particularFullName,
  budgetItemId,
  budgetItemParticulars,
  budgetItemStatus,
  showDetails,
  onToggleDetails,
  onRecalculate,
}: ParticularPageHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const year = params.year as string;

  return (
    <div className="mb-6 no-print">
      {/* Title Section */}
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <Folder className="w-6 h-6 text-blue-700 dark:text-blue-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 truncate"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
              title={particularFullName}
            >
              {particularFullName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Projects under {particularFullName} for year {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDetails}
            className="gap-2"
          >
            {showDetails ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Hide Details</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Show Details</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRecalculate}
            className="gap-2"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Recalculate</span>
          </Button>

          {budgetItemId && (
            <ActivityLogSheet
              type="budgetItem"
              budgetItemId={budgetItemId}
              title={`${particularFullName} History`}
            />
          )}
        </div>
      </div>
    </div>
  );
}