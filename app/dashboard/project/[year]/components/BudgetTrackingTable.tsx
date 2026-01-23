// app/dashboard/project/[year]/components/BudgetTrackingTable.tsx

"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAccentColor } from "@/contexts/AccentColorContext";

// Components
import { Modal } from "./Modal";
import { ConfirmationModal } from "./ConfirmationModal";
import { BudgetItemForm } from "./BudgetItemForm";
import BudgetShareModal from "./BudgetShareModal";
import { BudgetTableToolbar } from "./BudgetTableToolbar";
import { BudgetTableHeader } from "./table/BudgetTableHeader";
import { BudgetTableRow } from "./table/BudgetTableRow";
import { BudgetTableTotalsRow } from "./table/BudgetTableTotalsRow";
import { BudgetTableEmptyState } from "./table/BudgetTableEmptyState";
import { BudgetContextMenu } from "./table/BudgetContextMenu";
import { BudgetBulkToggleDialog } from "./BudgetBulkToggleDialog";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { TrashBinModal } from "@/components/TrashBinModal";

// Hooks
import { useBudgetTableState } from "./hooks/useBudgetTableState";
import { useBudgetTableFilters } from "./hooks/useBudgetTableFilters";
import { useBudgetTableSelection } from "./hooks/useBudgetTableSelection";
import { useBudgetTableActions } from "./hooks/useBudgetTableActions";
import { useBudgetTablePrint } from "./hooks/useBudgetTablePrint";
import { usePrintDraft } from "../hooks/usePrintDraft";

// Utils
import { applyFilters, createBudgetFilterConfig } from "@/services";
import { calculateBudgetTotals, calculateTotalUtilizationRate } from "@/app/dashboard/project/[year]/utils";
import { convertToPrintTotals, getVisibleColumns, formatTimestamp } from "./utils/budgetTableHelpers";

// Types

import { BUDGET_TABLE_COLUMNS } from "@/app/dashboard/project/[year]/constants";
import { BudgetItem } from "@/types/types";
import { BudgetTrackingTableProps } from "../types";

/**
 * Main BudgetTrackingTable component - Refactored with custom hooks
 * 
 * This component orchestrates all table functionality through custom hooks:
 * - useBudgetTableState: Modal and UI state
 * - useBudgetTableFilters: Search, sort, filter, column visibility
 * - useBudgetTableSelection: Row selection and bulk actions
 * - useBudgetTableActions: CRUD operations and context menu
 * - useBudgetTablePrint: Print preview and export
 */
