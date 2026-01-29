// components/ppdo/breakdown/table/BreakdownHistoryTable.tsx

/**
 * Centralized Breakdown History Table Component
 *
 * A reusable table component for displaying breakdown records.
 * Used by both Project and Trust Fund breakdown pages.
 */

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Trash2, Printer, Plus, LayoutGrid, Table2 } from "lucide-react";
import { toast } from "sonner";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreakdownKanban } from "../kanban";
import { StatusVisibilityMenu } from "../../shared/toolbar";
import { KanbanFieldVisibilityMenu } from "../../shared/kanban/KanbanFieldVisibilityMenu";

// Import types
import {
  Breakdown,
  BreakdownHistoryTableProps,
  NavigationParams,
} from "../types/breakdown.types";

// Import constants
import { TABLE_HEIGHT, DEFAULT_ROW_HEIGHT } from "../constants/table.constants";

// Import utilities
import {
  filterBreakdowns,
  calculateColumnTotals,
  generateGridTemplate,
  isInteractiveElement,
} from "../utils/helpers";

import {
  buildBreakdownDetailPath,
  logBreakdownNavigation
} from "../utils/navigation.utils";

// Import hooks
import { useTableSettings } from "../hooks/useTableSettings";
import { useTableResize } from "../hooks/useTableResize";
import { useColumnDragDrop } from "../hooks/useColumnDragDrop";

// Import shared table components
import {
  GenericTableToolbar,
  TableSearchInput,
  TableActionButton,
} from "@/components/shared/table";
import { ColumnVisibilityMenu } from "@/components/ColumnVisibilityMenu";

// Import table sub-components
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { TableTotalsRow } from "./TableTotalsRow";
import { EmptyState } from "./EmptyState";
import { GenericPrintPreviewModal } from "@/app/dashboard/components/print/GenericPrintPreviewModal";

// Import print adapter
import { BreakdownPrintAdapter } from "../lib/print-adapters/BreakdownPrintAdapter";

