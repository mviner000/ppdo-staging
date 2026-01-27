// app/dashboard/[year]/page.tsx
/**
 * Dynamic Dashboard Year Summary Page
 *
 * Route: /dashboard/[year]
 * Shows year-specific analytics and KPIs when user selects a fiscal year.
 */

"use client";

import { DashboardSummary } from "@/components/ppdo/dashboard/summary";
import { useParams } from "next/navigation";

export default function DashboardYearPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  if (isNaN(year)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Invalid fiscal year</p>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
          Please select a valid year from the dashboard
        </p>
      </div>
    );
  }

  return <DashboardSummary year={year} />;
}
