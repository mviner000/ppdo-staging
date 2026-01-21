// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/TableRow.tsx

"use client";

import { Edit, Trash2, Eye } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Breakdown, ColumnConfig } from "../types/breakdown.types";
import { formatCellValue } from "../utils/formatters";

interface TableRowProps {
  breakdown: Breakdown;
  index: number;
  columns: ColumnConfig[];
  gridTemplateColumns: string;
  rowHeight: number;
  canEditLayout: boolean;
  onRowClick: (breakdown: Breakdown, event: React.MouseEvent) => void;
  onEdit?: (breakdown: Breakdown) => void;
  onDelete?: (id: string) => void;
  onStartRowResize: (e: React.MouseEvent, rowId: string) => void;
}

export function TableRow({
  breakdown,
  index,
  columns,
  gridTemplateColumns,
  rowHeight,
  canEditLayout,
  onRowClick,
  onEdit,
  onDelete,
  onStartRowResize,
}: TableRowProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <tr
          className="bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
          style={{ height: rowHeight }}
          onClick={(e) => onRowClick(breakdown, e)}
        >
          {/* Row Number */}
          <td 
            className="text-center text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 relative"
            style={{ 
              border: '1px solid rgb(228 228 231 / 1)',
            }}
          >
            {index + 1}
            {canEditLayout && (
              <div
                className="absolute bottom-0 left-0 right-0 cursor-row-resize"
                onMouseDown={e => onStartRowResize(e, breakdown._id)}
                style={{ 
                  height: '4px',
                  marginBottom: '-2px',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(59 130 246 / 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              />
            )}
          </td>

          {/* Data Cells */}
          {columns.map(column => {
            const cellValue = formatCellValue(breakdown[column.key], column, breakdown);
            const isStatusColumn = column.key === 'status';
            
            return (
              <td
                key={column.key}
                className="px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300"
                style={{ 
                  border: '1px solid rgb(228 228 231 / 1)',
                  textAlign: column.align,
                }}
              >
                {isStatusColumn && cellValue !== '-' ? (
                  <span
                    className="inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded"
                    style={{
                      backgroundColor: 
                        cellValue.toLowerCase() === 'completed' ? 'rgb(24 24 27 / 1)' :
                        cellValue.toLowerCase() === 'ongoing' ? 'rgb(63 63 70 / 1)' :
                        cellValue.toLowerCase() === 'delayed' ? 'rgb(82 82 91 / 1)' :
                        'rgb(113 113 122 / 1)',
                      color: 'rgb(250 250 250 / 1)',
                    }}
                  >
                    {cellValue}
                  </span>
                ) : (
                  <span className="truncate block">{cellValue}</span>
                )}
              </td>
            );
          })}

          {/* Actions */}
          <td 
            className="text-center"
            style={{ 
              border: '1px solid rgb(228 228 231 / 1)',
            }}
          >
            <div className="flex items-center justify-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(breakdown);
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                  title="Edit"
                >
                  <Edit style={{ width: '14px', height: '14px' }} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(breakdown._id);
                  }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>
          </td>
        </tr>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(breakdown, e as any);
          }}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <Eye style={{ width: '14px', height: '14px' }} />
          <span>View Details</span>
        </ContextMenuItem>

        {onEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(breakdown);
              }}
              className="flex items-center gap-2 cursor-pointer text-xs"
            >
              <Edit style={{ width: '14px', height: '14px' }} />
              <span>Edit Breakdown</span>
            </ContextMenuItem>
          </>
        )}

        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(breakdown._id);
              }}
              className="flex items-center gap-2 cursor-pointer text-xs text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 style={{ width: '14px', height: '14px' }} />
              <span>Move to Trash</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}