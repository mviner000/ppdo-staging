/**
 * Unified Table Toolbar Types
 * Supports all table types: Budget, Projects, Funds, and future tables
 */

import React from "react";

/**
 * Pluggable bulk action for the toolbar
 * Allows tables to define custom bulk actions without modifying TableToolbar
 */
export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  /** Optional: Show this action only if condition is met */
  showWhen?: (selectedCount: number) => boolean;
  /** Optional: Disable action if condition is met */
  isDisabled?: (selectedCount: number) => boolean;
  /** Optional: Custom CSS variant for Button component */
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
}

/**
 * Column visibility menu configuration
 * Allows custom column menus to be plugged in
 */
export interface ColumnVisibilityMenuProps {
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

/**
 * Main unified table toolbar props
 * Consolidates features from BudgetTableToolbar, ProjectsTableToolbar, and FundsTableToolbar
 */
export interface TableToolbarProps {
  // ═══════════════════════════════════════════════════════════
  // CORE FEATURES (Required in all tables)
  // ═══════════════════════════════════════════════════════════

  /** Current search input value */
  searchQuery: string;

  /** Callback when search input changes */
  onSearchChange: (query: string) => void;

  /** Ref to the search input element */
  searchInputRef: React.RefObject<HTMLInputElement>;

  /** Number of selected items */
  selectedCount: number;

  /** Callback to clear all selections */
  onClearSelection: () => void;

  /** Set of column IDs that are hidden */
  hiddenColumns: Set<string>;

  /** Callback when user toggles column visibility */
  onToggleColumn: (columnId: string, isChecked: boolean) => void;

  /** Callback to show all columns */
  onShowAllColumns: () => void;

  /** Callback to hide all columns */
  onHideAllColumns: () => void;

  /** Callback to move selected items to trash */
  onBulkTrash: () => void;

  // ═══════════════════════════════════════════════════════════
  // UI CUSTOMIZATION
  // ═══════════════════════════════════════════════════════════

  /** Table title (e.g., "Budget Items", "Projects", "Funds") */
  title?: string;

  /** Placeholder text for search input */
  searchPlaceholder?: string;

  /** Label for "Add New" button */
  addButtonLabel?: string;

  /** Accent/primary color for buttons */
  accentColor: string;

  // ═══════════════════════════════════════════════════════════
  // EXPORT & PRINT OPTIONS (Optional)
  // ═══════════════════════════════════════════════════════════

  /** Callback for exporting as CSV */
  onExportCSV?: () => void;

  /** Callback for direct printing (PDF) */
  onPrint?: () => void;

  /** Callback for opening print preview (alternative to onPrint) */
  onOpenPrintPreview?: () => void;

  /** Show draft indicator badge on print button */
  hasPrintDraft?: boolean;

  // ═══════════════════════════════════════════════════════════
  // SHARING & ADMIN FEATURES (Optional)
  // ═══════════════════════════════════════════════════════════

  /** Is current user an admin */
  isAdmin?: boolean;

  /** Number of pending share requests (shows badge) */
  pendingRequestsCount?: number;

  /** Callback to open share/access management modal */
  onOpenShare?: () => void;

  /** Callback to open recycle bin modal */
  onOpenTrash?: () => void;

  // ═══════════════════════════════════════════════════════════
  // BULK ACTIONS (Optional, Pluggable)
  // ═══════════════════════════════════════════════════════════

  /** Array of custom bulk actions */
  bulkActions?: BulkAction[];

  // ═══════════════════════════════════════════════════════════
  // ADVANCED FEATURES (Optional)
  // ═══════════════════════════════════════════════════════════

  /** Callback when search input receives focus */
  onSearchFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /** Custom React node to render in action buttons area */
  expandButton?: React.ReactNode;

  /** Custom column visibility menu component */
  columnVisibilityComponent?: React.ComponentType<ColumnVisibilityMenuProps>;

  /** Add new item button handler */
  onAddNew?: () => void;

  // ═══════════════════════════════════════════════════════════
  // LEGACY SUPPORT (Deprecated - use bulkActions instead)
  // ═══════════════════════════════════════════════════════════

  /** @deprecated Use bulkActions array instead */
  onBulkToggleAutoCalculate?: () => void;

  /** @deprecated Use bulkActions array instead */
  onBulkCategoryChange?: (categoryId: any) => void;

  /** @deprecated Use bulkActions array instead */
  canManageBulkActions?: boolean;

  /** @deprecated Use onSearchFocus instead */
  onSearchFocus_old?: (e: React.FocusEvent<HTMLInputElement>) => void;
}
