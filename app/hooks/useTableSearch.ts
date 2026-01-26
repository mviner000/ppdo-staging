/**
 * useTableSearch Hook
 * Manages table search functionality with debouncing and focus management
 * 
 * Features:
 * - Debounced search input (prevents excessive re-renders)
 * - Clear search with button or programmatically
 * - Focus management for keyboard navigation
 * - Type-safe with generic filtering
 * 
 * @example
 * ```tsx
 * const search = useTableSearch<BudgetItem>(data, {
 *   filterFn: (item, query) =>
 *     item.name.toLowerCase().includes(query.toLowerCase()),
 * });
 * 
 * return (
 *   <>
 *     <input 
 *       value={search.query}
 *       onChange={(e) => search.setQuery(e.target.value)}
 *       ref={search.inputRef}
 *     />
 *     <button onClick={search.clear}>Clear</button>
 *     {const filtered = search.filterItems(data);}
 *   </>
 * );
 * ```
 */

"use client";

import { useCallback, useRef, useState, useEffect } from "react";

export interface UseTableSearchOptions<T> {
  /** Initial search query */
  initialQuery?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Optional function to filter items based on query */
  filterFn?: (item: T, query: string) => boolean;
}

export interface UseTableSearchReturn<T> {
  /** Current search query */
  query: string;
  /** Set search query (debounced) */
  setQuery: (query: string) => void;
  /** Raw debounced query value */
  debouncedQuery: string;
  /** Clear search */
  clear: () => void;
  /** Ref to attach to search input */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Focus the search input */
  focus: () => void;
  /** Is search active */
  isActive: boolean;
  /** Filter items based on search (if filterFn provided) */
  filterItems: (items: T[]) => T[];
}

/**
 * Hook for managing table search with debouncing
 */
export function useTableSearch<T = any>(
  items?: T[],
  options: UseTableSearchOptions<T> = {}
): UseTableSearchReturn<T> {
  const {
    initialQuery = "",
    debounceMs = 300,
    filterFn,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce query updates
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs]);

  const clear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  }, []);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const filterItems = useCallback(
    (itemsToFilter: T[]): T[] => {
      if (!debouncedQuery || !filterFn) {
        return itemsToFilter;
      }
      return itemsToFilter.filter((item) => filterFn(item, debouncedQuery));
    },
    [debouncedQuery, filterFn]
  );

  return {
    query,
    setQuery,
    debouncedQuery,
    clear,
    inputRef,
    focus,
    isActive: query.length > 0,
    filterItems,
  };
}
