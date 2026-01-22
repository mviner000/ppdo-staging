// app/dashboard/project/budget/components/table/BudgetColumnVisibilityMenu.tsx

import { ColumnVisibilityMenu, BaseColumn } from "@/components/ColumnVisibilityMenu";
import { BUDGET_TABLE_COLUMNS } from "../../constants";

interface BudgetColumnVisibilityMenuProps {
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

/**
 * Budget table specific column visibility menu wrapper
 */
export function BudgetColumnVisibilityMenu({
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
}: BudgetColumnVisibilityMenuProps) {
  // Transform BUDGET_TABLE_COLUMNS to match BaseColumn interface
  const columns: BaseColumn[] = BUDGET_TABLE_COLUMNS.map(col => ({
    key: col.key,
    label: col.label,
  }));

  return (
    <ColumnVisibilityMenu
      columns={columns}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn}
      onShowAll={onShowAll}
      onHideAll={onHideAll}
      label="Toggle Columns"
      showCount={true}
    />
  );
}