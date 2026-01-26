"use client";

/**
 * BudgetTableToolbar Adapter
 *
 * BACKWARD COMPATIBILITY WRAPPER
 *
 * This component wraps the unified TableToolbar to maintain backward compatibility
 * with existing BudgetTableToolbar imports. No breaking changes.
 *
 * Old code continues to work:
 * ```tsx
 * import { BudgetTableToolbar } from "@/components/ppdo/table/toolbar";
 * <BudgetTableToolbar {...props} />
 * ```
 *
 * The props interface is unchanged. Internally, it uses the new TableToolbar.
 */

import React from "react";
import { Calculator } from "lucide-react";
import { TableToolbar } from "../TableToolbar";
import { BulkAction } from "../types";

export interface BudgetTableToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;

  // Selection
  selectedCount: number;
  onClearSelection: () => void;

  // Column Visibility
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAllColumns: () => void;
  onHideAllColumns: () => void;

  // Export/Print
  onExportCSV: () => void;
  onOpenPrintPreview: () => void;

  // Actions
  isAdmin: boolean;
  pendingRequestsCount: number | undefined;
  onOpenShare: () => void;
  onOpenTrash: () => void;
  onBulkTrash: () => void;
  onAddNew?: () => void;

  // Auto-Calculate Toggle
  onBulkToggleAutoCalculate?: () => void;

  // Draft indicator
  hasPrintDraft?: boolean;

  // UI State
  expandButton?: React.ReactNode;
  accentColor: string;
}

export function BudgetTableToolbar({
  searchQuery,
  onSearchChange,
  searchInputRef,
  selectedCount,
  onClearSelection,
  hiddenColumns,
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns,
  onExportCSV,
  onOpenPrintPreview,
  isAdmin,
  pendingRequestsCount,
  onOpenShare,
  onOpenTrash,
  onBulkTrash,
  onAddNew,
  onBulkToggleAutoCalculate,
  hasPrintDraft,
  expandButton,
  accentColor,
}: BudgetTableToolbarProps) {
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

  return (
    <TableToolbar
      title="Budget Items"
      searchPlaceholder="Search budget items..."
      addButtonLabel="Add New Item"
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchInputRef={searchInputRef}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn}
      onShowAllColumns={onShowAllColumns}
      onHideAllColumns={onHideAllColumns}
      onExportCSV={onExportCSV}
      onOpenPrintPreview={onOpenPrintPreview}
      hasPrintDraft={hasPrintDraft}
      isAdmin={isAdmin}
      pendingRequestsCount={pendingRequestsCount}
      onOpenShare={onOpenShare}
      onOpenTrash={onOpenTrash}
      onBulkTrash={onBulkTrash}
      onAddNew={onAddNew}
      expandButton={expandButton}
      accentColor={accentColor}
      bulkActions={bulkActions.length > 0 ? bulkActions : undefined}
    />
  );
}
