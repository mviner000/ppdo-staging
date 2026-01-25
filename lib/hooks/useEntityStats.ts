/**
 * Shared Entity Statistics Hook
 *
 * This hook accepts IBaseBreakdown[] and returns generic statistics.
 * It allows the Trust Fund page to display the exact same analytics dashboard
 * as Projects without code duplication.
 *
 * Renamed from useBreakdownStats to emphasize it works with any entity type
 * (Projects, Trust Funds, etc.) that extends the base breakdown schema.
 */

import { useMemo } from "react";
import { IBaseBreakdown, IEntityStats } from "@/lib/types/breakdown.shared";

/**
 * Calculate statistics for any breakdown collection
 *
 * @param breakdowns - Array of breakdowns (Project or Trust Fund)
 * @returns Computed statistics or null if no data
 */
export function useEntityStats(
  breakdowns: IBaseBreakdown[] | undefined
): IEntityStats | null {
  return useMemo(() => {
    if (!breakdowns || breakdowns.length === 0) {
      return null;
    }

    // Filter out deleted breakdowns (soft delete system)
    const activeBreakdowns = breakdowns.filter((b) => !b.isDeleted);

    if (activeBreakdowns.length === 0) {
      return {
        totalReports: 0,
        statusCounts: { ongoing: 0, completed: 0, delayed: 0 },
        totalAllocatedBudget: 0,
        totalObligatedBudget: 0,
        totalUtilizedBudget: 0,
        totalBalance: 0,
        averageUtilizationRate: 0,
        completionRate: 0,
        delayRate: 0,
      };
    }

    // Status Counts
    const statusCounts = activeBreakdowns.reduce(
      (acc, record) => {
        if (record.status === "completed") acc.completed++;
        else if (record.status === "delayed") acc.delayed++;
        else if (record.status === "ongoing") acc.ongoing++;
        return acc;
      },
      { completed: 0, delayed: 0, ongoing: 0 }
    );

    // Budget Calculations
    const totalAllocatedBudget = activeBreakdowns.reduce(
      (sum, record) => sum + (record.allocatedBudget || 0),
      0
    );

    const totalObligatedBudget = activeBreakdowns.reduce(
      (sum, record) => sum + (record.obligatedBudget || 0),
      0
    );

    const totalUtilizedBudget = activeBreakdowns.reduce(
      (sum, record) => sum + (record.budgetUtilized || 0),
      0
    );

    const totalBalance = activeBreakdowns.reduce(
      (sum, record) => sum + (record.balance || 0),
      0
    );

    // Average Utilization Rate
    const utilizationRates = activeBreakdowns
      .map((record) => record.utilizationRate)
      .filter((rate): rate is number => rate !== undefined && rate !== null);

    const averageUtilizationRate =
      utilizationRates.length > 0
        ? utilizationRates.reduce((sum, rate) => sum + rate, 0) /
          utilizationRates.length
        : 0;

    // Latest Report (most recent by reportDate or _creationTime)
    const sortedByDate = [...activeBreakdowns].sort((a, b) => {
      const dateA = a.reportDate || a._creationTime;
      const dateB = b.reportDate || b._creationTime;
      return dateB - dateA;
    });

    const latestReport = sortedByDate[0];
    const latestReportDate = latestReport?.reportDate || latestReport?._creationTime;

    // Derived Metrics
    const totalReports = activeBreakdowns.length;
    const completionRate =
      totalReports > 0 ? (statusCounts.completed / totalReports) * 100 : 0;
    const delayRate =
      totalReports > 0 ? (statusCounts.delayed / totalReports) * 100 : 0;

    return {
      totalReports,
      statusCounts,
      totalAllocatedBudget,
      totalObligatedBudget,
      totalUtilizedBudget,
      totalBalance,
      averageUtilizationRate,
      latestReport,
      latestReportDate,
      completionRate,
      delayRate,
    };
  }, [breakdowns]);
}

/**
 * Hook to calculate additional metadata statistics
 *
 * @param breakdowns - Array of breakdowns
 * @returns Metadata statistics (unique locations, offices, etc.)
 */
export function useEntityMetadata(breakdowns: IBaseBreakdown[] | undefined) {
  return useMemo(() => {
    if (!breakdowns || breakdowns.length === 0) {
      return {
        uniqueLocations: 0,
        uniqueOffices: 0,
        uniqueMunicipalities: 0,
        uniqueBarangays: 0,
        uniqueDistricts: 0,
      };
    }

    const activeBreakdowns = breakdowns.filter((b) => !b.isDeleted);

    const municipalities = new Set(
      activeBreakdowns.map((b) => b.municipality).filter(Boolean)
    );
    const barangays = new Set(
      activeBreakdowns.map((b) => b.barangay).filter(Boolean)
    );
    const districts = new Set(
      activeBreakdowns.map((b) => b.district).filter(Boolean)
    );
    const offices = new Set(
      activeBreakdowns.map((b) => b.implementingOffice)
    );

    return {
      uniqueLocations: municipalities.size,
      uniqueOffices: offices.size,
      uniqueMunicipalities: municipalities.size,
      uniqueBarangays: barangays.size,
      uniqueDistricts: districts.size,
    };
  }, [breakdowns]);
}
