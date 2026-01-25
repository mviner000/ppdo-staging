// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/hooks/useBreakdownStats.ts

import { useMemo } from "react";
import { Breakdown } from "../types/breakdown.types";

export function useBreakdownStats(breakdownHistory: Breakdown[] | undefined) {
  return useMemo(() => {
    if (!breakdownHistory) return null;

    return {
      totalReports: breakdownHistory.length,
      latestReport: breakdownHistory[breakdownHistory.length - 1],
      earliestReport: breakdownHistory[0],
      totalAllocated: breakdownHistory.reduce(
        (sum, record) => sum + (record.allocatedBudget || 0),
        0
      ),
      totalUtilized: breakdownHistory.reduce(
        (sum, record) => sum + (record.budgetUtilized || 0),
        0
      ),
      avgAccomplishment:
        breakdownHistory.reduce(
          (sum, record) => sum + (record.projectAccomplishment || 0),
          0
        ) / (breakdownHistory.length || 1),
      statusCounts: breakdownHistory.reduce(
        (acc, record) => {
          if (record.status === "completed") acc.completed++;
          else if (record.status === "delayed") acc.delayed++;
          else if (record.status === "ongoing") acc.ongoing++;
          return acc;
        },
        { completed: 0, delayed: 0, ongoing: 0 }
      ),
      locations: new Set(
        breakdownHistory
          .map((record) => record.municipality)
          .filter(Boolean)
      ).size,
      offices: new Set(
        breakdownHistory.map((record) => record.implementingOffice)
      ).size,
    };
  }, [breakdownHistory]);
}