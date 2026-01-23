// app/dashboard/project/[year]/types/form.types.ts

import { BudgetItem } from "./budget.types";

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Budget item form props
 */
export interface BudgetItemFormProps {
  item?: BudgetItem | null;
  onSave: (
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    > & { autoCalculateBudgetUtilized?: boolean }
  ) => void;
  onCancel: () => void;
}

// ============================================================================
// MODAL TYPES
// ============================================================================

/**
 * Confirmation modal props
 */
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning" | "info";
}

/**
 * Modal size options
 */
export type ModalSize = "sm" | "md" | "lg" | "xl";

/**
 * Modal props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: ModalSize;
}

// ============================================================================
// VIOLATION TYPES
// ============================================================================

/**
 * Budget violation data
 */
export interface ViolationData {
  hasViolation: boolean;
  message: string;
  details?: {
    label: string;
    amount: number;
    limit: number;
    diff: number;
  }[];
}

/**
 * Budget violation modal props
 */
export interface BudgetViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  allocationViolation: ViolationData;
  utilizationViolation: ViolationData;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk toggle dialog props
 */
export interface BudgetBulkToggleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (autoCalculate: boolean, reason?: string) => void;
  selectedCount: number;
  isLoading?: boolean;
}