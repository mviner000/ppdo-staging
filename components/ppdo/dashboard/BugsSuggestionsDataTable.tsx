"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown, Monitor, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    loading?: boolean
    onRowClick?: (row: TData) => void
}

export function BugsSuggestionsDataTable<TData, TValue>({
    columns,
    data,
    loading = false,
    onRowClick
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
        },
    })

    if (loading) {
        return <DataTableSkeleton />
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter titles..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border border-stone-200 dark:border-stone-800">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                    className={onRowClick ? "cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800" : ""}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function DataTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center py-4">
                <Skeleton className="h-10 w-[300px]" />
            </div>
            <div className="rounded-md border border-stone-200 dark:border-stone-800">
                <div className="p-4 space-y-4">
                    <div className="flex space-x-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-6 w-1/4" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex space-x-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Helper to render media thumbnails
export const MediaThumbnails = ({ multimedia }: { multimedia?: Array<{ storageId: string, type: string, name: string }> }) => {
    if (!multimedia || multimedia.length === 0) return null;

    const displayMedia = multimedia.slice(0, 3);
    const remaining = multimedia.length - 3;

    // Use a hardcoded placeholder or fetch url if possible, but for table view, we might just show icons
    // unless we have the URLs pre-fetched. 
    // Since we only have storageId here, we can't easily show the image without a component that fetches it.
    // Let's create a small client component for fetching or just show icons for now to be fast.
    // Ideally we enriched the data with URLs in backend, but we didn't. 
    // So let's use a "LazyImage" component concept or just icons.

    return (
        <div className="flex -space-x-2 overflow-hidden">
            {displayMedia.map((media, i) => (
                <div key={i} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-stone-900 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    {media.type === "image" ? (
                        <ImageIcon className="h-4 w-4 text-stone-500" />
                    ) : (
                        <Monitor className="h-4 w-4 text-stone-500" />
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-stone-900 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-medium text-stone-500">
                    +{remaining}
                </div>
            )}
        </div>
    )
}
