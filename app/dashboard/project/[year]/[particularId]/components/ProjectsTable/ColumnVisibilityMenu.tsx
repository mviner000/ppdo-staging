// app/dashboard/project/[year]/[particularId]/components/ProjectsTable/ColumnVisibilityMenu.tsx

import { ColumnVisibilityMenu as BaseColumnVisibilityMenu, BaseColumn } from "@/components/ColumnVisibilityMenu";
import { AVAILABLE_COLUMNS } from "../../constants";

interface ColumnVisibilityMenuProps {
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

/**
 * Projects table specific column visibility menu wrapper
 */
export function ColumnVisibilityMenu({
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
}: ColumnVisibilityMenuProps) {
  // Transform AVAILABLE_COLUMNS to match BaseColumn interface
  const columns: BaseColumn[] = AVAILABLE_COLUMNS.map(col => ({
    key: col.id,
    label: col.label,
  }));

  return (
    <BaseColumnVisibilityMenu
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