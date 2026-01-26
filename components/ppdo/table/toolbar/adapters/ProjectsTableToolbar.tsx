"use client";

/**
 * ProjectsTableToolbar Adapter
 *
 * BACKWARD COMPATIBILITY WRAPPER
 *
 * This component wraps the unified TableToolbar to maintain backward compatibility
 * with existing ProjectsTableToolbar imports. No breaking changes.
 *
 * Old code continues to work:
 * ```tsx
 * import { ProjectsTableToolbar } from "@/components/ppdo/table/toolbar";
 * <ProjectsTableToolbar {...props} />
 * ```
 *
 * The props interface is unchanged. Internally, it uses the new TableToolbar.
 */

import React from "react";
import { Calculator } from "lucide-react";
import { TableToolbar } from "../TableToolbar";
import { BulkAction } from "../types";

export interface ProjectsTableToolbarProps {
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
  onPrint?: () => void;
  onOpenPrintPreview?: () => void;
  hasPrintDraft?: boolean;

  // Trash
  onOpenTrash?: () => void;
  onBulkTrash: () => void;

  // Share (NEW)
  isAdmin: boolean;
  pendingRequestsCount: number | undefined;
  onOpenShare: () => void;

  // Auto-Calculate Toggle
  onBulkToggleAutoCalculate?: () => void;

  // Add Project
  onAddProject?: () => void;

  // Expand Button
  expandButton?: React.ReactNode;

  accentColor: string;
}

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
  onOpenPrintPreview,
  hasPrintDraft,
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
  // Convert old props to new bulkActions format
  const bulkActions: BulkAction[] = [];

  if (onBulkToggleAutoCalculate) {
    bulkActions.push({
      id: "auto-calculate",
      label: "Toggle Auto-Calculate",
      icon: <Calculator className="w-4 h-4" />,
      onClick: onBulkToggleAutoCalculate,
      showWhen: (count) => count > 0,
    });
  }

  // Note: canManageBulkActions + onBulkCategoryChange would require ProjectBulkActions component
  // This is left as-is for backward compatibility but should be migrated to bulkActions array

  return (
    <TableToolbar
      title="Projects"
      searchPlaceholder="Search projects..."
      addButtonLabel="Add Project"
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onSearchFocus={onSearchFocus}
      searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn}
      onShowAllColumns={onShowAllColumns}
      onHideAllColumns={onHideAllColumns}
      onExportCSV={onExportCSV}
      onPrint={onPrint}
      onOpenPrintPreview={onOpenPrintPreview}
      hasPrintDraft={hasPrintDraft}
      isAdmin={isAdmin}
      pendingRequestsCount={pendingRequestsCount}
      onOpenShare={onOpenShare}
      onOpenTrash={onOpenTrash}
      onBulkTrash={onBulkTrash}
      onAddNew={onAddProject}
      expandButton={expandButton}
      accentColor={accentColor}
      bulkActions={bulkActions.length > 0 ? bulkActions : undefined}
      // Legacy support
      onBulkCategoryChange={onBulkCategoryChange}
      canManageBulkActions={canManageBulkActions}
    />
  );
}
