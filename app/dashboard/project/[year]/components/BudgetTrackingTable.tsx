// app/dashboard/project/budget/components/BudgetTrackingTable.tsx

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAccentColor } from "@/contexts/AccentColorContext";
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
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  BudgetItem,
  ContextMenuState,
  SortField,
  SortDirection,
  BudgetContextMenuState,
} from "@/app/dashboard/project/[year]/types";
import {
  calculateBudgetTotals,
  calculateTotalUtilizationRate,
  extractUniqueStatuses,
  extractUniqueYears,
} from "@/app/dashboard/project/[year]/utils";
import {
  applyFilters,
  createBudgetFilterConfig,
  exportToCSV,
  createBudgetExportConfig,
  printDocument,
  createBudgetPrintConfig,
  withMutationHandling,
} from "@/services";
import { STORAGE_KEYS, TIMEOUTS, BUDGET_TABLE_COLUMNS } from "@/app/dashboard/project/[year]/constants";

interface BudgetTrackingTableProps {
  budgetItems: BudgetItem[];
  onAdd?: (
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => void;
  onEdit?: (
    id: string,
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => void;
  onDelete?: (id: string) => void;
  expandButton?: React.ReactNode;
  onOpenTrash?: () => void;
}

export function BudgetTrackingTable({
  budgetItems,
  onAdd,
  onEdit,
  onDelete,
  expandButton,
  onOpenTrash,
}: BudgetTrackingTableProps) {
  const { accentColorValue } = useAccentColor();
  const router = useRouter();
  const accessCheck = useQuery(api.budgetAccess.canAccess);
  const pendingRequestsCount = useQuery(api.accessRequests.getPendingCount);
  const togglePinBudgetItem = useMutation(api.budgetItems.togglePin);
  const bulkMoveToTrash = useMutation(api.budgetItems.bulkMoveToTrash);
  
  // 🆕 NEW MUTATIONS: Auto-Calculate Toggle
  const toggleAutoCalculate = useMutation(api.budgetItems.toggleAutoCalculate);
  const bulkToggleAutoCalculate = useMutation(api.budgetItems.bulkToggleAutoCalculate);

  // ============================================================================
  // MODAL STATES
  // ============================================================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHideAllWarning, setShowHideAllWarning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // 🆕 NEW MODAL STATE: Bulk Auto-Calculate Toggle Dialog
  const [showBulkToggleDialog, setShowBulkToggleDialog] = useState(false);
  const [isBulkToggling, setIsBulkToggling] = useState(false);

  // ============================================================================
  // CONTEXT MENU STATE
  // ============================================================================
  const [contextMenu, setContextMenu] = useState<BudgetContextMenuState | null>(null);
  // 🆕 NEW STATE: Track if currently toggling auto-calculate in context menu
  const [isTogglingAutoCalculate, setIsTogglingAutoCalculate] = useState(false);

  // ============================================================================
  // FILTER & SORT STATES
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [showHeaderSkeleton, setShowHeaderSkeleton] = useState(true);

  // ============================================================================
  // COLUMN VISIBILITY STATE
  // ============================================================================
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null!);

  const isAdmin =
    accessCheck?.user?.role === "admin" ||
    accessCheck?.user?.role === "super_admin";

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const checkDraft = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.BUDGET_FORM_DRAFT);
        setHasDraft(!!saved);
      } catch (error) {
        setHasDraft(false);
      }
    };

    checkDraft();
    const interval = setInterval(checkDraft, 1000);
    return () => clearInterval(interval);
  }, [showAddModal]);

  useEffect(() => {
    // Priority 1: Read from URL query params
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const yearParam = urlParams.get("year");

      if (yearParam) {
        const year = parseInt(yearParam);
        if (!isNaN(year)) {
          setYearFilter([year]);
          return;
        }
      }

      // Priority 2: Fallback to sessionStorage
      const sessionYear = sessionStorage.getItem(
        STORAGE_KEYS.BUDGET_YEAR_PREFERENCE
      );
      if (sessionYear) {
        const year = parseInt(sessionYear);
        if (!isNaN(year)) {
          setYearFilter([year]);
        }
      }
    }
  }, []);

  // Sync yearFilter to URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (yearFilter.length > 0) {
        const params = new URLSearchParams();
        yearFilter.forEach((year) => params.append("year", String(year)));

        const currentParams = new URLSearchParams(window.location.search);
        currentParams.forEach((value, key) => {
          if (key !== "year") {
            params.append(key, value);
          }
        });

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
      } else {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("year");

        if (currentParams.toString()) {
          const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
          window.history.replaceState(null, "", newUrl);
        } else {
          const newUrl = window.location.pathname;
          window.history.replaceState(null, "", newUrl);
        }
      }
    }
  }, [yearFilter]);

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
    } catch (_) {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setContextMenu(null);
    };

    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => setShowHeaderSkeleton(false),
      TIMEOUTS.HEADER_SKELETON
    );
    return () => clearTimeout(t);
  }, []);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const uniqueStatuses = useMemo(
    () => extractUniqueStatuses(budgetItems),
    [budgetItems]
  );

  const uniqueYears = useMemo(
    () => extractUniqueYears(budgetItems),
    [budgetItems]
  );

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
    [
      budgetItems,
      searchQuery,
      statusFilter,
      yearFilter,
      sortField,
      sortDirection,
    ]
  );

  const totals = useMemo(
    () => calculateBudgetTotals(filteredAndSortedItems),
    [filteredAndSortedItems]
  );

  const totalUtilizationRate = useMemo(
    () => calculateTotalUtilizationRate(totals),
    [totals]
  );

  const isAllSelected =
    filteredAndSortedItems.length > 0 &&
    selectedIds.size === filteredAndSortedItems.length;

  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < filteredAndSortedItems.length;

  const hasActiveFilters = Boolean(
    searchQuery ||
      statusFilter.length > 0 ||
      yearFilter.length > 0 ||
      sortField
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRowClick = (item: BudgetItem, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    
    // Get current year from URL params
    const pathSegments = window.location.pathname.split('/');
    const yearIndex = pathSegments.findIndex(seg => seg === 'project') + 1;
    const currentYear = pathSegments[yearIndex];
    
    router.push(
      `/dashboard/project/${currentYear}/${encodeURIComponent(item.particular)}`
    );
  };

  const handleContextMenu = (e: React.MouseEvent, item: BudgetItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      entity: item,
    });
  };

  const handleEdit = (item: BudgetItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
    setContextMenu(null);
  };

  const handleDelete = (item: BudgetItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
    setContextMenu(null);
  };

  const handlePin = async (item: BudgetItem) => {
    try {
      await togglePinBudgetItem({ id: item.id as Id<"budgetItems"> });
      toast.success(
        item.isPinned ? "Budget item unpinned" : "Budget item pinned to top"
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to pin/unpin item");
    }
    setContextMenu(null);
  };

  // 🆕 NEW HANDLER: Toggle Auto-Calculate from Context Menu
  const handleToggleAutoCalculate = async (item: BudgetItem, newValue: boolean) => {
    setIsTogglingAutoCalculate(true);
    setContextMenu(null);
    
    try {
      const toastId = toast.loading("Updating auto-calculate mode...");
      
      await toggleAutoCalculate({
        id: item.id as Id<"budgetItems">,
        autoCalculate: newValue,
      });
      
      toast.dismiss(toastId);
      toast.success(`Switched to ${newValue ? 'auto-calculate' : 'manual'} mode`, {
        description: newValue 
          ? "Budget utilized will be calculated from children" 
          : "You can now enter budget utilized manually"
      });
    } catch (error) {
      console.error("Error toggling auto-calculate:", error);
      toast.error("Failed to toggle auto-calculate", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsTogglingAutoCalculate(false);
    }
  };

  // 🆕 NEW HANDLER: Open Bulk Toggle Dialog
  const handleOpenBulkToggleDialog = () => {
    if (selectedIds.size === 0) {
      toast.error("No items selected");
      return;
    }
    setShowBulkToggleDialog(true);
  };

  // 🆕 NEW HANDLER: Bulk Toggle Auto-Calculate
  const handleBulkToggleAutoCalculate = async (autoCalculate: boolean, reason?: string) => {
    setIsBulkToggling(true);
    
    try {
      const result = await bulkToggleAutoCalculate({
        ids: Array.from(selectedIds) as Id<"budgetItems">[],
        autoCalculate,
        reason,
      });
      
      const count = (result as any).count || selectedIds.size;
      
      toast.success(`Updated ${count} budget item(s)`, {
        description: `All items switched to ${autoCalculate ? 'auto-calculate' : 'manual'} mode`
      });
      
      setSelectedIds(new Set());
      setShowBulkToggleDialog(false);
    } catch (error) {
      console.error("Error bulk toggling auto-calculate:", error);
      toast.error("Failed to update items", {
        description: error instanceof Error ? error.message : "Some items could not be updated"
      });
    } finally {
      setIsBulkToggling(false);
    }
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleYearFilter = (year: number) => {
    setYearFilter((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setYearFilter([]);
    setSortField(null);
    setSortDirection(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAndSortedItems.map((item) => item.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkTrash = async () => {
    if (selectedIds.size === 0) {
      toast.error("No items selected");
      return;
    }
    const success = await withMutationHandling(
      () =>
        bulkMoveToTrash({
          ids: Array.from(selectedIds) as Id<"budgetItems">[],
        }),
      {
        loadingMessage: `Moving ${selectedIds.size} item(s) to trash...`,
        successMessage: `Successfully moved ${selectedIds.size} item(s) to trash`,
        errorMessage: "Failed to move items to trash",
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      }
    );
  };

  // ============================================================================
  // COLUMN VISIBILITY HANDLERS
  // ============================================================================

  const handleToggleColumn = (columnId: string, isChecked: boolean) => {
    const newHidden = new Set(hiddenColumns);
    if (isChecked) {
      newHidden.delete(columnId);
    } else {
      newHidden.add(columnId);
    }
    setHiddenColumns(newHidden);
  };

  const handleShowAllColumns = () => {
    setHiddenColumns(new Set());
  };

  const handleHideAllColumns = () => {
    setShowHideAllWarning(true);
  };

  const confirmHideAll = () => {
    const allColIds = BUDGET_TABLE_COLUMNS.map((c) => c.key);
    setHiddenColumns(new Set(allColIds));
    setShowHideAllWarning(false);
  };

  // ============================================================================
  // EXPORT/PRINT HANDLERS
  // ============================================================================

  const handleExportCSV = () => {
    try {
      // Convert BUDGET_TABLE_COLUMNS to the format expected by exportToCSV
      const columns = BUDGET_TABLE_COLUMNS.map(col => ({
        id: col.key,
        label: col.label,
        align: col.align
      }));
      
      exportToCSV(
        filteredAndSortedItems,
        createBudgetExportConfig(columns, hiddenColumns)
      );
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  };

  const handlePrint = () => {
    printDocument(createBudgetPrintConfig());
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="print-area bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Toolbar - Now with Bulk Auto-Calculate Toggle */}
        <BudgetTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          hiddenColumns={hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onShowAllColumns={handleShowAllColumns}
          onHideAllColumns={handleHideAllColumns}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          isAdmin={isAdmin}
          pendingRequestsCount={pendingRequestsCount}
          onOpenShare={() => setShowShareModal(true)}
          onOpenTrash={onOpenTrash || (() => {})}
          onBulkTrash={handleBulkTrash}
          onBulkToggleAutoCalculate={handleOpenBulkToggleDialog}
          onAddNew={onAdd ? () => setShowAddModal(true) : undefined}
          expandButton={expandButton}
          accentColor={accentColorValue}
        />
        
        {/* Print Header */}
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
                  {filteredAndSortedItems.map((item: BudgetItem) => (
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
      
      {/* Context Menu - Now with Auto-Calculate Toggle */}
      {contextMenu && (
        <BudgetContextMenu
          ref={contextMenuRef}
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
      
      {/* 🆕 NEW MODAL: Bulk Auto-Calculate Toggle Dialog */}
      <BudgetBulkToggleDialog
        isOpen={showBulkToggleDialog}
        onClose={() => setShowBulkToggleDialog(false)}
        onConfirm={handleBulkToggleAutoCalculate}
        selectedCount={selectedIds.size}
        isLoading={isBulkToggling}
      />
      
      {/* Modals */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
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
      {showEditModal && selectedItem && (
        <Modal
          isOpen={showEditModal}
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
      {showDeleteModal && selectedItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
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
      {showShareModal && (
        <BudgetShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
      
      {/* Hide All Columns Warning */}
      <ConfirmationModal
        isOpen={showHideAllWarning}
        onClose={() => setShowHideAllWarning(false)}
        onConfirm={confirmHideAll}
        title="Hide All Columns?"
        message="Are you sure you want to hide all columns? The table will display no data."
        confirmText="Hide All"
        variant="default"
      />
    </>
  );
}