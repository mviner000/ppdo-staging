// components/ppdo/funds/components/context-menu/FundsContextMenu.tsx

import React, { useRef, useEffect } from "react";
import { Pin, PinOff, History, Edit, Trash2, Calculator } from "lucide-react";
import { ContextMenuState } from "../../types";
import { useContextMenuPosition } from "@/components/ui/hooks/useContextMenuPosition";

interface FundsContextMenuProps {
    contextMenu: ContextMenuState | null;
    onClose: () => void;
    onPin: () => void;
    onViewLog: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
    onToggleAutoCalculate: () => void;
}

export function FundsContextMenu({
    contextMenu,
    onClose,
    onPin,
    onViewLog,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
    onToggleAutoCalculate,
}: FundsContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (contextMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [contextMenu, onClose]);

    // Call hook before early return to follow Rules of Hooks
    const { ref, style } = useContextMenuPosition(
        contextMenu?.x ?? 0,
        contextMenu?.y ?? 0
    );

    if (!contextMenu) return null;

    const isPinned = contextMenu.entity?.isPinned;

    return (
        <div
            ref={(node) => {
                menuRef.current = node;
                (ref as any).current = node;
            }}
            className="fixed bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-50 min-w-[220px]"
            style={{
                top: (style as any).top ? `${(style as any).top}px` : undefined,
                left: (style as any).left ? `${(style as any).left}px` : undefined,
            }}
        >
            {/* Pin/Unpin */}
            <button
                onClick={() => {
                    onPin();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
                {isPinned ? (
                    <>
                        <PinOff className="w-4 h-4" />
                        Unpin
                    </>
                ) : (
                    <>
                        <Pin className="w-4 h-4" />
                        Pin to top
                    </>
                )}
            </button>

            {/* Auto Calculate Toggle */}
            <button
                onClick={onToggleAutoCalculate}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
                {contextMenu.entity.autoCalculateFinancials ? (
                    <span className="flex items-center gap-3">
                        <Calculator className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        Disable Auto-Calc
                    </span>
                ) : (
                    <span className="flex items-center gap-3">
                        <Calculator className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        Enable Auto-Calc
                    </span>
                )}
            </button>

            {/* Activity Log */}
            <button
                onClick={() => {
                    onViewLog();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
                <History className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                Activity Log
            </button>

            {/* Edit */}
            {canEdit && (
                <button
                    onClick={() => {
                        onEdit();
                        onClose();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </button>
            )}

            {/* Delete */}
            {canDelete && (
                <button
                    onClick={() => {
                        onDelete();
                        onClose();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-red-600 dark:text-red-400 whitespace-nowrap transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Move to Trash
                </button>
            )}
        </div>
    );
}
