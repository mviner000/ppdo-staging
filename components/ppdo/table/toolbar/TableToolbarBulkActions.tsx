"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BulkAction } from "./types";

interface TableToolbarBulkActionsProps {
  actions: BulkAction[];
}

/**
 * Renders a list of pluggable bulk actions for the table toolbar
 *
 * Each action is conditionally rendered and can be disabled based on selection count.
 * This keeps TableToolbar clean and extensible for custom bulk operations.
 *
 * @example
 * ```tsx
 * const bulkActions = [
 *   {
 *     id: 'auto-calculate',
 *     label: 'Toggle Auto-Calculate',
 *     icon: <Calculator />,
 *     onClick: () => toggleAutoCalc(),
 *     showWhen: (count) => count > 0,
 *   },
 *   {
 *     id: 'category',
 *     label: 'Change Category',
 *     icon: <Folder />,
 *     onClick: () => openCategoryModal(),
 *   }
 * ];
 *
 * <TableToolbarBulkActions actions={bulkActions} />
 * ```
 */
export function TableToolbarBulkActions({ actions }: TableToolbarBulkActionsProps) {
  // Filter actions that should be shown
  const visibleActions = actions.filter(
    (action) => !action.showWhen || action.showWhen(actions.length)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <>
      {visibleActions.map((action) => (
        <Button
          key={action.id}
          onClick={action.onClick}
          variant={action.variant || "outline"}
          size="sm"
          className="gap-2"
          disabled={action.isDisabled ? action.isDisabled(actions.length) : false}
        >
          {action.icon}
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </>
  );
}
