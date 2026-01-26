/**
 * useTableColumnVisibility Hook
 * Manages table column visibility state with localStorage persistence
 * 
 * Features:
 * - Toggle column visibility
 * - Show/hide all columns
 * - Persist state to localStorage
 * - Type-safe column IDs
 * - Initialize with default visible columns
 * 
 * @example
 * ```tsx
 * const columns = useTableColumnVisibility("budgetTable", {
 *   defaultVisible: ["id", "name", "amount"],
 *   defaultHidden: ["notes"],
 * });
 * 
 * return (
 *   <>
 *     {columns.visibleColumns.map(col => (
 *       <input 
 *         key={col}
 *         type="checkbox" 
 *         checked
 *         onChange={() => columns.toggleColumn(col)}
 *       />
 *     ))}
 *   </>
 * );
 * ```
 */

"use client";

import { useCallback, useState, useEffect } from "react";

export interface UseTableColumnVisibilityOptions {
  /** Columns visible by default */
  defaultVisible?: string[];
  /** Columns hidden by default */
  defaultHidden?: string[];
  /** All available columns */
  allColumns?: string[];
  /** Enable localStorage persistence */
  persist?: boolean;
}

export interface UseTableColumnVisibilityReturn {
  /** Set of hidden column IDs */
  hiddenColumns: Set<string>;
  /** Toggle column visibility */
  toggleColumn: (columnId: string, isChecked?: boolean) => void;
  /** Show all columns */
  showAll: () => void;
  /** Hide all columns */
  hideAll: () => void;
  /** Get visible columns */
  visibleColumns: string[];
  /** Check if column is visible */
  isVisible: (columnId: string) => boolean;
  /** Reset to default visibility */
  reset: () => void;
}

/**
 * Hook for managing table column visibility with localStorage
 */
export function useTableColumnVisibility(
  tableId: string,
  options: UseTableColumnVisibilityOptions = {}
): UseTableColumnVisibilityReturn {
  const {
    defaultVisible = [],
    defaultHidden = [],
    allColumns = [...defaultVisible, ...defaultHidden],
    persist = true,
  } = options;

  const storageKey = `table-column-visibility-${tableId}`;
  
  // Initialize hidden columns
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    // Try to load from localStorage first
    if (persist && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch (e) {
        console.warn(`Failed to load column visibility from localStorage:`, e);
      }
    }

    // Fall back to defaults
    return new Set(defaultHidden);
  });

  // Persist to localStorage when hidden columns change
  useEffect(() => {
    if (!persist || typeof window === "undefined") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(hiddenColumns)));
    } catch (e) {
      console.warn(`Failed to save column visibility to localStorage:`, e);
    }
  }, [hiddenColumns, storageKey, persist]);

  const toggleColumn = useCallback(
    (columnId: string, isChecked?: boolean) => {
      setHiddenColumns((prev) => {
        const next = new Set(prev);
        
        // If isChecked is explicitly provided, use it (for checkboxes)
        if (isChecked !== undefined) {
          if (isChecked) {
            // Checked = visible, so remove from hidden
            next.delete(columnId);
          } else {
            // Unchecked = hidden, so add to hidden
            next.add(columnId);
          }
        } else {
          // Toggle
          if (next.has(columnId)) {
            next.delete(columnId);
          } else {
            next.add(columnId);
          }
        }
        
        return next;
      });
    },
    []
  );

  const showAll = useCallback(() => {
    setHiddenColumns(new Set());
  }, []);

  const hideAll = useCallback(() => {
    setHiddenColumns(new Set(allColumns));
  }, [allColumns]);

  const isVisible = useCallback(
    (columnId: string) => !hiddenColumns.has(columnId),
    [hiddenColumns]
  );

  const visibleColumns = allColumns.filter((id) => !hiddenColumns.has(id));

  const reset = useCallback(() => {
    setHiddenColumns(new Set(defaultHidden));
  }, [defaultHidden]);

  return {
    hiddenColumns,
    toggleColumn,
    showAll,
    hideAll,
    visibleColumns,
    isVisible,
    reset,
  };
}
