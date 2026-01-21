// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/TableTotalsRow.tsx

"use client";

import { ColumnConfig, ColumnTotals } from "../types/breakdown.types";
import { formatCurrency, formatPercentage } from "../utils/formatters";

interface TableTotalsRowProps {
  columns: ColumnConfig[];
  totals: ColumnTotals;
  gridTemplateColumns: string;
}

export function TableTotalsRow({
  columns,
  totals,
  gridTemplateColumns,
}: TableTotalsRowProps) {
  return (
    <tr
      className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-800"
    >
      {/* Empty Row Number Cell */}
      <td 
        className="text-center py-2 text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200"
        style={{ 
          border: '2px solid rgb(228 228 231 / 1)',
        }}
      >
        {/* Empty */}
      </td>

      {/* Column Totals */}
      {columns.map(column => {
        let cellContent = "";
        
        if (column.type === "currency" && totals[column.key] !== undefined) {
          cellContent = formatCurrency(totals[column.key]);
        } else if (column.type === "number" && totals[column.key] !== undefined) {
          cellContent = formatPercentage(totals[column.key]);
        }

        return (
          <td
            key={column.key}
            className="px-2 sm:px-3 py-2 font-bold text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-200"
            style={{ 
              border: '2px solid rgb(228 228 231 / 1)',
              textAlign: column.align,
            }}
          >
            {cellContent}
          </td>
        );
      })}

      {/* Total Label */}
      <td 
        className="text-center font-bold text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-200 uppercase tracking-wide"
        style={{ 
          border: '2px solid rgb(228 228 231 / 1)',
        }}
      >
        TOTAL
      </td>
    </tr>
  );
}