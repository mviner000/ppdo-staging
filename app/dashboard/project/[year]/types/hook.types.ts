// app/dashboard/project/[year]/types/hook.types.ts

import { BudgetItem, BudgetSortField } from "./budget.types";
import { BudgetContextMenuState, SortDirection } from "./table.types";

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useBudgetTableState hook
 */
export interface UseBudgetTableStateReturn {
  modalStates: {
    showAddModal: boolean;
    showEditModal: boolean;
    showDeleteModal: boolean;
    showShareModal: boolean;
    showHideAllWarning: boolean;
    showPrintPreview: boolean;
    showDraftConfirm: boolean;
    showBulkToggleDialog: boolean;
    showTrashModal: boolean;
  };
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowShareModal: (show: boolean) => void;
  setShowHideAllWarning: (show: boolean) => void;
  setShowPrintPreview: (show: boolean) => void;
  setShowDraftConfirm: (show: boolean) => void;
  setShowBulkToggleDialog: (show: boolean) => void;
  setShowTrashModal: (show: boolean) => void;
  hasDraft: boolean;
  showHeaderSkeleton: boolean;
}

/**
 * Return type for useBudgetTableFilters hook
 */
export interface UseBudgetTableFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: string | null;
  sortDirection: SortDirection;
  statusFilter: string[];
  yearFilter: number[];
  hiddenColumns: Set<string>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleSort: (field: string | null) => void;
  toggleStatusFilter: (status: string) => void;
  toggleYearFilter: (year: number) => void;
  clearAllFilters: () => void;
  handleToggleColumn: (columnId: string, isChecked: boolean) => void;
  handleShowAllColumns: () => void;
  handleHideAllColumns: () => void;
  hasActiveFilters: boolean;
  uniqueStatuses: string[];
  uniqueYears: number[];
}

/**
 * Return type for useBudgetTableSelection hook
 */
export interface UseBudgetTableSelectionReturn {
  selectedIds: Set<string>;
  selectedItem: BudgetItem | null;
  setSelectedItem: (item: BudgetItem | null) => void;
  setSelectedIds: (ids: Set<string>) => void;
  handleSelectAll: (checked: boolean) => void;
  handleSelectRow: (id: string, checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

/**
 * Return type for useBudgetTableActions hook
 */
export interface UseBudgetTableActionsReturn {
  contextMenu: BudgetContextMenuState | null;
  setContextMenu: (menu: BudgetContextMenuState | null) => void;
  isTogglingAutoCalculate: boolean;
  handleRowClick: (item: BudgetItem, e: React.MouseEvent) => void;
  handleContextMenu: (e: React.MouseEvent, item: BudgetItem) => void;
  handleEdit: (item: BudgetItem) => void;
  handleDelete: (item: BudgetItem) => void;
  handlePin: (item: BudgetItem) => Promise<void>;
  handleToggleAutoCalculate: (item: BudgetItem, newValue: boolean) => Promise<void>;
  handleBulkTrash: () => Promise<void>;
  handleOpenBulkToggleDialog: () => void;
  handleBulkToggleAutoCalculate: (autoCalculate: boolean, reason?: string) => Promise<void>;
  isBulkToggling: boolean;
}

/**
 * Return type for useBudgetTablePrint hook
 */
export interface UseBudgetTablePrintReturn {
  year: number;
  hasDraft: boolean;
  handleOpenPrintPreview: () => void;
  handleLoadDraft: () => void;
  handleStartFresh: () => void;
  handleExportCSV: () => void;
}

/**
 * Return type for useBudgetAccess hook
 */
export interface UseBudgetAccessReturn {
  accessCheck: any;
  isLoading: boolean;
  canAccess: boolean;
  user?: any;
  department?: any;
}

/**
 * Return type for useBudgetData hook
 */
export interface UseBudgetDataReturn {
  budgetItems: BudgetItem[];
  statistics: any;
  isLoading: boolean;
}

/**
 * Return type for useBudgetMutations hook
 */
export interface UseBudgetMutationsReturn {
  handleAdd: (item: any) => Promise<any>;
  handleEdit: (id: string, item: any) => Promise<any>;
  handleDelete: (id: string) => Promise<any>;
}

/**
 * Return type for usePrintDraft hook
 */
export interface UsePrintDraftReturn {
  draftState: any | null;
  isDirty: boolean;
  hasDraft: boolean;
  lastSavedTime: number | null;
  saveDraft: (draft: any) => boolean;
  loadDraft: () => any | null;
  deleteDraft: () => boolean;
  setIsDirty: (dirty: boolean) => void;
  formattedLastSaved: string;
}