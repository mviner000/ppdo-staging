/**
 * Shared Breakdown Statistics Accordion Component
 *
 * Visual display of statistics from useEntityStats hook.
 * Works with both Project and Trust Fund breakdowns.
 */

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/shared/utils/form-helpers";
import { IEntityStats, IBaseBreakdown } from "@/lib/types/breakdown.shared";

export interface BreakdownStatsAccordionProps {
  stats: IEntityStats | null;
  entityType: "project" | "trustfund";
  uniqueOffices?: number;
  uniqueLocations?: number;
  getStatusColor?: (status?: string) => string;
}

export function BreakdownStatsAccordion({
  stats,
  entityType,
  uniqueOffices,
  uniqueLocations,
  getStatusColor,
}: BreakdownStatsAccordionProps) {
  if (!stats) return null;

  // Default status color function
  const defaultGetStatusColor = (status?: string) => {
    if (!status) return "";
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-700 dark:text-green-300";
      case "delayed":
        return "text-red-700 dark:text-red-300";
      case "ongoing":
        return "text-blue-700 dark:text-blue-300";
      default:
        return "";
    }
  };

  const statusColorFn = getStatusColor || defaultGetStatusColor;

  return (
    <div className="mb-6 no-print">
      <Accordion type="single" collapsible>
        <AccordionItem value="statistics" className="border-none">
          <AccordionTrigger className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-6 py-4 hover:no-underline [&[data-state=open]]:rounded-b-none">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Summary Statistics
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-white dark:bg-zinc-900 rounded-b-xl border border-t-0 border-zinc-200 dark:border-zinc-800 px-6 pb-6 pt-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatBox
                label="Total Breakdown Records"
                value={stats.totalReports}
              />
              {uniqueOffices !== undefined && (
                <StatBox
                  label="Implementing Offices"
                  value={uniqueOffices}
                />
              )}
              <StatBox
                label="Total Allocated"
                value={formatCurrency(stats.totalAllocatedBudget)}
              />
              <StatBox
                label="Total Utilized"
                value={formatCurrency(stats.totalUtilizedBudget)}
              />
              <StatBox
                label="Average Utilization"
                value={`${stats.averageUtilizationRate.toFixed(1)}%`}
              />
              <StatBox
                label="Completion Rate"
                value={`${stats.completionRate.toFixed(1)}%`}
              />
              <StatBox
                label="Delay Rate"
                value={`${stats.delayRate.toFixed(1)}%`}
              />
              {uniqueLocations !== undefined && (
                <StatBox
                  label="Unique Locations"
                  value={uniqueLocations}
                />
              )}
            </div>

            {/* Status Distribution */}
            {stats.statusCounts && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl border border-green-200 dark:border-green-800 p-6 mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Status Distribution
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatusDistBox
                    label="Completed"
                    count={stats.statusCounts.completed}
                    total={stats.totalReports}
                    colorClass="text-green-700 dark:text-green-300"
                    labelClass="text-green-600 dark:text-green-400"
                  />
                  <StatusDistBox
                    label="Ongoing"
                    count={stats.statusCounts.ongoing}
                    total={stats.totalReports}
                    colorClass="text-blue-700 dark:text-blue-300"
                    labelClass="text-blue-600 dark:text-blue-400"
                  />
                  <StatusDistBox
                    label="Delayed"
                    count={stats.statusCounts.delayed}
                    total={stats.totalReports}
                    colorClass="text-red-700 dark:text-red-300"
                    labelClass="text-red-600 dark:text-red-400"
                  />
                </div>
              </div>
            )}

            {/* Latest Report */}
            {stats.latestReport && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Latest Record
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LatestRecordItem
                    label="Implementing Office"
                    value={stats.latestReport.implementingOffice}
                  />
                  <LatestRecordItem
                    label="Location"
                    value={stats.latestReport.municipality || "N/A"}
                  />
                  <LatestRecordItem
                    label="Status"
                    value={stats.latestReport.status?.toUpperCase() || "N/A"}
                    valueClass={statusColorFn(stats.latestReport.status)}
                  />
                  <LatestRecordItem
                    label="Accomplishment"
                    value={`${stats.latestReport.projectAccomplishment?.toFixed(1) || "0.0"}%`}
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function StatusDistBox({
  label,
  count,
  total,
  colorClass,
  labelClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
  labelClass: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-sm font-medium ${labelClass} mb-1`}>{label}</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{count}</div>
      <div className={`text-xs opacity-70 ${labelClass} mt-1`}>
        {total > 0 ? Math.round((count / total) * 100) : 0}%
      </div>
    </div>
  );
}

function LatestRecordItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      <p
        className={`text-base font-medium text-zinc-900 dark:text-zinc-100 ${valueClass || ""}`}
      >
        {value}
      </p>
    </div>
  );
}
