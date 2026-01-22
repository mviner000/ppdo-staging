// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/TableToolbar.tsx

"use client";

import { Search, Trash2, Printer, Plus } from "lucide-react";
import { ColumnVisibilityMenu } from "./ColumnVisibilityMenu";
import { ColumnConfig } from "../types/breakdown.types";

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onPrint: () => void;
  onAdd?: () => void;
  onOpenTrash?: () => void;
  accentColor: string;
  
  // 🆕 Column visibility props
  columns: ColumnConfig[];
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export function TableToolbar({
  search,
  onSearchChange,
  onPrint,
  onAdd,
  onOpenTrash,
  accentColor,
  columns,
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
}: TableToolbarProps) {
  return (
    <div 
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 shrink-0"
      style={{
        borderBottom: '1px solid rgb(228 228 231 / 1)',
      }}
    >
      {/* Search Input */}
      <div className="relative w-full sm:w-64 lg:w-72">
        <Search 
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" 
          style={{ width: '14px', height: '14px' }}
        />
        <input
          className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-shadow"
          style={{
            border: '1px solid rgb(228 228 231 / 1)',
            borderRadius: '6px',
          }}
          placeholder="Search..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* 🆕 Column Visibility Menu */}
        <ColumnVisibilityMenu
          columns={columns}
          hiddenColumns={hiddenColumns}
          onToggleColumn={onToggleColumn}
          onShowAll={onShowAll}
          onHideAll={onHideAll}
        />
        
        {onOpenTrash && (
          <button
            onClick={onOpenTrash}
            className="flex cursor-pointer items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            style={{
              border: '1px solid rgb(228 228 231 / 1)',
              borderRadius: '6px',
            }}
            title="View Recycle Bin"
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            <span className="hidden sm:inline">Recycle Bin</span>
          </button>
        )}

        <button
          onClick={onPrint}
          className="flex cursor-pointer items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          style={{
            border: '1px solid rgb(228 228 231 / 1)',
            borderRadius: '6px',
          }}
          title="Print"
        >
          <Printer style={{ width: '14px', height: '14px' }} />
          <span className="hidden sm:inline">Print</span>
        </button>

        {onAdd && (
          <button
            onClick={onAdd}
            className="flex cursor-pointer items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: accentColor,
              borderRadius: '6px',
            }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            <span>Add Record</span>
          </button>
        )}
      </div>
    </div>
  );
}