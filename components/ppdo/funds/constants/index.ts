// components/ppdo/funds/constants/index.ts

/**
 * Shared constants for all fund components
 */

// ============================================================================
// TABLE COLUMNS
// ============================================================================

export const AVAILABLE_COLUMNS = [
    { id: "projectTitle", label: "Project Title", resizable: true },
    { id: "officeInCharge", label: "Office In-Charge" },
    { id: "status", label: "Status" },
    { id: "dateReceived", label: "Date Received" },
    { id: "received", label: "Received" },
    { id: "obligatedPR", label: "Obligated PR" },
    { id: "utilized", label: "Utilized" },
    { id: "utilizationRate", label: "Utilization %" },
    { id: "balance", label: "Balance" },
    { id: "remarks", label: "Remarks", resizable: true },
] as const;

// ============================================================================
// COLUMN WIDTHS
// ============================================================================

export const DEFAULT_COLUMN_WIDTHS = {
    projectTitle: 260,
    remarks: 200,
} as const;

export const MIN_COLUMN_WIDTH = 150;

export const STATUS_COLUMN_WIDTH = 140;

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

export const STATUS_CONFIG = {
    not_available: {
        label: "N/A",
        className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        dotColor: "bg-zinc-400"
    },
    not_yet_started: {
        label: "Not Yet Started",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        dotColor: "bg-zinc-400",
        hidden: true // Legacy - hidden from UI, will be migrated to on_process
    },
    on_process: {
        label: "On Process",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        dotColor: "bg-amber-500"
    },
    ongoing: {
        label: "Ongoing",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        dotColor: "bg-zinc-500"
    },
    completed: {
        label: "Completed",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        dotColor: "bg-zinc-600"
    },
} as const;

export const STATUS_CLASSES = {
    not_available: "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
    not_yet_started: "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
    on_process: "bg-amber-100/50 text-amber-700 dark:bg-amber-800/50 dark:text-amber-300",
    ongoing: "bg-zinc-200/50 text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-200",
    completed: "bg-zinc-300/50 text-zinc-900 dark:bg-zinc-600/50 dark:text-zinc-100",
    active: "bg-zinc-400/50 text-zinc-900 dark:bg-zinc-500/50 dark:text-zinc-100",
} as const;

// ============================================================================
// FUND TYPE CONFIGS
// ============================================================================

/**
 * Configuration for different fund types
 */
export const FUND_TYPE_CONFIG = {
    trustFund: {
        singular: "Trust Fund",
        plural: "Trust Funds",
        storageKey: "trustFundsTableColumnWidths",
        apiEndpoint: "trustFunds",
        activityLogType: "trustFund" as const,
    },
    specialEducationFund: {
        singular: "Special Education Fund",
        plural: "Special Education Funds",
        storageKey: "specialEducationFundsTableColumnWidths",
        apiEndpoint: "specialEducationFunds",
        activityLogType: "specialEducationFund" as const,
    },
    specialHealthFund: {
        singular: "Special Health Fund",
        plural: "Special Health Funds",
        storageKey: "specialHealthFundsTableColumnWidths",
        apiEndpoint: "specialHealthFunds",
        activityLogType: "specialHealthFund" as const,
    },
} as const;

export type FundType = keyof typeof FUND_TYPE_CONFIG;
