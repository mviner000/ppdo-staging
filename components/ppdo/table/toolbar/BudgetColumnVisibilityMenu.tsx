// Moved from app/dashboard/project/[year]/components/table/BudgetColumnVisibilityMenu.tsx

import React from "react";

interface BudgetColumnVisibilityMenuProps {
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export function BudgetColumnVisibilityMenu({
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
}: BudgetColumnVisibilityMenuProps) {
  return (
    <div>
      {/* Example UI for column visibility menu */}
      <button onClick={onShowAll}>Show All</button>
      <button onClick={onHideAll}>Hide All</button>
      {[...hiddenColumns].map((column) => (
        <div key={column}>
          <label>
            <input
              type="checkbox"
              checked={!hiddenColumns.has(column)}
              onChange={(e) => onToggleColumn(column, e.target.checked)}
            />
            {column}
          </label>
        </div>
      ))}
    </div>
  );
}