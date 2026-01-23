// app/dashboard/project/[year]/components/hooks/useBudgetTablePrint.ts

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePrintDraft } from "@/app/dashboard/project/[year]/hooks/usePrintDraft";
import { exportToCSV, createBudgetExportConfig } from "@/services";
import { BUDGET_TABLE_COLUMNS } from "@/app/dashboard/project/[year]/constants";
import { BudgetItem } from "@/app/dashboard/project/[year]/types";
import { toast } from "sonner";

/**
 * Manages print preview and export operations
 */
export function useBudgetTablePrint(
  filteredItems: BudgetItem[],
  hiddenColumns: Set<string>,
  setShowPrintPreview: (show: boolean) => void,
  setShowDraftConfirm: (show: boolean) => void
) {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  const { hasDraft, deleteDraft } = usePrintDraft(year);

  /**
   * Handle print preview open
   */
  const handleOpenPrintPreview = useCallback(() => {
    console.group('📍 STEP 1: Print Preview Button Clicked');
    console.log('🔢 Total Items in Table:', filteredItems.length);
    console.table(filteredItems.slice(0, 3)); // Show first 3 items in table format
    console.log('📊 First Item Details:', filteredItems[0]);
    console.log('🔍 Hidden Columns:', Array.from(hiddenColumns));
    console.log('📅 Year:', year);
    console.log('💾 Has Existing Draft:', hasDraft);
    console.groupEnd();

    if (hasDraft) {
      setShowDraftConfirm(true);
    } else {
      setShowPrintPreview(true);
    }
  }, [hasDraft, setShowDraftConfirm, setShowPrintPreview, filteredItems, hiddenColumns, year]);

  /**
   * Load existing draft
   */
  const handleLoadDraft = useCallback(() => {
    setShowPrintPreview(true);
    setShowDraftConfirm(false);
  }, [setShowPrintPreview, setShowDraftConfirm]);

  /**
   * Start fresh (delete draft)
   */
  const handleStartFresh = useCallback(() => {
    deleteDraft();
    setShowPrintPreview(true);
    setShowDraftConfirm(false);
  }, [deleteDraft, setShowPrintPreview, setShowDraftConfirm]);

  /**
   * Handle CSV export
   */
  const handleExportCSV = useCallback(() => {
    try {
      const columns = BUDGET_TABLE_COLUMNS.map(col => ({
        id: col.key,
        label: col.label,
        align: col.align
      }));
      
      exportToCSV(
        filteredItems,
        createBudgetExportConfig(columns, hiddenColumns)
      );
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  }, [filteredItems, hiddenColumns]);

  return {
    year,
    hasDraft,
    handleOpenPrintPreview,
    handleLoadDraft,
    handleStartFresh,
    handleExportCSV,
  };
}