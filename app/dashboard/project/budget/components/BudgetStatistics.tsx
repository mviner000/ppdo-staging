import React, { useMemo } from "react";

interface BudgetStatisticsProps {
  totalAllocated: number;
  totalUtilized: number;
  averageUtilizationRate: number;
  totalProjects: number;
}

export default function BudgetStatistics({
  totalAllocated,
  totalUtilized,
  averageUtilizationRate,
  totalProjects,
}: BudgetStatisticsProps) {
  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }),
    []
  );

  return (
    <section
      aria-label="Budget statistics"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print"
    >
      <StatCard
        label="Total Budget Allocated"
        value={currency.format(totalAllocated)}
      />
      <StatCard
        label="Total Budget Utilized"
        value={currency.format(totalUtilized)}
      />
      <StatCard
        label="Average Utilization Rate"
        value={`${averageUtilizationRate.toFixed(1)}%`}
      />
      <StatCard label="Total Particulars" value={totalProjects.toLocaleString()} />
    </section>
  );
}

const StatCard = React.memo(function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 h-full flex flex-col justify-between"
    >
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
        {label}
      </p>
      <p
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
        aria-live="polite"
      >
        {value}
      </p>
    </div>
  );
});
