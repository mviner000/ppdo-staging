// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/ColumnVisibilityMenu.tsx

"use client";

import { ColumnVisibilityMenu as BaseColumnVisibilityMenu, BaseColumn } from "@/components/ColumnVisibilityMenu";
import { ColumnConfig } from "../types/breakdown.types";

interface BreakdownColumnVisibilityMenuProps {
  columns: ColumnConfig[];
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

/**
 * Breakdown table specific column visibility menu wrapper
 * Uses custom styled trigger button to match the toolbar design
 */
export function ColumnVisibilityMenu({
  columns,
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
}: BreakdownColumnVisibilityMenuProps) {
  // Transform columns to match BaseColumn interface
  const baseColumns: BaseColumn[] = columns.map(col => ({
    key: col.key,
    label: col.label,
  }));

  return (
    <BaseColumnVisibilityMenu
      columns={baseColumns}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn}
      onShowAll={onShowAll}
      onHideAll={onHideAll}
      label="Toggle Columns"
      showCount={true}
      // Custom trigger to match breakdown table toolbar style
      renderTrigger={({ hiddenCount, defaultTrigger }) => (
        <button
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          style={{
            border: '1px solid rgb(228 228 231 / 1)',
            borderRadius: '6px',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="7" x="3" y="3" rx="1" />
            <rect width="9" height="7" x="3" y="14" rx="1" />
            <rect width="5" height="7" x="16" y="14" rx="1" />
          </svg>
          <span className="hidden sm:inline">Columns</span>
          {hiddenCount > 0 && (
            <span className="ml-0.5 text-xs text-zinc-500">
              ({hiddenCount} hidden)
            </span>
          )}
        </button>
      )}
    />
  );
}