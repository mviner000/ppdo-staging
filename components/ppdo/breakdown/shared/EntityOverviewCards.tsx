/**
 * Shared Entity Overview Cards Component
 *
 * Reusable grid of cards displaying entity information (Office, Budget, Status).
 * Works with both Project and Trust Fund entities.
 */

"use client";

import { formatCurrency } from "@/lib/shared/utils/form-helpers";

interface CardData {
  title: string;
  value: string | number;
  valueClassName?: string;
  truncate?: boolean;
}

export interface EntityOverviewCardsProps {
  entityType: "project" | "trustfund";
  implementingOffice?: string;
  totalBudget?: number;
  statusText?: string;
  statusColor?: string;
  year?: string;
  remarks?: string;
  breakdownCounts?: {
    completed: number;
    delayed: number;
    ongoing: number;
  };
  customCards?: CardData[]; // Allow additional custom cards
}

export function EntityOverviewCards({
  entityType,
  implementingOffice,
  totalBudget,
  statusText,
  statusColor,
  year,
  remarks,
  breakdownCounts,
  customCards = [],
}: EntityOverviewCardsProps) {
  const cards: CardData[] = [];

  // Implementing Office
  if (implementingOffice) {
    cards.push({
      title: "Implementing Office",
      value: implementingOffice,
    });
  }

  // Current Budget
  if (totalBudget !== undefined) {
    cards.push({
      title: "Current Budget",
      value: formatCurrency(totalBudget),
    });
  }

  // Breakdown Counts (if available)
  if (breakdownCounts) {
    cards.push({
      title: "Breakdown Counts",
      value: `${breakdownCounts.completed}C • ${breakdownCounts.delayed}D • ${breakdownCounts.ongoing}O`,
    });
  }

  // Status
  if (statusText) {
    cards.push({
      title: `${entityType === "project" ? "Project" : "Trust Fund"} Status`,
      value: statusText.toUpperCase(),
      valueClassName: statusColor,
    });
  }

  // Year
  if (year) {
    cards.push({
      title: "Year",
      value: year,
    });
  }

  // Remarks
  if (remarks) {
    cards.push({
      title: "Remarks",
      value: remarks,
      truncate: true,
    });
  }

  // Add custom cards
  cards.push(...customCards);

  // If no cards to display, return null
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6 no-print animate-in fade-in slide-in-from-bottom-4 duration-500">
      {cards.map((card, index) => (
        <Card
          key={index}
          title={card.title}
          value={card.value}
          valueClassName={card.valueClassName}
          truncate={card.truncate}
        />
      ))}
    </div>
  );
}

function Card({
  title,
  value,
  valueClassName,
  truncate,
}: {
  title: string;
  value: string | number;
  valueClassName?: string;
  truncate?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">{title}</p>
      <p
        className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 ${
          valueClassName || ""
        } ${truncate ? "truncate" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
