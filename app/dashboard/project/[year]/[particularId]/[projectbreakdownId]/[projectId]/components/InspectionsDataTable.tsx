"use client"

import React, { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { InspectionGalleryModal } from "./InspectionGalleryModal"
import { InspectionContextMenu } from "./InspectionContextMenu"
import { Inspection } from "../types/inspection"

interface InspectionsDataTableProps {
  data: Inspection[]
  isLoading?: boolean
  onViewDetails: (inspection: Inspection) => void
  onEdit?: (inspection: Inspection) => void
  onDelete?: (inspection: Inspection) => void
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

const formatDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function InspectionsDataTable({
  data,
  isLoading = false,
  onViewDetails,
  onEdit,
  onDelete,
}: InspectionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedInspectionForGallery, setSelectedInspectionForGallery] = useState<Inspection | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; inspection: Inspection } | null>(null)

  const columns: ColumnDef<Inspection>[] = [
    {
      accessorKey: "programNumber",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Program No.
          {column.getIsSorted() === "asc" && <ChevronUp className="h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ChevronDown className="h-4 w-4" />}
          {!column.getIsSorted() && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.getValue("programNumber") || "—"}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Title
          {column.getIsSorted() === "asc" && <ChevronUp className="h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ChevronDown className="h-4 w-4" />}
          {!column.getIsSorted() && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm text-gray-900 dark:text-gray-100" title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {row.getValue("category") || "—"}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "inspectionDate",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Date
          {column.getIsSorted() === "asc" && <ChevronUp className="h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ChevronDown className="h-4 w-4" />}
          {!column.getIsSorted() && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {formatDateShort(new Date(row.getValue("inspectionDate") as number))}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className={`${getStatusColor(status)} whitespace-nowrap`}>
            {status.replace("_", " ")}
          </Badge>
        )
      },
      size: 110,
    },
    {
      accessorKey: "viewCount",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Views
          {column.getIsSorted() === "asc" && <ChevronUp className="h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ChevronDown className="h-4 w-4" />}
          {!column.getIsSorted() && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
          {row.getValue("viewCount")}
        </div>
      ),
      size: 70,
    },
    {
      accessorKey: "imageCount",
      header: "Images",
      cell: ({ row }) => {
        const inspection = row.original
        const imageCount = inspection.imageCount || 0
        const thumbnails = inspection.thumbnails || []
        
        if (imageCount === 0) {
          return <div className="text-sm text-gray-500 dark:text-gray-500 text-center">—</div>
        }

        const visibleThumbnails = thumbnails.slice(0, 3)
        const hasOverflow = imageCount > 3
        
        return (
          <div className="flex items-center gap-2">
            {/* Thumbnail Gallery */}
            <div className="flex items-center gap-1.5">
              {visibleThumbnails.map((thumbnail: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedInspectionForGallery(inspection)
                    setGalleryOpen(true)
                  }}
                  className="cursor-grab group relative h-8 w-8 overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-[#4FBA76] dark:hover:border-[#4FBA76] transition-all hover:shadow-md"
                  title={`View ${imageCount} image${imageCount !== 1 ? "s" : ""}`}
                >
                  <img
                    src={thumbnail}
                    alt={`Inspection thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback for broken images
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div
                    className="absolute inset-0 hidden items-center justify-center bg-gray-100 dark:bg-gray-700"
                    style={{ display: "none" }}
                  >
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </button>
              ))}
              
              {/* Overflow Indicator */}
              {hasOverflow && (
                <button
                  onClick={() => {
                    setSelectedInspectionForGallery(inspection)
                    setGalleryOpen(true)
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-[#4FBA76] dark:hover:bg-[#4FBA76] text-gray-700 dark:text-gray-300 hover:text-white transition-all text-xs font-semibold border border-gray-200 dark:border-gray-600 hover:border-[#4FBA76]"
                  title={`View all ${imageCount} images`}
                >
                  +{imageCount - 3}
                </button>
              )}
            </div>

            {/* Count Badge */}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {imageCount}
            </span>
          </div>
        )
      },
      size: 160,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(row.original)}
            className="text-xs h-8"
          >
            View
          </Button>
          <button
            onClick={(e) => {
              e.preventDefault()
              setContextMenu({ x: e.clientX, y: e.clientY, inspection: row.original })
            }}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="More actions"
          >
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
      ),
      size: 140,
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-gray-700 dark:text-gray-300 font-semibold px-4 py-3"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ x: e.clientX, y: e.clientY, inspection: row.original })
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3" style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {selectedInspectionForGallery && (
        <InspectionGalleryModal
          isOpen={galleryOpen}
          onClose={() => {
            setGalleryOpen(false)
            setSelectedInspectionForGallery(null)
          }}
          inspection={selectedInspectionForGallery}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <InspectionContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          inspection={contextMenu.inspection}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