export function BreakdownHistoryTable({
  breakdowns,
  onPrint,
  onAdd,
  onEdit,
  onDelete,
  onOpenTrash,
  entityType = "project",
  navigationParams,
  onStatusChange,
}: BreakdownHistoryTableProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { accentColorValue } = useAccentColor();

  // Search state
  const [search, setSearch] = useState("");

  // Column visibility state
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Print preview state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [printAdapter, setPrintAdapter] = useState<BreakdownPrintAdapter | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [showViewToggle, setShowViewToggle] = useState(false);

  // Keyboard shortcut to toggle view tabs visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        const newValue = !showViewToggle;
        setShowViewToggle(newValue);
        if (newValue) {
          toast.info("View toggle controls visible");
        } else {
          toast.info("View toggle controls hidden");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showViewToggle]);

  // Handle URL param for initial view mode
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "kanban") {
      setViewMode("kanban");
    }
  }, [searchParams]);

  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(new Set(["ongoing", "delayed", "completed"]));
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set([
    "allocatedBudget",
    "balance",
    "utilizationRate",
  ]));

  const handleToggleField = (fieldId: string, isChecked: boolean) => {
    const newVisible = new Set(visibleFields);
    if (isChecked) {
      newVisible.add(fieldId);
    } else {
      newVisible.delete(fieldId);
    }
    setVisibleFields(newVisible);
  };

  // Determine table identifier based on entity type
  const tableIdentifier =
    entityType === "trustfund" ? "trustFundBreakdowns" :
      entityType === "specialeducationfund" ? "specialEducationFundBreakdowns" :
        entityType === "specialhealthfund" ? "specialHealthFundBreakdowns" :
          entityType === "twentyPercentDF" ? "twentyPercentDFBreakdowns" :
            "govtProjectBreakdowns";

  // Custom hooks
  const {
    columns,
    setColumns,
    rowHeights,
    setRowHeights,
    canEditLayout,
    saveLayout,
  } = useTableSettings({ tableIdentifier });

  const { startResizeColumn, startResizeRow } = useTableResize({
    columns,
    setColumns,
    rowHeights,
    setRowHeights,
    canEditLayout,
    saveLayout,
  });

  const { onDragStart, onDrop, onDragOver } = useColumnDragDrop({
    columns,
    setColumns,
    rowHeights,
    canEditLayout,
    saveLayout,
  });

  /* =======================
     COLUMN VISIBILITY HANDLERS
  ======================= */

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
    const allColIds = columns.map((c) => c.key);
    setHiddenColumns(new Set(allColIds));
  };

  const handleToggleStatus = (statusId: string, isChecked: boolean) => {
    const newVisible = new Set(visibleStatuses);
    if (isChecked) {
      newVisible.add(statusId);
    } else {
      newVisible.delete(statusId);
    }
    setVisibleStatuses(newVisible);
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(itemId, newStatus);
      return;
    }

    // Find item
    const item = breakdowns.find(b => b._id === itemId);
    if (item && onEdit) {
      const status = newStatus as "completed" | "ongoing" | "delayed";
      onEdit({
        ...item,
        status
      });
    }
  };

  /* =======================
     PRINT HANDLER
  ======================= */

  const handlePrint = useCallback(() => {
    try {
      // Determine breakdown ID from params or navigation params
      let breakdownId: string | undefined;

      if (entityType === "trustfund") {
        breakdownId = navigationParams?.slug || (params as any).slug as string;
      } else if (entityType === "specialeducationfund") {
        breakdownId = navigationParams?.slug || (params as any).slug as string;
      } else if (entityType === "specialhealthfund") {
        breakdownId = navigationParams?.slug || (params as any).slug as string;
      } else if (entityType === "twentyPercentDF") {
        breakdownId = navigationParams?.slug || (params as any).slug as string;
      } else {
        breakdownId = navigationParams?.projectbreakdownId || (params as any).projectbreakdownId as string;
      }

      if (!breakdownId) {
        console.warn("No breakdown ID found for print adapter");
        return;
      }

      const adapter = new BreakdownPrintAdapter(
        breakdowns,
        breakdownId,
        columns
      );
      setPrintAdapter(adapter);
      setIsPrintPreviewOpen(true);
    } catch (error) {
      console.error('Failed to open print preview:', error);
    }
  }, [breakdowns, params, navigationParams, columns, entityType]);

  /* =======================
     NAVIGATION HANDLER
  ======================= */

  const handleRowClick = useCallback((breakdown: Breakdown, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (isInteractiveElement(target)) {
      return;
    }

    logBreakdownNavigation(breakdown);

    // Build navigation params from props or URL params
    const navParams: NavigationParams = navigationParams || {
      particularId: (params as any).particularId as string,
      projectbreakdownId: (params as any).projectbreakdownId as string,
      year: (params as any).year as string,
      slug: ((params as any).slug || (params as any).trustfundbreakdownId) as string, // Fallback for backward compat if needed, otherwise just slug
    };

    const path = buildBreakdownDetailPath(breakdown, navParams, entityType);
    router.push(path);
  }, [params, navigationParams, router, entityType]);

  /* =======================
     COMPUTED VALUES
  ======================= */

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => !hiddenColumns.has(col.key));
  }, [columns, hiddenColumns]);

  const gridTemplateColumns = useMemo(() => {
    return generateGridTemplate(visibleColumns);
  }, [visibleColumns]);

  const filteredRows = useMemo(() => {
    return filterBreakdowns(breakdowns, search);
  }, [breakdowns, search]);

  const totals = useMemo(() => {
    return calculateColumnTotals(filteredRows, visibleColumns);
  }, [filteredRows, visibleColumns]);

  /* =======================
     RENDER
  ======================= */

  return (
    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "kanban")} className="space-y-4">
      <div className="flex justify-end items-center mb-4 min-h-[40px]">
        {showViewToggle && (
          <TabsList className="bg-zinc-100 dark:bg-zinc-800 animate-in fade-in slide-in-from-right-4 duration-300">
            <TabsTrigger value="table" className="gap-2">
              <Table2 className="w-4 h-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </TabsTrigger>
          </TabsList>
        )}
      </div>

      <TabsContent value="table" className="mt-0">
        <div
          className="flex flex-col bg-white dark:bg-zinc-900"
          style={{
            height: TABLE_HEIGHT,
            border: '1px solid rgb(228 228 231 / 1)',
            borderRadius: '8px',
          }}
        >
          {/* TOOLBAR */}
          <GenericTableToolbar
            actions={
              <>
                <ColumnVisibilityMenu
                  columns={columns.map(col => ({ key: col.key, label: col.label }))}
                  hiddenColumns={hiddenColumns}
                  onToggleColumn={handleToggleColumn}
                  onShowAll={handleShowAllColumns}
                  onHideAll={handleHideAllColumns}
                  variant="table"
                />
                {onOpenTrash && (
                  <TableActionButton
                    icon={Trash2}
                    label="Recycle Bin"
                    onClick={onOpenTrash}
                    title="View Recycle Bin"
                  />
                )}
                <TableActionButton
                  icon={Printer}
                  label="Print"
                  onClick={handlePrint}
                  title="Print"
                />
                {onAdd && (
                  <TableActionButton
                    icon={Plus}
                    label="Add Record"
                    onClick={onAdd}
                    variant="primary"
                    accentColor={accentColorValue}
                  />
                )}
              </>
            }
          >
            <TableSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search..."
            />
          </GenericTableToolbar>

          {/* TABLE WRAPPER - CRITICAL: Contains the border grid */}
          <div
            className="flex-1 overflow-auto"
            style={{
              borderTop: '1px solid rgb(228 228 231 / 1)',
            }}
          >
            {/* TABLE CONTENT - Fixed width table with borders */}
            <table
              className="w-full"
              style={{
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                minWidth: '100%',
              }}
            >
              {/* HEADER */}
              <TableHeader
                columns={visibleColumns}
                gridTemplateColumns={gridTemplateColumns}
                canEditLayout={canEditLayout}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onStartResize={startResizeColumn}
              />

              {/* BODY */}
              {filteredRows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={visibleColumns.length + 2}>
                      <EmptyState />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {/* ROWS */}
                  {filteredRows.map((breakdown, index) => {
                    const height = rowHeights[breakdown._id] ?? DEFAULT_ROW_HEIGHT;

                    return (
                      <TableRow
                        key={breakdown._id}
                        breakdown={breakdown}
                        index={index}
                        columns={visibleColumns}
                        gridTemplateColumns={gridTemplateColumns}
                        rowHeight={height}
                        canEditLayout={canEditLayout}
                        onRowClick={handleRowClick}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStartRowResize={startResizeRow}
                        entityType={entityType}
                      />
                    );
                  })}

                  {/* TOTALS ROW */}
                  <TableTotalsRow
                    columns={visibleColumns}
                    totals={totals}
                    gridTemplateColumns={gridTemplateColumns}
                  />
                </tbody>
              )}
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="kanban" className="mt-0">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* KANBAN TOOLBAR */}
          <GenericTableToolbar
            actions={
              <>
                <KanbanFieldVisibilityMenu
                  visibleFields={visibleFields}
                  onToggleField={handleToggleField}
                  fields={[
                    { id: "allocatedBudget", label: "Allocated Budget" },
                    { id: "obligatedBudget", label: "Obligated Budget" },
                    { id: "budgetUtilized", label: "Budget Utilized" },
                    { id: "balance", label: "Balance" },
                    { id: "utilizationRate", label: "Utilization Rate" },
                    { id: "date", label: "Date" },
                    { id: "remarks", label: "Remarks" },
                  ]}
                />
                <StatusVisibilityMenu
                  visibleStatuses={visibleStatuses}
                  onToggleStatus={handleToggleStatus}
                  statusOptions={[
                    { id: "ongoing", label: "Ongoing" },
                    { id: "delayed", label: "Delayed" },
                    { id: "completed", label: "Completed" },
                  ]}
                />
                {onOpenTrash && (
                  <TableActionButton
                    icon={Trash2}
                    label="Recycle Bin"
                    onClick={onOpenTrash}
                    title="View Recycle Bin"
                  />
                )}
                {onAdd && (
                  <TableActionButton
                    icon={Plus}
                    label="Add Record"
                    onClick={onAdd}
                    variant="primary"
                    accentColor={accentColorValue}
                  />
                )}
              </>
            }
          >
            <TableSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search items..."
            />
          </GenericTableToolbar>

          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
            <BreakdownKanban
              data={filteredRows}
              onView={(item) => handleRowClick(item, { target: {} } as any)}
              onEdit={onEdit}
              onDelete={onDelete}
              visibleStatuses={visibleStatuses}
              visibleFields={visibleFields}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </TabsContent>

      {/* PRINT PREVIEW MODAL */}
      {printAdapter && (
        <GenericPrintPreviewModal
          isOpen={isPrintPreviewOpen}
          onClose={() => {
            setIsPrintPreviewOpen(false);
            setPrintAdapter(null);
          }}
          adapter={printAdapter}
          hiddenColumns={hiddenColumns}
          filterState={{
            searchQuery: search,
            statusFilter: [],
            yearFilter: [],
            sortField: null,
            sortDirection: null,
          }}
        />
      )}
    </Tabs>
  );
}
