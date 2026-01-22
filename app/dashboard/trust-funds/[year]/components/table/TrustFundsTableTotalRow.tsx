// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableTotalRow.tsx

"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercentage } from "../../../utils";

interface TrustFundsTableTotalRowProps {
  isAdmin: boolean;
  hiddenColumns: Set<string>;
  totals: {
    received: number;
    obligatedPR: number;
    utilized: number;
    balance: number;
    utilizationRate: number;
  };
}

export function TrustFundsTableTotalRow({
  isAdmin,
  hiddenColumns,
  totals,
}: TrustFundsTableTotalRowProps) {
  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

  return (
    <TableRow className="bg-zinc-100 dark:bg-zinc-900 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
      {isAdmin && <TableCell className="px-2" />}
      
      {isColumnVisible("projectTitle") && (
        <TableCell className="px-3 font-bold">TOTAL</TableCell>
      )}
      
      {isColumnVisible("officeInCharge") && <TableCell className="px-3" />}
      {isColumnVisible("status") && <TableCell className="px-3" />}
      {isColumnVisible("dateReceived") && <TableCell className="px-3" />}
      
      {isColumnVisible("received") && (
        <TableCell className="px-3 text-right tabular-nums font-bold">
          {formatCurrency(totals.received)}
        </TableCell>
      )}
      
      {isColumnVisible("obligatedPR") && (
        <TableCell className="px-3 text-right tabular-nums font-bold">
          {formatCurrency(totals.obligatedPR)}
        </TableCell>
      )}
      
      {isColumnVisible("utilized") && (
        <TableCell className="px-3 text-right tabular-nums font-bold">
          {formatCurrency(totals.utilized)}
        </TableCell>
      )}
      
      {isColumnVisible("utilizationRate") && (
        <TableCell className="px-3 text-center tabular-nums font-bold text-zinc-900 dark:text-zinc-100">
          {formatPercentage(totals.utilizationRate)}
        </TableCell>
      )}
      
      {isColumnVisible("balance") && (
        <TableCell className="px-3 text-right tabular-nums font-bold">
          {formatCurrency(totals.balance)}
        </TableCell>
      )}
      
      {isColumnVisible("remarks") && <TableCell className="px-3" />}
      <TableCell className="px-3 no-print" />
    </TableRow>
  );
}