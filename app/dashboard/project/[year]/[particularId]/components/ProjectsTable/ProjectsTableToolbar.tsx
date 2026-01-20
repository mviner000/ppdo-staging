// app/dashboard/project/budget/[particularId]/components/ProjectsTable/ProjectsTableToolbar.tsx

import React from "react";
import { 
  Search, 
  X, 
  Trash2, 
  Download, 
  Printer, 
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnVisibilityMenu } from "./ColumnVisibilityMenu";
import { ProjectBulkActions } from "./ProjectBulkActions";

interface ProjectsTableToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  
  // Selection
  selectedCount: number;
  onClearSelection: () => void;
  
  // Bulk Actions
  canManageBulkActions: boolean;
  onBulkCategoryChange: (categoryId: any) => void;
  
  // Column Visibility
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAllColumns: () => void;
  onHideAllColumns: () => void;
  
  // Export/Print
  onExportCSV: () => void;
  onPrint: () => void;
  
  // Trash
  onOpenTrash?: () => void;
  onBulkTrash: () => void;
  
  // Share (NEW)
  isAdmin: boolean;
  pendingRequestsCount: number | undefined;
  onOpenShare: () => void;
  
  // 🆕 NEW: Auto-Calculate Toggle
  onBulkToggleAutoCalculate?: () => void;
  
  // Add Project
  onAddProject?: () => void;
  
  // Expand Button
  expandButton?: React.ReactNode;
  
  accentColor: string;
}

/**
 * Main toolbar for the projects table
 * Contains search, filters, bulk actions, and primary actions
 */
export function ProjectsTableToolbar({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  searchInputRef,
  selectedCount,
  onClearSelection,
  canManageBulkActions,
  onBulkCategoryChange,
  hiddenColumns,
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns,
  onExportCSV,
  onPrint,
  onOpenTrash,
  onBulkTrash,
  isAdmin,
  pendingRequestsCount,
  onOpenShare,
  onBulkToggleAutoCalculate,
  onAddProject,
  expandButton,
  accentColor,
}: ProjectsTableToolbarProps) {
  return (
    <div className="h-16 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between no-print gap-4">
      
      {/* Left: Title or Selection Info */}
      <div className="flex items-center gap-3 min-w-[200px]">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 h-7">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              {selectedCount} Selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-zinc-500 text-xs h-7 hover:text-zinc-900"
            >
              Clear
            </Button>
          </div>
        ) : (
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Projects
          </h3>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            ref={searchInputRef}
            onFocus={onSearchFocus}
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-9 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Column Visibility */}
        <ColumnVisibilityMenu
          hiddenColumns={hiddenColumns}
          onToggleColumn={onToggleColumn}
          onShowAll={onShowAllColumns}
          onHideAll={onHideAllColumns}
        />

        {/* Bulk Category Actions */}
        {selectedCount > 0 && canManageBulkActions && (
          <ProjectBulkActions
            selectedCount={selectedCount}
            onCategoryChange={onBulkCategoryChange}
          />
        )}

        {/* 🆕 NEW: Bulk Auto-Calculate Toggle (only when items are selected) */}
        {selectedCount > 0 && onBulkToggleAutoCalculate && (
          <Button
            onClick={onBulkToggleAutoCalculate}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Calculator className="w-4 h-4" />
            Toggle Auto-Calculate
          </Button>
        )}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Trash Button */}
        <Button
          onClick={selectedCount > 0 ? onBulkTrash : onOpenTrash}
          variant={selectedCount > 0 ? "destructive" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {selectedCount > 0 ? `To Trash (${selectedCount})` : 'Recycle Bin'}
        </Button>

        {/* Export/Print Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export / Print
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onPrint} className="cursor-pointer">
              <Printer className="w-4 h-4 mr-2" /> Print PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-2">
              <span className="text-[10px] text-zinc-500 leading-tight block">
                Note: Exports and prints are based on the currently shown/hidden columns.
              </span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share Button (Admin Only) */}
        {isAdmin && (
          <Button
            onClick={onOpenShare}
            variant="secondary"
            size="sm"
            className="relative gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            title="Share & Manage Access"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
            {pendingRequestsCount !== undefined &&
              pendingRequestsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequestsCount > 9
                    ? "9+"
                    : pendingRequestsCount}
                </span>
              )}
          </Button>
        )}

        {/* Expand Button (if provided) */}
        {expandButton}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Add Project Button */}
        {onAddProject && (
          <Button
            onClick={onAddProject}
            size="sm"
            className="gap-2 text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            <span className="text-lg leading-none mb-0.5">+</span>
            Add Project
          </Button>
        )}
      </div>
    </div>
  );
}