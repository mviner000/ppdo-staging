// app/dashboard/project/[year]/components/index.ts

// ============================================================================
// PAGE HEADERS
// ============================================================================
export { BudgetPageHeader } from "./BudgetPageHeader";
export { YearBudgetPageHeader } from "./YearBudgetPageHeader";

// ============================================================================
// MAIN TABLE COMPONENT
// ============================================================================
export { BudgetTrackingTable } from "./BudgetTrackingTable";

// ============================================================================
// FORMS & INPUTS
// ============================================================================
export { BudgetItemForm } from "./BudgetItemForm";
export { BudgetParticularCombobox } from "./BudgetParticularCombobox";

// ============================================================================
// MODALS & DIALOGS
// ============================================================================
export { Modal } from "./BudgetModal";
export { ConfirmationModal } from "./BudgetConfirmationModal";
export { ExpandModal } from "./BudgetExpandModal";
export { BudgetBulkToggleDialog } from "./BudgetBulkToggleDialog";
export { BudgetViolationModal } from "./BudgetViolationModal";
export { default as BudgetShareModal } from "./BudgetShareModal";

// ============================================================================
// STATISTICS & VISUALIZATION
// ============================================================================
export { default as BudgetStatistics } from "./BudgetStatistics";

// ============================================================================
// TABLE COMPONENTS
// ============================================================================
export { BudgetTableToolbar } from "@/components/ppdo/table/toolbar";
export { BudgetTableHeader } from "./table/BudgetTableHeader";
export { BudgetTableRow } from "./table/BudgetTableRow";
export { BudgetTableTotalsRow } from "./table/BudgetTableTotalsRow";
export { BudgetTableEmptyState } from "./table/BudgetTableEmptyState";
export { BudgetContextMenu } from "./table/BudgetContextMenu";
export { BudgetColumnVisibilityMenu } from "./table/BudgetColumnVisibilityMenu";

// ============================================================================
// CUSTOM HOOKS - DATA
// ============================================================================
export { useBudgetAccess } from "./hooks/useBudgetAccess";
export { useBudgetData } from "./hooks/useBudgetData";
export { useBudgetMutations } from "./hooks/useBudgetMutations";

// ============================================================================
// CUSTOM HOOKS - TABLE STATE & ACTIONS
// ============================================================================
export { useBudgetTableState } from "./hooks/useBudgetTableState";
export { useBudgetTableFilters } from "./hooks/useBudgetTableFilters";
export { useBudgetTableSelection } from "./hooks/useBudgetTableSelection";
export { useBudgetTableActions } from "./hooks/useBudgetTableActions";
export { useBudgetTablePrint } from "./hooks/useBudgetTablePrint";

// ============================================================================
// CUSTOM HOOKS - PRINT PREVIEW
// ============================================================================
export { usePrintPreviewState } from "./hooks/usePrintPreviewState";
export { usePrintPreviewActions } from "./hooks/usePrintPreviewActions";
export { usePrintPreviewDraft } from "./hooks/usePrintPreviewDraft";
export { usePrintPreviewInitialization } from "./hooks/usePrintPreviewInitialization";
export { useTableCanvasResize } from "./hooks/useTableCanvasResize";

// ============================================================================
// UTILITIES
// ============================================================================
export {
  extractYearFromURL,
  isValidYear,
  convertToPrintTotals,
  getVisibleColumns,
  formatTimestamp,
} from "./utils/budgetTableHelpers";

// ============================================================================
// SHARED COMPONENTS (from ppdo)
// ============================================================================
export { LoadingState } from "@/components/ppdo/LoadingState";