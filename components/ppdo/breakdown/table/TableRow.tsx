// components/ppdo/breakdown/table/TableRow.tsx

"use client";

import { useState } from "react";
import { Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  /** Entity type for status update mutation */
  entityType?: "project" | "trustfund" | "specialeducationfund" | "specialhealthfund";
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
  entityType = "project",
}: TableRowProps) {
  const [isHoveringStatus, setIsHoveringStatus] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use appropriate mutation based on entity type
  const updateProjectBreakdown = useMutation(api.govtProjects.updateProjectBreakdown);
  const updateTrustFundBreakdown = useMutation(api.trustFundBreakdowns.updateBreakdown);
  const updateSpecialEducationFundBreakdown = useMutation(api.specialEducationFundBreakdowns.updateBreakdown);
  const updateSpecialHealthFundBreakdown = useMutation(api.specialHealthFundBreakdowns.updateBreakdown);

  const handleStatusChange = async (newStatus: "completed" | "ongoing" | "delayed") => {
    setIsUpdating(true);
    try {
      if (entityType === "trustfund") {
        await updateTrustFundBreakdown({
          id: breakdown._id as Id<"trustFundBreakdowns">,
          status: newStatus,
        });
      } else if (entityType === "specialeducationfund") {
        await updateSpecialEducationFundBreakdown({
          id: breakdown._id as Id<"specialEducationFundBreakdowns">,
          status: newStatus,
        });
      } else if (entityType === "specialhealthfund") {
        await updateSpecialHealthFundBreakdown({
          id: breakdown._id as Id<"specialHealthFundBreakdowns">,
          status: newStatus,
        });
      } else {
        await updateProjectBreakdown({
          breakdownId: breakdown._id as Id<"govtProjectBreakdowns">,
          status: newStatus,
          reason: "Status updated via quick dropdown",
        });
      }
      toast.success("Status updated successfully!");
      setIsSelectOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

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
          {columns.map((column) => {
            const cellValue = formatCellValue(breakdown[column.key], column, breakdown);
            const isStatusColumn = column.key === 'status';

            return (
              <td
                key={column.key}
                className="px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-zinc-900 dark:text-zinc-100"
                style={{
                  border: '1px solid rgb(228 228 231 / 1)',
                  textAlign: column.align,
                }}
                onMouseEnter={() => isStatusColumn && !isUpdating && setIsHoveringStatus(true)}
                onMouseLeave={() => {
                  if (isStatusColumn && !isSelectOpen && !isUpdating) {
                    setIsHoveringStatus(false);
                  }
                }}
              >
                {isStatusColumn && cellValue !== '-' ? (
                  <div
                    className="flex items-center justify-center relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <Loader2
                          className="animate-spin text-zinc-500 dark:text-zinc-400"
                          style={{ width: '14px', height: '14px' }}
                        />
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs">
                          Updating...
                        </span>
                      </div>
                    ) : (isHoveringStatus || isSelectOpen) ? (
                      <Select
                        value={breakdown.status}
                        onValueChange={handleStatusChange}
                        open={isSelectOpen}
                        onOpenChange={(open) => {
                          setIsSelectOpen(open);
                          if (!open) {
                            setIsHoveringStatus(false);
                          }
                        }}
                        disabled={isUpdating}
                      >
                        <SelectTrigger
                          className="cursor-pointer font-semibold py-0 text-[11px] sm:text-xs border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            width: '120px',
                            fontSize: '12px',
                            height: '26px',
                            margin: '0px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            paddingRight: '2px',
                          }}
                        >
                          <SelectValue>
                            <span className="text-zinc-900 dark:text-zinc-100">
                              {cellValue}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="min-w-[110px]">
                          <SelectItem
                            value="completed"
                            className="text-xs cursor-pointer"
                          >
                            <span className="text-zinc-900 dark:text-zinc-100">Completed</span>
                          </SelectItem>
                          <SelectItem
                            value="ongoing"
                            className="text-xs cursor-pointer"
                          >
                            <span className="text-zinc-900 dark:text-zinc-100">Ongoing</span>
                          </SelectItem>
                          <SelectItem
                            value="delayed"
                            className="text-xs cursor-pointer"
                          >
                            <span className="text-zinc-900 dark:text-zinc-100">Delayed</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {cellValue}
                      </span>
                    )}
                  </div>
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
