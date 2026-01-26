/**
 * useTableSelection Hook
 * Manages table row selection state with select-all functionality
 * 
 * Features:
 * - Individual row selection
 * - Select all / Deselect all
 * - Indeterminate state tracking
 * - Bulk operations support
 * - Type-safe with generic IDs
 * 
 * @example
 * ```tsx
 * const allIds = data.map(item => item._id);
 * const selection = useTableSelection<string>(allIds);
 *
 * return (
 *   <>
 *     <input
 *       type="checkbox"
 *       checked={selection.selectAllChecked}
 *       onChange={(e) => selection.handleSelectAll(e.currentTarget.checked, allIds)}
 *     />
 *     {/* If selection.isIndeterminate, show indeterminate state *\/}
 *     <span>{selection.selectedIds.size} selected</span>
 *   </>
 * );
 * ```
 */

"use client";

import { useCallback, useState, useMemo } from "react";

export interface UseTableSelectionOptions<T> {
  /** Initial selected IDs */
  initialSelected?: Set<T>;
}

export interface UseTableSelectionReturn<T> {
  /** Set of selected IDs */
  selectedIds: Set<T>;
  /** Toggle selection for a single ID */
  toggleId: (id: T) => void;
  /** Select multiple IDs */
  selectIds: (ids: T[]) => void;
  /** Deselect multiple IDs */
  deselectIds: (ids: T[]) => void;
  /** Select all available IDs */
  selectAll: (allIds: T[]) => void;
  /** Deselect all IDs */
  clearAll: () => void;
  /** Check if ID is selected */
  isSelected: (id: T) => boolean;
  /** Handle select all checkbox change */
  handleSelectAll: (checked: boolean, allIds?: T[]) => void;
  /** Is select all checkbox checked */
  selectAllChecked: boolean;
  /** Is select all checkbox in indeterminate state */
  isIndeterminate: boolean;
  /** Get count of selected items */
  count: number;
}

/**
 * Hook for managing table row selection
 */
export function useTableSelection<T = string | number>(
  allIds?: T[],
  options: UseTableSelectionOptions<T> = {}
): UseTableSelectionReturn<T> {
  const { initialSelected = new Set() } = options;
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set(initialSelected));

  const toggleId = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectIds = useCallback((ids: T[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectIds = useCallback((ids: T[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const selectAll = useCallback((idsToSelect: T[]) => {
    setSelectedIds(new Set(idsToSelect));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: T) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const handleSelectAll = useCallback((checked: boolean, idsForSelectAll?: T[]) => {
    if (checked) {
      if (idsForSelectAll) {
        selectAll(idsForSelectAll);
      }
    } else {
      clearAll();
    }
  }, [selectAll, clearAll]);

  // Compute derived states
  const selectAllChecked = useMemo(() => {
    if (!allIds || allIds.length === 0) return false;
    return allIds.every((id) => selectedIds.has(id));
  }, [allIds, selectedIds]);

  const isIndeterminate = useMemo(() => {
    if (!allIds || allIds.length === 0 || selectedIds.size === 0) return false;
    return !selectAllChecked && selectedIds.size > 0;
  }, [allIds, selectedIds, selectAllChecked]);

  const count = useMemo(() => selectedIds.size, [selectedIds]);

  return {
    selectedIds,
    toggleId,
    selectIds,
    deselectIds,
    selectAll,
    clearAll,
    isSelected,
    handleSelectAll,
    selectAllChecked,
    isIndeterminate,
    count,
  };
}
