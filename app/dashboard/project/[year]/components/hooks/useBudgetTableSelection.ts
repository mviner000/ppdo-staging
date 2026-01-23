// app/dashboard/project/[year]/components/hooks/useBudgetTableSelection.ts

import { useState, useMemo } from "react";
import { BudgetItem } from "@/app/dashboard/project/[year]/types";
import { UseBudgetTableSelectionReturn } from "../../types";

/**
 * Manages row selection state and operations
 * Handles select all, select individual rows, and bulk actions
 */
export function useBudgetTableSelection(
  filteredItems: BudgetItem[]
): UseBudgetTableSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);

  // Derived state
  const isAllSelected = useMemo(
    () =>
      filteredItems.length > 0 &&
      selectedIds.size === filteredItems.length,
    [filteredItems, selectedIds]
  );

  const isIndeterminate = useMemo(
    () =>
      selectedIds.size > 0 && selectedIds.size < filteredItems.length,
    [filteredItems, selectedIds]
  );

  // Handler functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredItems.map((item) => item.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  return {
    selectedIds,
    selectedItem,
    setSelectedItem,
    setSelectedIds,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    isIndeterminate,
  };
}