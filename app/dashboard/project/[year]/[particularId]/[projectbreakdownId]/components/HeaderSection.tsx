// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/HeaderSection.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";
import { Eye, EyeOff, RefreshCw, ChevronLeft } from "lucide-react";

interface HeaderSectionProps {
  year: string;
  particularId: string;
  projectName?: string;
  implementingOffice?: string;
  showHeader: boolean;
  setShowHeader: (show: boolean) => void;
  isRecalculating: boolean;
  onRecalculate: () => void;
}

export function HeaderSection({
  year,
  particularId,
  projectName,
  implementingOffice,
  showHeader,
  setShowHeader,
  isRecalculating,
  onRecalculate,
}: HeaderSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 no-print">
      <div className="flex-1">
        <Link
          href={`/dashboard/project/${year}/${encodeURIComponent(particularId)}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {showHeader && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1
              className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {projectName || "Loading..."}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Historical breakdown and progress tracking for {year}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHeader(!showHeader)}
          className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {showHeader ? (
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

        {projectName && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Recalculate Status</span>
          </Button>
        )}

        {projectName && (
          <ActivityLogSheet
            type="breakdown"
            projectName={projectName}
            implementingOffice={implementingOffice}
          />
        )}
      </div>
    </div>
  );
}