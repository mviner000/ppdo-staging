// app/dashboard/project/[year]/types/print.types.ts

import { BudgetItem, BudgetTotals } from "./budget.types";
import { FilterState } from "./table.types";

// ============================================================================
// PRINT & EXPORT TYPES
// ============================================================================

/**
 * Column definition for print/export
 */
export interface ColumnDefinition {
  key: string;
  label: string;
  align: "left" | "center" | "right";
}

/**
 * Print preview modal props
 */
export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetItems: BudgetItem[];
  totals: BudgetTotals;
  columns: ColumnDefinition[];
  hiddenColumns: Set<string>;
  filterState: FilterState;
  year: number;
  particular?: string;
  existingDraft?: any | null;
  onDraftSaved?: (draft: any) => void;
}

/**
 * Print preview toolbar props
 */
export interface PrintPreviewToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedTime: string;
  onBack: () => void;
  onClose: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
  onSaveDraft?: () => void;
}

// ============================================================================
// DRAFT TYPES
// ============================================================================

/**
 * Draft metadata
 */
export interface DraftMetadata {
  drafts: DraftInfo[];
}

/**
 * Draft info for listing
 */
export interface DraftInfo {
  key: string;
  year: number;
  particular?: string;
  timestamp: number;
  pageCount: number;
}

/**
 * Storage info
 */
export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
  draftCount: number;
}