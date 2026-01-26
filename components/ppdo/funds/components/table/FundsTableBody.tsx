// components/ppdo/funds/components/table/FundsTableBody.tsx

"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BaseFund } from "../../types";
import { FundsTableRow } from "./FundsTableRow";
import { FundsTableTotalRow } from "./FundsTableTotalRow";

interface FundsTableBodyProps<T extends BaseFund> {
    data: T[];
    year: number;
    isAdmin: boolean;
    selected: string[];
    hiddenColumns: Set<string>;
    columnWidths: { projectTitle: number; remarks: number };
    totals: {
        received: number;
        obligatedPR: number;
        utilized: number;
        balance: number;
        utilizationRate: number;
    };
    updatingStatusIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onContextMenu: (item: T, e: React.MouseEvent) => void;
    onStatusChange: (itemId: string, newStatus: string) => void;
    onPin: (item: T) => void;
    onViewLog: (item: T) => void;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    canEdit: boolean;
    canDelete: boolean;
    fundType: 'trust' | 'specialEducation' | 'specialHealth';
    emptyMessage?: string;
}

export function FundsTableBody<T extends BaseFund>({
    data,
    year,
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
    fundType,
    emptyMessage = "No funds found",
}: FundsTableBodyProps<T>) {
    if (data.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={20} className="text-center py-8 text-zinc-500">
                        {emptyMessage}
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody>
            {data.map((item) => (
                <FundsTableRow
                    key={item.id}
                    item={item}
                    year={year}
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
                    fundType={fundType}
                />
            ))}

            <FundsTableTotalRow
                isAdmin={isAdmin}
                hiddenColumns={hiddenColumns}
                totals={totals}
            />
        </TableBody>
    );
}
