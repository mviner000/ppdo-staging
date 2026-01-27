// app/dashboard/project/[year]/components/table/BudgetContextMenu.tsx

"use client";

import { forwardRef } from "react";
import { Pin, PinOff, Edit, Trash2, Calculator } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BudgetItem } from "@/app/dashboard/project/[year]/types";
import { useContextMenuPosition } from "@/components/ui/hooks/useContextMenuPosition";

interface BudgetContextMenuProps {
  position: { x: number; y: number };
  item: BudgetItem;
  canEdit: boolean;
  canDelete: boolean;
  onPin: (item: BudgetItem) => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
  onToggleAutoCalculate?: (item: BudgetItem, newValue: boolean) => void;
  isTogglingAutoCalculate?: boolean;
}

export const BudgetContextMenu = forwardRef<
  HTMLDivElement,
  BudgetContextMenuProps
>(({ 
  position, 
  item, 
  canEdit, 
  canDelete, 
  onPin, 
  onEdit, 
  onDelete,
  onToggleAutoCalculate,
  isTogglingAutoCalculate = false
}, ref) => {
  // Get current auto-calculate state (default to true for backward compatibility)
  const isAutoCalculate = (item as any).autoCalculateBudgetUtilized !== false;

  const { ref: posRef, style } = useContextMenuPosition(position.x, position.y);

  return (
    <div
      ref={(node) => {
        if (typeof ref === "function") ref(node as any);
        else if (ref) (ref as any).current = node;
        (posRef as any).current = node;
      }}
      className="fixed bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-50 min-w-[220px]"
      style={{
        top: (style as any).top ? `${(style as any).top}px` : undefined,
        left: (style as any).left ? `${(style as any).left}px` : undefined,
      }}
    >
      {/* Pin/Unpin */}
      <button
        onClick={() => onPin(item)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
      >
        {item.isPinned ? (
          <>
            <PinOff className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300">Unpin</span>
          </>
        ) : (
          <>
            <Pin className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300">Pin to top</span>
          </>
        )}
      </button>

      {/* 🆕 AUTO-CALCULATE TOGGLE */}
      {onToggleAutoCalculate && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 my-1">
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <Calculator className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Auto-Calculate Budget
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isAutoCalculate ? "ON" : "OFF"}
                </span>
              </div>
            </div>
            <Switch
              checked={isAutoCalculate}
              onCheckedChange={(checked) => onToggleAutoCalculate(item, checked)}
              disabled={isTogglingAutoCalculate}
              className="ml-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Edit */}
      {canEdit && (
        <button
          onClick={() => onEdit(item)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
        >
          <Edit className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-zinc-700 dark:text-zinc-300">Edit</span>
        </button>
      )}

      {/* Delete */}
      {canDelete && (
        <button
          onClick={() => onDelete(item)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-3"
        >
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">
            Move to Trash
          </span>
        </button>
      )}
    </div>
  );
});

BudgetContextMenu.displayName = "BudgetContextMenu";