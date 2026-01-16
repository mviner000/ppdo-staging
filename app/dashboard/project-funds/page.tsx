"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Folder, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccentColor } from "@/contexts/AccentColorContext";

// Import your trust funds data fetch or mock data
import { mockTrustFunds } from "../trust-funds/mockData"; // Adjust path if needed

export default function ProjectFundsYearFolder() {
  const router = useRouter();

  // For demo, using mockTrustFunds, replace with your real data hook if available
  const trustFundsItems = mockTrustFunds;

  // Extract unique years from trust funds data
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const item of trustFundsItems) {
      if (typeof item.dateReceived === "string") {
        // Assuming dateReceived is string like 'YYYY-MM-DD'
        const year = new Date(item.dateReceived).getFullYear();
        if (!isNaN(year)) set.add(year);
      }
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [trustFundsItems]);

  const { accentColorValue } = useAccentColor();

  // Handle open year: save year and route to year-specific page
  const handleOpenYear = (year: number) => {
    try {
      localStorage.setItem("trust_funds_selected_year", String(year));
    } catch (_) {
      // Ignore storage error
    }
    router.push("/dashboard/project-funds/year"); // Change route if you have a dynamic year page e.g., `/dashboard/project-funds/[year]`
  };

  // For demo, access check and loading states are omitted. Add your own logic if needed.

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Trust Funds by Year
        </h1>
        <div className="flex items-center gap-2">
          {years.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => handleOpenYear(years[0])}>
              Open Latest
            </Button>
          )}
          <button
            onClick={() => {
              try {
                localStorage.setItem("trust_funds_open_add", "true");
              } catch (_) {}
              router.push("/dashboard/project-funds/new"); // Adjust route for new item page
            }}
            className="cursor-pointer px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md text-white"
            style={{ backgroundColor: accentColorValue }}
            title="Create a new trust fund item"
          >
            New Item Here
          </button>
        </div>
      </div>

      {years.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center text-zinc-600 dark:text-zinc-400">
          No trust funds data available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {years.map((year) => (
            <Card
              key={year}
              className="group relative transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-amber-400"
            >
              <button
                onClick={() => handleOpenYear(year)}
                className="w-full text-left"
                aria-label={`Open trust funds for year ${year}`}
              >
                <CardContent className="cursor-pointer p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Year
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {year}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-amber-300/40 to-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
