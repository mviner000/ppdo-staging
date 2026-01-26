// components/ppdo/funds/components/table/FundsTableHeader.tsx

"use client";

import { ArrowUpDown } from "lucide-react";
import { GripVertical } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SortField, STATUS_COLUMN_WIDTH } from "../../";

interface FundsTableHeaderProps {
    isAdmin: boolean;
    hiddenColumns: Set<string>;
    columnWidths: { projectTitle: number; remarks: number };
    allSelected: boolean;
    onToggleAll: () => void;
    onSort: (field: SortField) => void;
    onResizeStart: (column: 'projectTitle' | 'remarks', e: React.MouseEvent) => void;
}

export function FundsTableHeader({
    isAdmin,
    hiddenColumns,
    columnWidths,
    allSelected,
    onToggleAll,
    onSort,
    onResizeStart,
}: FundsTableHeaderProps) {
    const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

    const SortIcon = ({ field }: { field: SortField }) => {
        return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    };

    return (
        <TableHeader className="sticky top-0 z-30 bg-white dark:bg-zinc-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
            <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-950">
                {isAdmin && (
                    <TableHead className="w-10 px-3 py-4 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-20">
                        <Checkbox
                            checked={allSelected}
                            onCheckedChange={onToggleAll}
                            aria-label="Select all"
                        />
                    </TableHead>
                )}

                {isColumnVisible("projectTitle") && (
                    <TableHead
                        className="px-4 sm:px-6 py-4 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("projectTitle")}
                    >
                        <div className="relative flex items-center gap-2 pr-4">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Project Title
                            </span>
                            <SortIcon field="projectTitle" />
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
                        className="px-4 sm:px-6 py-4 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("officeInCharge")}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Office In-Charge
                            </span>
                            <SortIcon field="officeInCharge" />
                        </div>
                    </TableHead>
                )}

                {isColumnVisible("status") && (
                    <TableHead
                        className="px-4 sm:px-6 py-4 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("status")}
                        style={{
                            width: `${STATUS_COLUMN_WIDTH}px`,
                            minWidth: `${STATUS_COLUMN_WIDTH}px`,
                            maxWidth: `${STATUS_COLUMN_WIDTH}px`
                        }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Status
                            </span>
                            <SortIcon field="status" />
                        </div>
                    </TableHead>
                )}

                {isColumnVisible("dateReceived") && (
                    <TableHead
                        className="px-4 sm:px-6 py-4 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("dateReceived")}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Date Received
                            </span>
                            <SortIcon field="dateReceived" />
                        </div>
                    </TableHead>
                )}

                {isColumnVisible("received") && (
                    <TableHead
                        className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("received")}
                    >
                        <div className="flex w-full items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Received
                            </span>
                            <SortIcon field="received" />
                        </div>
                    </TableHead>
                )}

                {isColumnVisible("obligatedPR") && (
                    <TableHead className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                            Obligated PR
                        </span>
                    </TableHead>
                )}

                {isColumnVisible("utilized") && (
                    <TableHead
                        className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("utilized")}
                    >
                        <div className="flex w-full items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Utilized
                            </span>
                            <SortIcon field="utilized" />
                        </div>
                    </TableHead>
                )}

                {isColumnVisible("utilizationRate") && (
                    <TableHead className="px-4 sm:px-6 py-4 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                            Utilization %
                        </span>
                    </TableHead>
                )}

                {isColumnVisible("balance") && (
                    <TableHead
                        className="px-4 sm:px-6 py-4 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => onSort("balance")}
                    >
                        <div className="flex w-full items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Balance
                            </span>
                            <SortIcon field="balance" />
                        </div>
                    </TableHead>
                )}

                {isColumnVisible("remarks") && (
                    <TableHead className="px-4 sm:px-6 py-4 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                        <div className="relative flex items-center gap-2 pr-4">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Remarks
                            </span>
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

                <TableHead className="px-4 sm:px-6 py-4 text-center no-print sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Actions
                    </span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}
