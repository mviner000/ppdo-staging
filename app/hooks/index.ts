/**
 * Table Management Hooks Index
 * 
 * Core hooks for standardized table functionality:
 * - useTableSearch: Search input with debouncing
 * - useTableSelection: Row selection with select-all
 * - useTableColumnVisibility: Column visibility with persistence
 */

export {
  useTableSearch,
  type UseTableSearchOptions,
  type UseTableSearchReturn,
} from "./useTableSearch";

export {
  useTableSelection,
  type UseTableSelectionOptions,
  type UseTableSelectionReturn,
} from "./useTableSelection";

export {
  useTableColumnVisibility,
  type UseTableColumnVisibilityOptions,
  type UseTableColumnVisibilityReturn,
} from "./useTableColumnVisibility";

// Re-export existing hooks for convenience
export { useCurrentUser } from "./useCurrentUser";
export { usePermissions } from "./usePermissions";
export { useDebounce } from "./use-debounce";
