// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableBody.tsx

"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TrustFund } from "@/types/trustFund.types";
import { TrustFundsTableRow } from "./TrustFundsTableRow";
import { TrustFundsTableTotalRow } from "./TrustFundsTableTotalRow";

interface TrustFundsTableBodyProps {
  data: TrustFund[];
  isAdmin: boolean;
  selected: string[];
  hiddenColumns: Set<string>;
  columnWidths: { projectTitle: number; remarks: number };
  totals: {
    received: number;
    obligatedPR: number;
    utilized: number;
    balance: number;
    utilizationRate: number; // ✅ Added utilizationRate
  };
  updatingStatusIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onContextMenu: (item: TrustFund, e: React.MouseEvent) => void;
  onStatusChange: (itemId: string, newStatus: string) => void;
  onPin: (item: TrustFund) => void;
  onViewLog: (item: TrustFund) => void;
  onEdit: (item: TrustFund) => void;
  onDelete: (item: TrustFund) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function TrustFundsTableBody({
  data,
  isAdmin,
  selected,
  hiddenColumns,
  columnWidths,
  totals,
  updatingStatusIds,
  onToggleSelection,
  onContextMenu,
  onStatusChange,
  onPin,
  onViewLog,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: TrustFundsTableBodyProps) {
  if (data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={20} className="text-center py-8 text-zinc-500">
            No trust funds found
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {data.map((item) => (
        <TrustFundsTableRow
          key={item.id}
          item={item}
          isAdmin={isAdmin}
          isSelected={selected.includes(item.id)}
          hiddenColumns={hiddenColumns}
          columnWidths={columnWidths}
          onToggleSelection={() => onToggleSelection(item.id)}
          onContextMenu={(e) => onContextMenu(item, e)}
          onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
          onPin={() => onPin(item)}
          onViewLog={() => onViewLog(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          canEdit={canEdit}
          canDelete={canDelete}
          isUpdatingStatus={updatingStatusIds.has(item.id)}
        />
      ))}
      
      <TrustFundsTableTotalRow
        isAdmin={isAdmin}
        hiddenColumns={hiddenColumns}
        totals={totals}
      />
    </TableBody>
  );
}