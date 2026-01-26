// components/ppdo/breakdown/table/BreakdownHistoryTable.tsx

/**
 * Centralized Breakdown History Table Component
 *
 * A reusable table component for displaying breakdown records.
 * Used by both Project and Trust Fund breakdown pages.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trash2, Printer, Plus } from "lucide-react";
import { useAccentColor } from "@/contexts/AccentColorContext";

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
}: BreakdownHistoryTableProps) {
  const router = useRouter();
  const params = useParams();
  const { accentColorValue } = useAccentColor();

  // Search state
  const [search, setSearch] = useState("");

  // Column visibility state
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Print preview state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [printAdapter, setPrintAdapter] = useState<BreakdownPrintAdapter | null>(null);

  // Determine table identifier based on entity type
  const tableIdentifier =
    entityType === "trustfund" ? "trustFundBreakdowns" :
      entityType === "specialeducationfund" ? "specialEducationFundBreakdowns" :
        entityType === "specialhealthfund" ? "specialHealthFundBreakdowns" :
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
    </div>
  );
}
