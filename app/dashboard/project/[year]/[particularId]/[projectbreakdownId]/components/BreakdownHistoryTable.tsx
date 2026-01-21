// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/BreakdownHistoryTable.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccentColor } from "../../../../../../../contexts/AccentColorContext";

// Import types
import { 
  Breakdown, 
  BreakdownHistoryTableProps,
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

// Import components
import { TableToolbar } from "./TableToolbar";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { TableTotalsRow } from "./TableTotalsRow";
import { EmptyState } from "./EmptyState";

/* =======================
   MAIN COMPONENT
======================= */

export function BreakdownHistoryTable({
  breakdowns,
  onPrint,
  onAdd,
  onEdit,
  onDelete,
  onOpenTrash,
}: BreakdownHistoryTableProps) {
  const router = useRouter();
  const params = useParams();
  const { accentColorValue } = useAccentColor();

  // Search state
  const [search, setSearch] = useState("");

  // Custom hooks
  const {
    columns,
    setColumns,
    rowHeights,
    setRowHeights,
    canEditLayout,
    saveLayout,
  } = useTableSettings();

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
     NAVIGATION HANDLER
  ======================= */
  
  const handleRowClick = useCallback((breakdown: Breakdown, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    
    if (isInteractiveElement(target)) {
      return;
    }

    logBreakdownNavigation(breakdown);

    const navigationParams = {
      particularId: params.particularId as string,
      projectbreakdownId: params.projectbreakdownId as string,
    };

    const path = buildBreakdownDetailPath(breakdown, navigationParams);
    router.push(path);
  }, [params, router]);

  /* =======================
     COMPUTED VALUES
  ======================= */

  const gridTemplateColumns = useMemo(() => {
    return generateGridTemplate(columns);
  }, [columns]);

  const filteredRows = useMemo(() => {
    return filterBreakdowns(breakdowns, search);
  }, [breakdowns, search]);

  const totals = useMemo(() => {
    return calculateColumnTotals(filteredRows, columns);
  }, [filteredRows, columns]);

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
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        onPrint={onPrint}
        onAdd={onAdd}
        onOpenTrash={onOpenTrash}
        accentColor={accentColorValue}
      />

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
            columns={columns}
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
                <td colSpan={columns.length + 2}>
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
                    columns={columns}
                    gridTemplateColumns={gridTemplateColumns}
                    rowHeight={height}
                    canEditLayout={canEditLayout}
                    onRowClick={handleRowClick}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStartRowResize={startResizeRow}
                  />
                );
              })}

              {/* TOTALS ROW */}
              <TableTotalsRow
                columns={columns}
                totals={totals}
                gridTemplateColumns={gridTemplateColumns}
              />
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}