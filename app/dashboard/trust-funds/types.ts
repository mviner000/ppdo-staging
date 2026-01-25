// app/dashboard/trust-funds/types.ts

// Re-export the main TrustFund type from global types
export type { TrustFund, TrustFundFormData } from "@/types/trustFund.types";

// Table-specific types only
export type SortField = "projectTitle" | "officeInCharge" | "status" | "dateReceived" | "received" | "utilized" | "balance" | null;
export type SortDirection = "asc" | "desc" | null;
export type ResizableColumn = 'projectTitle' | 'remarks';

export interface ContextMenuState {
  x: number;
  y: number;
  entity: any; // Use any here to avoid circular dependency
}

export interface ColumnWidths {
  projectTitle: number;
  remarks: number;
}

export interface TrustFundsTableProps {
  data: any[]; // Use any[] here to avoid type conflicts
  onAdd?: (data: any) => void;
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onOpenTrash?: () => void;
  year: number;
}