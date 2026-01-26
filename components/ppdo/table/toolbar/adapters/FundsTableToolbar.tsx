"use client";

/**
 * FundsTableToolbar Adapter
 *
 * BACKWARD COMPATIBILITY WRAPPER
 *
 * This component wraps the unified TableToolbar to maintain backward compatibility
 * with existing FundsTableToolbar imports. No breaking changes.
 *
 * Old code continues to work:
 * ```tsx
 * import { FundsTableToolbar } from "@/components/ppdo/table/toolbar";
 * <FundsTableToolbar {...props} />
 * ```
 *
 * The props interface is unchanged. Internally, it uses the new TableToolbar.
 */

import React from "react";
import { TableToolbar } from "../TableToolbar";

export interface FundsTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  selectedCount: number;
  onClearSelection: () => void;
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAllColumns: () => void;
  onHideAllColumns: () => void;
  onExportCSV: () => void;
  onPrint?: () => void;
  onOpenPrintPreview?: () => void;
  hasPrintDraft?: boolean;
  isAdmin: boolean;
  onOpenTrash?: () => void;
  onBulkTrash: () => void;
  onAddNew?: () => void;
  accentColor: string;
  title?: string;
  searchPlaceholder?: string;
}

export function FundsTableToolbar({
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
  onPrint,
  onOpenPrintPreview,
  hasPrintDraft,
  isAdmin,
  onOpenTrash,
  onBulkTrash,
  onAddNew,
  accentColor,
  title = "Funds",
  searchPlaceholder = "Search funds...",
}: FundsTableToolbarProps) {
  return (
    <TableToolbar
      title={title}
      searchPlaceholder={searchPlaceholder}
      addButtonLabel="Add New Item"
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
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
      onOpenTrash={onOpenTrash}
      onBulkTrash={onBulkTrash}
      onAddNew={onAddNew}
      accentColor={accentColor}
    />
  );
}
