// components/ppdo/funds/components/toolbar/FundsTableToolbar.tsx

"use client";

import React from "react";
import { Search, CheckCircle2, Trash2, X, Download, Printer, FileSpreadsheet, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { AVAILABLE_COLUMNS } from "../../constants";

interface FundsTableToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    selectedCount: number;
    onClearSelection: () => void;
    hiddenColumns: Set<string>;
    onToggleColumn: (columnId: string, isChecked: boolean) => void;
    onShowAllColumns: () => void;
    onHideAllColumns: () => void;
    onExportCSV: () => void;
    onPrint?: () => void;
    onOpenPrintPreview?: () => void;
    hasPrintDraft?: boolean;
    isAdmin: boolean;
    onOpenTrash?: () => void;
    onBulkTrash: () => void;
    onAddNew?: () => void;
    accentColor: string;
    title?: string;
    searchPlaceholder?: string;
}

export function FundsTableToolbar({
    searchQuery,
    onSearchChange,
    searchInputRef,
    selectedCount,
    onClearSelection,
    hiddenColumns,
    onToggleColumn,
    onShowAllColumns,
    onHideAllColumns,
    onExportCSV,
    onPrint,
    onOpenPrintPreview,
    hasPrintDraft,
    isAdmin,
    onOpenTrash,
    onBulkTrash,
    onAddNew,
    accentColor,
    title = "Funds",
    searchPlaceholder = "Search funds...",
}: FundsTableToolbarProps) {
    return (
        <div className="h-16 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 no-print">

            {/* Left: Title or Selection Info */}
            <div className="flex items-center gap-3 min-w-[200px]">
                {selectedCount > 0 ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 h-7"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            {selectedCount} Selected
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="text-zinc-500 text-xs h-7 hover:text-zinc-900"
                        >
                            Clear
                        </Button>
                    </div>
                ) : (
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {title}
                    </h3>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">

                {/* Search Input */}
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-9 pl-9 pr-9 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Column Visibility */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Columns</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {AVAILABLE_COLUMNS.map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={!hiddenColumns.has(column.id)}
                                onCheckedChange={(checked) => onToggleColumn(column.id, checked)}
                            >
                                {column.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onShowAllColumns}>
                            Show All Columns
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onHideAllColumns}>
                            Hide All Columns
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Recycle Bin */}
                {onOpenTrash && (
                    <Button
                        onClick={selectedCount > 0 ? onBulkTrash : onOpenTrash}
                        variant={selectedCount > 0 ? "destructive" : "outline"}
                        size="sm"
                        className="gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {selectedCount > 0 ? (
                            `To Trash (${selectedCount})`
                        ) : (
                            <span className="hidden sm:inline">Recycle Bin</span>
                        )}
                    </Button>
                )}

                {/* Export/Print Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                        {onOpenPrintPreview && (
                            <DropdownMenuItem onClick={onOpenPrintPreview} className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Print Preview
                                {hasPrintDraft && (
                                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </DropdownMenuItem>
                        )}
                        {onPrint && (
                            <DropdownMenuItem onClick={onPrint} className="cursor-pointer">
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <span className="text-[10px] text-zinc-500 leading-tight block">
                                Note: Exports are based on currently shown/hidden columns.
                            </span>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Add New Item Button */}
                {onAddNew && (
                    <Button
                        onClick={onAddNew}
                        size="sm"
                        className="gap-2 text-white shadow-sm"
                        style={{ backgroundColor: accentColor }}
                    >
                        <span className="text-lg leading-none mb-0.5">+</span>
                        <span className="hidden sm:inline">Add New Item</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
