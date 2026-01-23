// app/dashboard/project/[year]/types/index.ts

/**
 * Central export point for all budget tracking types
 * 
 * This file serves as the single source of truth for all type imports.
 * Import types from this file rather than individual type files.
 * 
 * Example:
 * import { BudgetItem, BudgetTableProps, UseBudgetTableStateReturn } from '@/app/dashboard/project/[year]/types';
 */

// ============================================================================
// BUDGET TYPES
// ============================================================================
export type {
  BudgetItem,
  BudgetItemFromDB,
  BudgetItemFormData,
  BudgetStatistics,
  BudgetTotals,
  BudgetParticular,
  BudgetStatus,
  BudgetSortField,
} from "./budget.types";

// ============================================================================
// TABLE TYPES
// ============================================================================
export type {
  BudgetTrackingTableProps,
  SortDirection,
  SortField,
  BudgetContextMenuState,
  ColumnConfig,
  FilterState,
} from "./table.types";

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================
export type {
  UseBudgetTableStateReturn,
  UseBudgetTableFiltersReturn,
  UseBudgetTableSelectionReturn,
  UseBudgetTableActionsReturn,
  UseBudgetTablePrintReturn,
  UseBudgetAccessReturn,
  UseBudgetDataReturn,
  UseBudgetMutationsReturn,
  UsePrintDraftReturn,
} from "./hook.types";

// ============================================================================
// ACCESS & USER TYPES
// ============================================================================
export type {
  AccessCheck,
  UserFromList,
  UserRole,
  UserStatus,
  AccessLevel,
} from "./access.types";

// ============================================================================
// FORM & MODAL TYPES
// ============================================================================
export type {
  BudgetItemFormProps,
  ConfirmationModalProps,
  ModalSize,
  ModalProps,
  ViolationData,
  BudgetViolationModalProps,
  BudgetBulkToggleDialogProps,
} from "./form.types";

// ============================================================================
// PRINT & EXPORT TYPES
// ============================================================================
export type {
  ColumnDefinition,
  PrintPreviewModalProps,
  PrintPreviewToolbarProps,
  DraftMetadata,
  DraftInfo,
  StorageInfo,
} from "./print.types";

// ============================================================================
// RE-EXPORT SHARED TYPES (if needed for backward compatibility)
// ============================================================================
// NOTE: Remove these if you want to force migration to new type imports
export type { SortState, ContextMenuState } from "@/lib/shared/types/table.types";