// app/dashboard/trust-funds/[year]/components/table/TrustFundsTableColgroup.tsx

"use client";

interface TrustFundsTableColgroupProps {
  isAdmin: boolean;
  hiddenColumns: Set<string>;
  columnWidths: { projectTitle: number; remarks: number };
}

export function TrustFundsTableColgroup({
  isAdmin,
  hiddenColumns,
  columnWidths,
}: TrustFundsTableColgroupProps) {
  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);

  return (
    <colgroup>
      {isAdmin && <col style={{ width: '44px' }} />}
      {isColumnVisible("projectTitle") && <col style={{ width: `${columnWidths.projectTitle}px` }} />}
      {isColumnVisible("officeInCharge") && <col style={{ width: '200px' }} />}
      {isColumnVisible("status") && <col style={{ width: '180px' }} />}
      {isColumnVisible("dateReceived") && <col style={{ width: '130px' }} />}
      {isColumnVisible("received") && <col style={{ width: '150px' }} />}
      {isColumnVisible("obligatedPR") && <col style={{ width: '150px' }} />}
      {isColumnVisible("utilized") && <col style={{ width: '150px' }} />}
      {/* ✅ Utilization Rate column */}
      {isColumnVisible("utilizationRate") && <col style={{ width: '120px' }} />}
      {isColumnVisible("balance") && <col style={{ width: '150px' }} />}
      {isColumnVisible("remarks") && <col style={{ width: `${columnWidths.remarks}px` }} />}
      <col style={{ width: '80px' }} />
    </colgroup>
  );
}