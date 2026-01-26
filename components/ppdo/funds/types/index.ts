// components/ppdo/funds/types/index.ts

/**
 * Shared types for all fund components (Trust Funds, Special Education Funds, Special Health Funds)
 * This module provides generic type definitions that work across different fund types.
 */

// ============================================================================
// GENERIC FUND TYPES
// ============================================================================

/**
 * Generic base fund interface - common fields across all fund types
 */
export interface BaseFund {
    id: string;
    _id?: string;
    projectTitle: string;
    officeInCharge: string;
    dateReceived?: number;
    received: number;
    obligatedPR?: number;
    utilized: number;
    balance: number;
    utilizationRate?: number;
    status?: string;
    remarks?: string;
    year?: number;
    fiscalYear?: number;
    isPinned?: boolean;
    isDeleted?: boolean;
    createdAt?: number;
    updatedAt?: number;
}

/**
 * Generic fund form data
 */
export interface BaseFundFormData {
    projectTitle: string;
    officeInCharge: string;
    dateReceived?: number;
    received: number;
    obligatedPR?: number;
    utilized: number;
    status?: string;
    remarks?: string;
    year?: number;
    fiscalYear?: number;
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export type SortField =
    | "projectTitle"
    | "officeInCharge"
    | "status"
    | "dateReceived"
    | "received"
    | "utilized"
    | "balance"
    | null;

export type SortDirection = "asc" | "desc" | null;

export type ResizableColumn = 'projectTitle' | 'remarks';

export interface ContextMenuState {
    x: number;
    y: number;
    entity: any; // Generic to work with any fund type
}

export interface ColumnWidths {
    projectTitle: number;
    remarks: number;
}

/**
 * Generic table props that work for all fund types
 */
export interface FundsTableProps<T = BaseFund> {
    data: T[];
    onAdd?: (data: any) => void;
    onEdit?: (id: string, data: any) => void;
    onDelete?: (id: string) => void;
    onOpenTrash?: () => void;
    year: number;
    fundType: 'trust' | 'specialEducation' | 'specialHealth';
    title?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    FormComponent?: React.ComponentType<any>;
    activityLogType: 'trustFund' | 'specialEducationFund' | 'specialHealthFund';
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface FundStatistics {
    totalReceived: number;
    totalUtilized: number;
    totalBalance: number;
    totalProjects: number;
    averageUtilizationRate?: number;
}

export interface StatusCounts {
    active?: number;
    not_yet_started: number;
    ongoing: number;
    completed: number;
    not_available: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseFundsDataReturn<T = BaseFund> {
    funds: T[];
    statistics: FundStatistics;
    isLoading: boolean;
}

export interface UseFundsMutationsReturn {
    handleAdd: (data: any) => Promise<void>;
    handleEdit: (id: string, data: any) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
}

// ============================================================================
// YEAR SELECTOR TYPES
// ============================================================================

export interface YearWithStats {
    _id: string;
    year: number;
    description?: string;
    isCurrent: boolean;
    stats: {
        fundCount: number;
        totalReceived: number;
        totalUtilized: number;
        totalBalance: number;
        avgUtilizationRate: number;
    };
}
