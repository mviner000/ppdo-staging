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
    <TableRow className="border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-semibold">
      {isAdmin && <TableCell className="px-3 py-4" />}
      
      {isColumnVisible("projectTitle") && (
        <TableCell className="px-4 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
          TOTAL
        </TableCell>
      )}
      
      {isColumnVisible("officeInCharge") && <TableCell className="px-4 sm:px-6 py-4" />}
      {isColumnVisible("status") && <TableCell className="px-4 sm:px-6 py-4" />}
      {isColumnVisible("dateReceived") && <TableCell className="px-4 sm:px-6 py-4" />}
      
      {isColumnVisible("received") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatCurrency(totals.received)}
        </TableCell>
      )}
      
      {isColumnVisible("obligatedPR") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatCurrency(totals.obligatedPR)}
        </TableCell>
      )}
      
      {isColumnVisible("utilized") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatCurrency(totals.utilized)}
        </TableCell>
      )}
      
      {isColumnVisible("utilizationRate") && (
        <TableCell className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatPercentage(totals.utilizationRate)}
        </TableCell>
      )}
      
      {isColumnVisible("balance") && (
        <TableCell className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatCurrency(totals.balance)}
        </TableCell>
      )}
      
      {isColumnVisible("remarks") && <TableCell className="px-4 sm:px-6 py-4" />}
      <TableCell className="px-4 sm:px-6 py-4 no-print" />
    </TableRow>
  );
}