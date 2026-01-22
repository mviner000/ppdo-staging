// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableTotalRow.tsx

"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "../../../utils";

interface TrustFundsTableTotalRowProps {
  isAdmin: boolean;
  hiddenColumns: Set<string>;
  totals: {
    received: number;
    obligatedPR: number;
    utilized: number;
    balance: number;
  };
}

export function TrustFundsTableTotalRow({
  isAdmin,
  hiddenColumns,
  totals,
}: TrustFundsTableTotalRowProps) {
  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

  return (
    <TableRow className="border-t bg-muted/30 font-semibold h-11">
      {isAdmin && <TableCell />}
      
      {isColumnVisible("projectTitle") && (
        <TableCell className="px-3">TOTAL</TableCell>
      )}

      {isColumnVisible("officeInCharge") && <TableCell />}
      {isColumnVisible("status") && <TableCell />}
      {isColumnVisible("dateReceived") && <TableCell />}

      {isColumnVisible("received") && (
        <TableCell className="px-3 text-right tabular-nums">
          {formatCurrency(totals.received)}
        </TableCell>
      )}

      {isColumnVisible("obligatedPR") && (
        <TableCell className="px-3 text-right tabular-nums">
          {formatCurrency(totals.obligatedPR)}
        </TableCell>
      )}

      {isColumnVisible("utilized") && (
        <TableCell className="px-3 text-right tabular-nums">
          {formatCurrency(totals.utilized)}
        </TableCell>
      )}

      {isColumnVisible("balance") && (
        <TableCell className="px-3 text-right tabular-nums">
          {formatCurrency(totals.balance)}
        </TableCell>
      )}

      {isColumnVisible("remarks") && <TableCell />}
      <TableCell className="no-print" />
    </TableRow>
  );
}