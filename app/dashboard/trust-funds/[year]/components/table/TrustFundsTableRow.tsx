// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableRow.tsx

"use client";

import { useState } from "react";
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
import { formatCurrency, formatDate, formatStatus, getStatusClassName, truncateText } from "../../../utils";
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
      className="p-1"
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
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'} ${getStatusClassName(status)}`}>
          {isUpdating && (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
          )}
          {formatStatus(status)}
        </div>
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
          <SelectContent align="start">
            <SelectItem value="not_available" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                Not Available
              </span>
            </SelectItem>
            <SelectItem value="not_yet_started" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                Not Yet Started
              </span>
            </SelectItem>
            <SelectItem value="ongoing" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Ongoing
              </span>
            </SelectItem>
            <SelectItem value="completed" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                Completed
              </span>
            </SelectItem>
            <SelectItem value="active" className="text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                Active
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
  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

  return (
    <TableRow 
      className="h-10 hover:bg-muted/40"
      onContextMenu={onContextMenu}
    >
      {isAdmin && (
        <TableCell className="px-2 text-center no-print">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
          />
        </TableCell>
      )}

      {isColumnVisible("projectTitle") && (
        <TableCell className="px-3 font-medium">
          <div className="flex items-center gap-2">
            {item.isPinned && (
              <Pin className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <span className="truncate" title={item.projectTitle}>
              {truncateText(item.projectTitle, Math.floor(columnWidths.projectTitle / 8))}
            </span>
          </div>
        </TableCell>
      )}

      {isColumnVisible("officeInCharge") && (
        <TableCell className="px-3 truncate">
          {item.officeInCharge}
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
        <TableCell className="px-3">
          {formatDate(item.dateReceived)}
        </TableCell>
      )}

      {isColumnVisible("received") && (
        <TableCell className="px-3 text-right tabular-nums">
          {formatCurrency(item.received)}
        </TableCell>
      )}

      {isColumnVisible("obligatedPR") && (
        <TableCell className="px-3 text-right tabular-nums">
          {item.obligatedPR ? formatCurrency(item.obligatedPR) : "—"}
        </TableCell>
      )}

      {isColumnVisible("utilized") && (
        <TableCell className="px-3 text-right tabular-nums">
          {formatCurrency(item.utilized)}
        </TableCell>
      )}

      {isColumnVisible("balance") && (
        <TableCell className="px-3 text-right font-semibold tabular-nums">
          {formatCurrency(item.balance)}
        </TableCell>
      )}

      {isColumnVisible("remarks") && (
        <TableCell className="px-3 text-muted-foreground">
          <span className="truncate block" title={item.remarks || ""}>
            {item.remarks ? truncateText(item.remarks, Math.floor(columnWidths.remarks / 8)) : "—"}
          </span>
        </TableCell>
      )}

      <TableCell className="px-3 text-center no-print">
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