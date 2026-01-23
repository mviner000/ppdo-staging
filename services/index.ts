// services/index.ts

/**
 * Centralized services for Budget and Project modules
 * Provides mutation handling, filtering, and export utilities
 */

// ============================================================================
// MUTATION UTILITIES
// ============================================================================

export {
  handleMutationResponse,
  withMutationHandling,
  createErrorResponse,
  createSuccessResponse,
  isValidMutationResponse,
  extractErrorMessage,
  extractSuccessData,
  type MutationResponse,
} from "./mutations/mutation.utils";

// ============================================================================
// FILTERING SERVICES
// ============================================================================

export {
  applyFilters,
  createBudgetFilterConfig,
  createProjectFilterConfig,
  hasActiveFilters,
  clearAllFilters,
  type FilterConfig,
} from "./filtering/tableFilters";

export {
  ongoingThisYearPreset,
  completedByBudgetPreset,
  delayedByUtilizationPreset,
  specificYearsPreset,
  highUtilizationPreset,
  lowUtilizationPreset,
  budgetExceededPreset,
  showAllPreset,
} from "./filtering/filterPresets";

// ============================================================================
// EXPORT SERVICES
// ============================================================================

export {
  exportToCSV,
  validateExportData,
  createBudgetExportConfig,
  createProjectExportConfig,
  type CSVExportConfig,
} from "./export/csvExport";

export {
  printDocument,
  formatForPrint,
  setupPrintListeners,
  getTablePrintStyles,
  createBudgetPrintConfig,
  createProjectPrintConfig,
  type PrintConfig,
} from "./export/printUtils";