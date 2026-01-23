// app/dashboard/project/[year]/components/hooks/useBudgetTableState.ts

import { useState, useEffect } from "react";
import { usePrintDraft } from "@/app/dashboard/project/[year]/hooks/usePrintDraft";
import { STORAGE_KEYS, TIMEOUTS } from "@/app/dashboard/project/[year]/constants";
import { UseBudgetTableStateReturn } from "../../types";

/**
 * Manages all modal and UI state for the budget table
 * Consolidates show/hide state for all dialogs and panels
 */
export function useBudgetTableState(year: number): UseBudgetTableStateReturn {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHideAllWarning, setShowHideAllWarning] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [showBulkToggleDialog, setShowBulkToggleDialog] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);

  // UI states
  const [showHeaderSkeleton, setShowHeaderSkeleton] = useState(true);

  // Draft state
  const { hasDraft } = usePrintDraft(year);

  // Check for "open add modal" flag from localStorage
  useEffect(() => {
    try {
      const shouldOpenAdd =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEYS.BUDGET_OPEN_ADD)
          : null;
      if (shouldOpenAdd === "true") {
        setShowAddModal(true);
        localStorage.removeItem(STORAGE_KEYS.BUDGET_OPEN_ADD);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Hide header skeleton after timeout
  useEffect(() => {
    const timer = setTimeout(
      () => setShowHeaderSkeleton(false),
      TIMEOUTS.HEADER_SKELETON
    );
    return () => clearTimeout(timer);
  }, []);

  return {
    modalStates: {
      showAddModal,
      showEditModal,
      showDeleteModal,
      showShareModal,
      showHideAllWarning,
      showPrintPreview,
      showDraftConfirm,
      showBulkToggleDialog,
      showTrashModal,
    },
    setShowAddModal,
    setShowEditModal,
    setShowDeleteModal,
    setShowShareModal,
    setShowHideAllWarning,
    setShowPrintPreview,
    setShowDraftConfirm,
    setShowBulkToggleDialog,
    setShowTrashModal,
    hasDraft,
    showHeaderSkeleton,
  };
}