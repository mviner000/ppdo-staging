// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableRow.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, MoreVertical, Eye, Edit, Archive } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrustFund } from "@/types/trustFund.types";
import { formatCurrency, formatDate, formatStatus, getStatusClassName, truncateText, formatPercentage, calculateUtilizationRate, createTrustFundSlug } from "../../../utils";
import { STATUS_COLUMN_WIDTH } from "../../../constants";

interface StatusCellProps {
  status?: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating?: boolean;
}

function StatusCell({ status, onStatusChange, isUpdating = false }: StatusCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TableCell 
      className="px-4 sm:px-6 py-4 text-center"
      style={{ 
        width: `${STATUS_COLUMN_WIDTH}px`,
        minWidth: `${STATUS_COLUMN_WIDTH}px`,
        maxWidth: `${STATUS_COLUMN_WIDTH}px`
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => !isUpdating && setIsHovered(true)}
      onMouseLeave={() => {
        if (!isOpen) {
          setIsHovered(false);
        }
      }}
    >
      {!isHovered || isUpdating ? (
        <span className={`text-sm font-medium ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'} ${getStatusClassName(status)}`}>
          {isUpdating && (
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
          )}
          {formatStatus(status)}
        </span>
      ) : (
        <Select
          value={status || "not_available"}
          onValueChange={(value) => {
            onStatusChange(value);
            setIsHovered(false);
            setIsOpen(false);
          }}
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setIsHovered(false);
            }
          }}
          disabled={isUpdating}
        >
          <SelectTrigger 
            className={`h-7 text-xs border-0 shadow-none focus:ring-1 ${getStatusClassName(status)}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="not_available" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                -
              </span>
            </SelectItem>
            <SelectItem value="not_yet_started" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Not Yet Started
              </span>
            </SelectItem>
            <SelectItem value="ongoing" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                Ongoing
              </span>
            </SelectItem>
            <SelectItem value="completed" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                Completed
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </TableCell>
  );
}

interface TrustFundsTableRowProps {
  item: TrustFund;
  year: number;
  isAdmin: boolean;
  isSelected: boolean;
  hiddenColumns: Set<string>;
  columnWidths: { projectTitle: number; remarks: number };
  onToggleSelection: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onStatusChange: (newStatus: string) => void;
  onPin: () => void;
  onViewLog: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isUpdatingStatus?: boolean;
}

export function TrustFundsTableRow({
  item,
  year,
  isAdmin,
  isSelected,
  hiddenColumns,
  columnWidths,
  onToggleSelection,
  onContextMenu,
  onStatusChange,
  onPin,
  onViewLog,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  isUpdatingStatus = false,
}: TrustFundsTableRowProps) {
  const router = useRouter();
  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

  // Calculate utilization rate if not already present
  const utilizationRate = item.utilizationRate ?? calculateUtilizationRate(item.utilized, item.received);

  // Handle row click to navigate to breakdown page
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("[role='checkbox']") ||
      (e.target as HTMLElement).closest("[role='combobox']") ||
      (e.target as HTMLElement).closest("[role='listbox']") ||
      (e.target as HTMLElement).closest("[data-radix-select-viewport]")
    ) {
      return;
    }

    const slug = createTrustFundSlug(item.projectTitle, item.id);
    router.push(`/dashboard/trust-funds/${year}/${slug}`);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      onContextMenu={onContextMenu}
      className={`
        border-b border-zinc-200 dark:border-zinc-800 
        hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
        transition-colors cursor-pointer
        ${item.isPinned ? "bg-amber-50 dark:bg-amber-950/20" : ""}
        ${isSelected ? "bg-blue-50 dark:bg-blue-900/10" : ""}
      `}
    >
      {isAdmin && (
        <TableCell className="px-3 py-4 text-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}

      {isColumnVisible("projectTitle") && (
        <TableCell className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            {item.isPinned && (
              <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
            )}
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" title={item.projectTitle}>
              {truncateText(item.projectTitle, Math.floor(columnWidths.projectTitle / 8))}
            </span>
          </div>
        </TableCell>
      )}

      {isColumnVisible("officeInCharge") && (
        <TableCell className="px-4 sm:px-6 py-4">
          <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
            {item.officeInCharge}
          </span>
        </TableCell>
      )}

      {isColumnVisible("status") && (
        <StatusCell
          status={item.status}
          onStatusChange={onStatusChange}
          isUpdating={isUpdatingStatus}
        />
      )}

      {isColumnVisible("dateReceived") && (
        <TableCell className="px-4 sm:px-6 py-4">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {formatDate(item.dateReceived)}
          </span>
        </TableCell>
      )}

      {isColumnVisible("received") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatCurrency(item.received)}
          </span>
        </TableCell>
      )}

      {isColumnVisible("obligatedPR") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
            {item.obligatedPR ? formatCurrency(item.obligatedPR) : "—"}
          </span>
        </TableCell>
      )}

      {isColumnVisible("utilized") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatCurrency(item.utilized)}
          </span>
        </TableCell>
      )}

      {isColumnVisible("utilizationRate") && (
        <TableCell className="px-4 sm:px-6 py-4 text-center">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatPercentage(utilizationRate)}
          </span>
        </TableCell>
      )}

      {isColumnVisible("balance") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatCurrency(item.balance)}
          </span>
        </TableCell>
      )}

      {isColumnVisible("remarks") && (
        <TableCell className="px-4 sm:px-6 py-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate block" title={item.remarks || ""}>
            {item.remarks ? truncateText(item.remarks, Math.floor(columnWidths.remarks / 8)) : "—"}
          </span>
        </TableCell>
      )}

      <TableCell className="px-4 sm:px-6 py-4 text-center no-print">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewLog}>
              <Eye className="h-4 w-4 mr-2" />
              View Activity Log
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onPin}>
              <Pin className="h-4 w-4 mr-2" />
              {item.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600"
              >
                <Archive className="h-4 w-4 mr-2" />
                Move to Trash
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}