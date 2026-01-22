// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableHeader.tsx

"use client";

import { ArrowUpDown, GripVertical } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SortField } from "../../../types";
import { STATUS_COLUMN_WIDTH } from "../../../constants";

interface TrustFundsTableHeaderProps {
  isAdmin: boolean;
  hiddenColumns: Set<string>;
  columnWidths: { projectTitle: number; remarks: number };
  allSelected: boolean;
  onToggleAll: () => void;
  onSort: (field: SortField) => void;
  onResizeStart: (column: 'projectTitle' | 'remarks', e: React.MouseEvent) => void;
}

export function TrustFundsTableHeader({
  isAdmin,
  hiddenColumns,
  columnWidths,
  allSelected,
  onToggleAll,
  onSort,
  onResizeStart,
}: TrustFundsTableHeaderProps) {
  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

  return (
    <TableHeader className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-950">
      <TableRow className="h-10 border-b">
        {isAdmin && (
          <TableHead className="px-2 text-center">
            <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
          </TableHead>
        )}

        {isColumnVisible("projectTitle") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("projectTitle")}
          >
            <div className="relative flex items-center gap-1 pr-4">
              PROJECT TITLE
              <ArrowUpDown className="h-3 w-3 opacity-40" />
              <button
                className="absolute right-0 cursor-col-resize text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5"
                onMouseDown={(e) => onResizeStart('projectTitle', e)}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-3 w-3" />
              </button>
            </div>
          </TableHead>
        )}

        {isColumnVisible("officeInCharge") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("officeInCharge")}
          >
            <div className="flex items-center gap-1">
              OFFICE IN-CHARGE
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            </div>
          </TableHead>
        )}

        {isColumnVisible("status") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("status")}
            style={{ 
              width: `${STATUS_COLUMN_WIDTH}px`,
              minWidth: `${STATUS_COLUMN_WIDTH}px`,
              maxWidth: `${STATUS_COLUMN_WIDTH}px`
            }}
          >
            <div className="flex items-center gap-1">
              STATUS
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            </div>
          </TableHead>
        )}

        {isColumnVisible("dateReceived") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("dateReceived")}
          >
            <div className="flex items-center gap-1">
              DATE RECEIVED
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            </div>
          </TableHead>
        )}

        {isColumnVisible("received") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("received")}
          >
            <div className="flex w-full items-center justify-end gap-1">
              RECEIVED
              <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
            </div>
          </TableHead>
        )}

        {isColumnVisible("obligatedPR") && (
          <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right">
            OBLIGATED PR
          </TableHead>
        )}

        {isColumnVisible("utilized") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("utilized")}
          >
            <div className="flex w-full items-center justify-end gap-1">
              UTILIZED
              <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
            </div>
          </TableHead>
        )}

        {isColumnVisible("balance") && (
          <TableHead
            className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => onSort("balance")}
          >
            <div className="flex w-full items-center justify-end gap-1">
              BALANCE
              <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
            </div>
          </TableHead>
        )}

        {isColumnVisible("remarks") && (
          <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium">
            <div className="relative flex items-center gap-1 pr-4">
              REMARKS
              <button
                className="absolute right-0 cursor-col-resize text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5"
                onMouseDown={(e) => onResizeStart('remarks', e)}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-3 w-3" />
              </button>
            </div>
          </TableHead>
        )}

        <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-center no-print">
          ACTIONS
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}