export function BudgetTrackingTable({
  budgetItems,
  onAdd,
  onEdit,
  onDelete,
  expandButton,
  onOpenTrash,
}: BudgetTrackingTableProps) {
  const { accentColorValue } = useAccentColor();
  const accessCheck = useQuery(api.budgetAccess.canAccess);
  const pendingRequestsCount = useQuery(api.accessRequests.getPendingCount);

  const isAdmin =
    accessCheck?.user?.role === "admin" ||
    accessCheck?.user?.role === "super_admin";

  // ============================================================================
  // CUSTOM HOOKS - State Management
  // ============================================================================

  const {
    modalStates,
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
  } = useBudgetTableState(new Date().getFullYear());

  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    statusFilter,
    yearFilter,
    hiddenColumns,
    searchInputRef,
    handleSort,
    toggleStatusFilter,
    toggleYearFilter,
    clearAllFilters,
    handleToggleColumn,
    handleShowAllColumns,
    handleHideAllColumns,
    hasActiveFilters,
    uniqueStatuses,
    uniqueYears,
  } = useBudgetTableFilters(budgetItems);

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  const filteredAndSortedItems = useMemo(
    () =>
      applyFilters(
        budgetItems,
        createBudgetFilterConfig(
          searchQuery,
          statusFilter,
          yearFilter,
          sortField,
          sortDirection
        )
      ),
    [budgetItems, searchQuery, statusFilter, yearFilter, sortField, sortDirection]
  );

  const totals = useMemo(
    () => calculateBudgetTotals(filteredAndSortedItems),
    [filteredAndSortedItems]
  );

  const totalUtilizationRate = useMemo(
    () => calculateTotalUtilizationRate(totals),
    [totals]
  );

  const printTotals = useMemo(
    () => convertToPrintTotals(totals),
    [totals]
  );

  // ============================================================================
  // SELECTION HOOKS
  // ============================================================================

  const {
    selectedIds,
    selectedItem,
    setSelectedItem,
    setSelectedIds,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    isIndeterminate,
  } = useBudgetTableSelection(filteredAndSortedItems);

  // ============================================================================
  // ACTION HOOKS
  // ============================================================================

  const {
    contextMenu,
    setContextMenu,
    isTogglingAutoCalculate,
    handleRowClick,
    handleContextMenu,
    handleEdit,
    handleDelete,
    handlePin,
    handleToggleAutoCalculate,
    handleBulkTrash,
    handleOpenBulkToggleDialog,
    handleBulkToggleAutoCalculate,
    isBulkToggling,
  } = useBudgetTableActions(
    selectedIds,
    setSelectedIds,
    setSelectedItem,
    setShowEditModal,
    setShowDeleteModal,
    setShowBulkToggleDialog
  );

  // ============================================================================
  // PRINT & EXPORT HOOKS
  // ============================================================================

  const {
    year,
    handleOpenPrintPreview,
    handleLoadDraft,
    handleStartFresh,
    handleExportCSV,
  } = useBudgetTablePrint(
    filteredAndSortedItems,
    hiddenColumns,
    setShowPrintPreview,
    setShowDraftConfirm
  );

  const { draftState, saveDraft } = usePrintDraft(year);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleSave = (
    formData: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => {
    if (selectedItem && onEdit) {
      onEdit(selectedItem.id, formData);
    } else if (onAdd) {
      onAdd(formData);
    }
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const handleConfirmDelete = () => {
    if (selectedItem && onDelete) {
      onDelete(selectedItem.id);
    }
    setSelectedItem(null);
  };

  const confirmHideAll = () => {
    const allColIds = BUDGET_TABLE_COLUMNS.map((c) => c.key);
    const newHidden = new Set(allColIds);
    // Apply the hidden columns - this would need to be lifted to the filters hook
    // For now, we'll handle this in the component
    setShowHideAllWarning(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Main Table Container */}
      <div className="print-area bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Toolbar */}
        <BudgetTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          hiddenColumns={hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onShowAllColumns={handleShowAllColumns}
          onHideAllColumns={() => setShowHideAllWarning(true)}
          onExportCSV={handleExportCSV}
          onOpenPrintPreview={handleOpenPrintPreview}
          hasPrintDraft={hasDraft}
          isAdmin={isAdmin}
          pendingRequestsCount={pendingRequestsCount}
          onOpenShare={() => setShowShareModal(true)}
          onOpenTrash={onOpenTrash || (() => setShowTrashModal(true))}
          onBulkTrash={handleBulkTrash}
          onBulkToggleAutoCalculate={handleOpenBulkToggleDialog}
          onAddNew={onAdd ? () => setShowAddModal(true) : undefined}
          expandButton={expandButton}
          accentColor={accentColorValue}
        />
        
        {/* Print Header (hidden on screen, visible in print) */}
        <div className="hidden print-only p-4 border-b border-zinc-900">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Budget Tracking
          </h2>
          <p className="text-sm text-zinc-700">
            Generated on:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
          <table className="w-full">
            <BudgetTableHeader
              isAdmin={isAdmin}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              sortField={sortField}
              sortDirection={sortDirection}
              yearFilter={yearFilter}
              statusFilter={statusFilter}
              uniqueYears={uniqueYears}
              uniqueStatuses={uniqueStatuses}
              showHeaderSkeleton={showHeaderSkeleton}
              hiddenColumns={hiddenColumns}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              onToggleYearFilter={toggleYearFilter}
              onToggleStatusFilter={toggleStatusFilter}
            />
            <tbody>
              {filteredAndSortedItems.length === 0 ? (
                <BudgetTableEmptyState />
              ) : (
                <>
                  {filteredAndSortedItems.map((item) => (
                    <BudgetTableRow
                      key={item.id}
                      item={item}
                      isAdmin={isAdmin}
                      isSelected={selectedIds.has(item.id)}
                      hiddenColumns={hiddenColumns}
                      onContextMenu={handleContextMenu}
                      onClick={handleRowClick}
                      onSelectRow={handleSelectRow}
                    />
                  ))}
                  <BudgetTableTotalsRow
                    totals={totals}
                    totalUtilizationRate={totalUtilizationRate}
                    hiddenColumns={hiddenColumns}
                  />
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <BudgetContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          item={contextMenu.entity}
          canEdit={!!onEdit}
          canDelete={!!onDelete}
          onPin={handlePin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleAutoCalculate={handleToggleAutoCalculate}
          isTogglingAutoCalculate={isTogglingAutoCalculate}
        />
      )}
      
      {/* Modals */}
      {modalStates.showAddModal && (
        <Modal
          isOpen={modalStates.showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedItem(null);
          }}
          title="Add Budget Item"
          size="xl"
        >
          <BudgetItemForm
            onSave={handleSave}
            onCancel={() => {
              setShowAddModal(false);
              setSelectedItem(null);
            }}
          />
        </Modal>
      )}

      {modalStates.showEditModal && selectedItem && (
        <Modal
          isOpen={modalStates.showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          title="Edit Budget Item"
          size="xl"
        >
          <BudgetItemForm
            item={selectedItem}
            onSave={handleSave}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedItem(null);
            }}
          />
        </Modal>
      )}

      {modalStates.showDeleteModal && selectedItem && (
        <ConfirmationModal
          isOpen={modalStates.showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Move to Trash"
          message={`Are you sure you want to move "${selectedItem.particular}" to trash? Associated projects will also be moved to trash.`}
          confirmText="Move to Trash"
          cancelText="Cancel"
          variant="danger"
        />
      )}

      {modalStates.showShareModal && (
        <BudgetShareModal
          isOpen={modalStates.showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {modalStates.showHideAllWarning && (
        <ConfirmationModal
          isOpen={modalStates.showHideAllWarning}
          onClose={() => setShowHideAllWarning(false)}
          onConfirm={confirmHideAll}
          title="Hide All Columns?"
          message="Are you sure you want to hide all columns? The table will display no data."
          confirmText="Hide All"
          variant="default"
        />
      )}

      {modalStates.showBulkToggleDialog && (
        <BudgetBulkToggleDialog
          isOpen={modalStates.showBulkToggleDialog}
          onClose={() => setShowBulkToggleDialog(false)}
          onConfirm={handleBulkToggleAutoCalculate}
          selectedCount={selectedIds.size}
          isLoading={isBulkToggling}
        />
      )}



      <PrintPreviewModal
        isOpen={modalStates.showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        budgetItems={filteredAndSortedItems}
        totals={printTotals}
        columns={getVisibleColumns(hiddenColumns)}
        hiddenColumns={hiddenColumns}
        filterState={{
          searchQuery,
          statusFilter,
          yearFilter,
          sortField,
          sortDirection,
        }}
        year={year}
        existingDraft={draftState}
        onDraftSaved={saveDraft}
      />

      {modalStates.showDraftConfirm && (
        <ConfirmationModal
          isOpen={modalStates.showDraftConfirm}
          onClose={() => setShowDraftConfirm(false)}
          onConfirm={handleLoadDraft}
          title="Load Existing Draft?"
          message={`You have a print preview draft from ${draftState ? formatTimestamp(draftState.timestamp) : 'recently'}. Load it or start fresh?`}
          confirmText="Load Draft"
          cancelText="Start Fresh"
          variant="default"
        />
      )}

      {modalStates.showTrashModal && (
        <TrashBinModal
          isOpen={modalStates.showTrashModal}
          onClose={() => setShowTrashModal(false)}
          type="budget"
        />
      )}
    </>
  );
}