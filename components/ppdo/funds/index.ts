// components/ppdo/funds/index.ts

/**
 * Main export file for reusable funds components
 * Import from this file to use shared funds functionality across all fund types
 * (Trust Funds, Special Education Funds, Special Health Funds)
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
    BaseFund,
    BaseFundFormData,
    SortField,
    SortDirection,
    ResizableColumn,
    ContextMenuState,
    ColumnWidths,
    FundsTableProps,
    FundStatistics,
    StatusCounts,
    UseFundsDataReturn,
    UseFundsMutationsReturn,
    YearWithStats,
} from "./types";

// ============================================================================
// CONSTANTS
// ============================================================================

export {
    AVAILABLE_COLUMNS,
    DEFAULT_COLUMN_WIDTHS,
    MIN_COLUMN_WIDTH,
    STATUS_COLUMN_WIDTH,
    STATUS_CONFIG,
    STATUS_CLASSES,
    FUND_TYPE_CONFIG,
    type FundType,
} from "./constants";

// ============================================================================
// UTILITIES
// ============================================================================

export {
    formatCurrency,
    formatDate,
    formatStatus,
    getStatusClassName,
    truncateText,
    formatPercentage,
    calculateUtilizationRate,
    calculateTotals,
    exportToCSV,
    printTable,
    createFundSlug,
    extractIdFromSlug,
} from "./utils";

// ============================================================================
// HOOKS
// ============================================================================

export { useFundsData } from "./hooks/useFundsData";
export { useFundsMutations } from "./hooks/useFundsMutations";
export { useColumnWidths } from "./hooks/useColumnWidths";
export { useColumnResize } from "./hooks/useColumnResize";
export { useTableSort } from "./hooks/useTableSort";
export { useTableFilter } from "./hooks/useTableFilter";
export { useTableSelection } from "./hooks/useTableSelection";

// ============================================================================
// COMPONENTS
// ============================================================================

// Main Table Component
// Main Table Component
export { FundsTable } from "./components/FundsTable";
export { FundsPageHeader } from "./components/FundsPageHeader";
export { FundsStatistics } from "./components/FundsStatistics";
export { FundForm } from "./form/FundForm";

// Table Sub-components
export { FundsTableColgroup } from "./components/table/FundsTableColgroup";
export { FundsTableHeader } from "./components/table/FundsTableHeader";
export { FundsTableBody } from "./components/table/FundsTableBody";
export { FundsTableRow } from "./components/table/FundsTableRow";
export { FundsTableTotalRow } from "./components/table/FundsTableTotalRow";

// Toolbar
export { FundsTableToolbar } from "./components/toolbar/FundsTableToolbar";

// Context Menu
export { FundsContextMenu } from "./components/context-menu/FundsContextMenu";

// Modals
export { PrintOrientationModal } from "./components/modals/PrintOrientationModal";

