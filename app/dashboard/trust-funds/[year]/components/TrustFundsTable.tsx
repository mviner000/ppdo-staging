// app/dashboard/trust-funds/[year]/components/TrustFundsTable.tsx

"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { Table } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/app/dashboard/project/[year]/components/Modal";
import { ConfirmationModal } from "@/app/dashboard/project/[year]/components/ConfirmationModal";
import { TrustFundForm } from "./TrustFundForm";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";
import { TrustFundTableToolbar } from "./TrustFundTableToolbar";
import { TrustFundContextMenu } from "./TrustFundContextMenu";
import { PrintOrientationModal } from "./PrintOrientationModal";
import { TrustFundsTableColgroup } from "./table/TrustFundsTableColgroup";
import { TrustFundsTableHeader } from "./table/TrustFundsTableHeader";
import { TrustFundsTableBody } from "./table/TrustFundsTableBody";

// Import TrustFund from global types
import { TrustFund } from "@/types/trustFund.types";
// Import table-specific types from local types
import { TrustFundsTableProps, ContextMenuState } from "../../types";
import { exportToCSV, printTable, calculateTotals } from "../../utils";
import { useColumnWidths } from "../../hooks/useColumnWidths";
import { useColumnResize } from "../../hooks/useColumnResize";
import { useTableSort } from "../../hooks/useTableSort";
import { useTableFilter } from "../../hooks/useTableFilter";
import { useTableSelection } from "../../hooks/useTableSelection";

