// components/ppdo/dashboard/summary/KPICardsRow.tsx
"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface KPICardsRowProps {
  totalProjects: number;
  ongoing: number;
  completed: number;
  delayed: number;
  accentColor?: string;
}

export function KPICardsRow({
  totalProjects,
  ongoing,
  completed,
  delayed,
  accentColor = "#15803D",
}: KPICardsRowProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const kpiCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      color: "text-zinc-900 dark:text-zinc-50",
      tooltip: "All projects across all statuses for the selected fiscal year",
    },
    {
      label: "Ongoing",
      value: ongoing,
      color: "text-blue-600 dark:text-blue-500",
      tooltip: "Projects currently in progress with status marked as 'ongoing'",
    },
    {
      label: "Completed",
      value: completed,
      color: "text-emerald-600 dark:text-emerald-500",
      tooltip: "Projects that have been successfully completed and marked as 'completed'",
    },
    {
      label: "Delayed",
      value: delayed,
      color: "text-red-600 dark:text-red-500",
      tooltip: "Projects behind schedule with status marked as 'delayed'",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpiCards.map((card) => (
        <div
          key={card.label}
          className="group relative bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200"
          onMouseEnter={() => setActiveTooltip(card.label)}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide">
              {card.label}
            </p>
            <Info className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className={`text-3xl sm:text-4xl font-bold ${card.color}`}>
            {card.value}
          </p>

          {/* Tooltip */}
          {activeTooltip === card.label && (
            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal">
              <div className="text-center">{card.tooltip}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
