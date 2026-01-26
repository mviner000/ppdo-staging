"use client";

import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnVisibilityMenuProps } from "./types";

/**
 * Reusable Column Visibility Menu Component
 *
 * Provides a dropdown menu for toggling column visibility in tables.
 * Automatically extracts column names from the hiddenColumns set.
 *
 * Used by TableToolbar and can be extended for custom implementations.
 */
export function TableToolbarColumnVisibility({
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
}: ColumnVisibilityMenuProps) {
  // Extract column IDs from the hiddenColumns set
  const columnIds = Array.from(hiddenColumns);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {columnIds.length > 0 ? (
          <>
            {columnIds.map((columnId) => (
              <DropdownMenuCheckboxItem
                key={columnId}
                checked={!hiddenColumns.has(columnId)}
                onCheckedChange={(checked) => onToggleColumn(columnId, checked)}
              >
                {/* Convert camelCase or snake_case to Title Case */}
                {formatColumnName(columnId)}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          <div className="px-2 py-1.5 text-xs text-zinc-500">
            No columns available
          </div>
        )}

        <DropdownMenuItem onClick={onShowAll} className="cursor-pointer">
          Show All Columns
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHideAll} className="cursor-pointer">
          Hide All Columns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Convert camelCase or snake_case to Title Case
 * @example
 * formatColumnName('budgetAmount') // => 'Budget Amount'
 * formatColumnName('fiscal_year') // => 'Fiscal Year'
 */
function formatColumnName(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1") // Add space before capitals
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/^\s+|\s+$/g, "") // Trim
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