export function TrustFundsTable({ data, onAdd, onEdit, onDelete, onOpenTrash, year }: TrustFundsTableProps) {
  const { accentColorValue } = useAccentColor();
  
  // Mutations
  const togglePin = useMutation(api.trustFunds.togglePin);
  const bulkMoveToTrash = useMutation(api.trustFunds.bulkMoveToTrash);
  const updateStatus = useMutation(api.trustFunds.updateStatus);
  
  // Current user for permissions
  const currentUser = useQuery(api.users.current);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrustFund | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Activity Log State
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [selectedLogItem, setSelectedLogItem] = useState<TrustFund | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Column Visibility State
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Status update loading state
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set());

  // Custom Hooks
  const { columnWidths, setColumnWidths } = useColumnWidths();
  const { handleResizeStart } = useColumnResize(columnWidths, setColumnWidths);
  const { sortField, sortDirection, handleSort } = useTableSort();
  const filteredAndSortedData = useTableFilter(data as TrustFund[], searchQuery, sortField, sortDirection);
  const { selected, allSelected, toggleAll, toggleOne, clearSelection } = useTableSelection(filteredAndSortedData);

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

  // Calculate totals
  const totals = useMemo(() => calculateTotals(filteredAndSortedData), [filteredAndSortedData]);

  // Handlers
  const handlePin = async (item: TrustFund) => {
    try {
      await togglePin({ id: item.id as Id<"trustFunds"> });
      toast.success(item.isPinned ? "Unpinned" : "Pinned to top");
    } catch (error) {
      toast.error("Failed to toggle pin");
    }
  };

  const handleBulkTrash = async () => {
    if (selected.length === 0) return;
    
    try {
      await bulkMoveToTrash({ ids: selected as Id<"trustFunds">[] });
      toast.success(`Moved ${selected.length} item(s) to trash`);
      clearSelection();
    } catch (error) {
      toast.error("Failed to move items to trash");
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    // Add to updating set
    setUpdatingStatusIds(prev => new Set(prev).add(itemId));
    
    try {
      await updateStatus({ 
        id: itemId as Id<"trustFunds">, 
        status: newStatus as any,
        reason: "Status updated via quick dropdown"
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      // Remove from updating set
      setUpdatingStatusIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleEdit = (item: TrustFund) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: TrustFund) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleViewLog = (item: TrustFund) => {
    setSelectedLogItem(item);
    setLogSheetOpen(true);
  };

  const handleContextMenu = (item: TrustFund, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entity: item });
  };

  const handleToggleColumn = (columnId: string, isChecked: boolean) => {
    const newHidden = new Set(hiddenColumns);
    if (isChecked) {
      newHidden.delete(columnId);
    } else {
      newHidden.add(columnId);
    }
    setHiddenColumns(newHidden);
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredAndSortedData, hiddenColumns, year);
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const handlePrint = (orientation: 'portrait' | 'landscape') => {
    printTable(orientation);
    setShowPrintModal(false);
  };

  return (
    <>
      <Card className="rounded-lg border print-area">
        {/* Toolbar */}
        <TrustFundTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          selectedCount={selected.length}
          onClearSelection={clearSelection}
          hiddenColumns={hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onShowAllColumns={() => setHiddenColumns(new Set())}
          onHideAllColumns={() => setHiddenColumns(new Set(['projectTitle', 'officeInCharge', 'status', 'dateReceived', 'received', 'obligatedPR', 'utilized', 'balance', 'remarks']))}
          onExportCSV={handleExportCSV}
          onPrint={() => setShowPrintModal(true)}
          isAdmin={isAdmin}
          onOpenTrash={onOpenTrash}
          onBulkTrash={handleBulkTrash}
          onAddNew={onAdd ? () => setShowAddModal(true) : undefined}
          accentColor={accentColorValue}
        />

        {/* Table */}
        <CardContent className="p-0">
          <div className="relative max-h-[600px] overflow-auto">
            <Table className="w-full text-sm" style={{ tableLayout: 'auto' }}>
              <TrustFundsTableColgroup
                isAdmin={isAdmin}
                hiddenColumns={hiddenColumns}
                columnWidths={columnWidths}
              />

              <TrustFundsTableHeader
                isAdmin={isAdmin}
                hiddenColumns={hiddenColumns}
                columnWidths={columnWidths}
                allSelected={allSelected}
                onToggleAll={toggleAll}
                onSort={handleSort}
                onResizeStart={handleResizeStart}
              />

              <TrustFundsTableBody
                data={filteredAndSortedData}
                isAdmin={isAdmin}
                selected={selected}
                hiddenColumns={hiddenColumns}
                columnWidths={columnWidths}
                totals={totals}
                updatingStatusIds={updatingStatusIds}
                onToggleSelection={toggleOne}
                onContextMenu={handleContextMenu}
                onStatusChange={handleStatusChange}
                onPin={handlePin}
                onViewLog={handleViewLog}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={!!onEdit}
                canDelete={!!onDelete}
              />
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <TrustFundContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onPin={() => {
          if (contextMenu) handlePin(contextMenu.entity);
          setContextMenu(null);
        }}
        onViewLog={() => {
          if (contextMenu) handleViewLog(contextMenu.entity);
          setContextMenu(null);
        }}
        onEdit={() => {
          if (contextMenu) handleEdit(contextMenu.entity);
          setContextMenu(null);
        }}
        onDelete={() => {
          if (contextMenu) handleDelete(contextMenu.entity);
          setContextMenu(null);
        }}
        canEdit={!!onEdit}
        canDelete={!!onDelete}
      />

      {/* Modals */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Trust Fund"
          size="xl"
        >
          <TrustFundForm
            year={year}
            onSave={(data) => {
              if (onAdd) onAdd(data);
              setShowAddModal(false);
            }}
            onCancel={() => setShowAddModal(false)}
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
          title="Edit Trust Fund"
          size="xl"
        >
          <TrustFundForm
            trustFund={selectedItem}
            year={year}
            onSave={(data) => {
              if (onEdit) onEdit(selectedItem.id, data);
              setShowEditModal(false);
              setSelectedItem(null);
            }}
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
          onConfirm={() => {
            if (onDelete) onDelete(selectedItem.id);
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          title="Move to Trash"
          message={`Are you sure you want to move "${selectedItem.projectTitle}" to trash?`}
          confirmText="Move to Trash"
          variant="danger"
        />
      )}

      {/* Print Orientation Modal */}
      <PrintOrientationModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onConfirm={handlePrint}
      />

      {/* Activity Log Sheet */}
      {selectedLogItem && (
        <ActivityLogSheet
          type="trustFund"
          entityId={selectedLogItem.id}
          title={`Trust Fund History: ${selectedLogItem.projectTitle}`}
          isOpen={logSheetOpen}
          onOpenChange={(open) => {
            setLogSheetOpen(open);
            if (!open) setSelectedLogItem(null);
          }}
        />
      )}
    </>
  );
}