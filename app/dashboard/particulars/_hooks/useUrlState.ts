// app/dashboard/particulars/_hooks/useUrlState.ts

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UrlState {
  year?: string;
  search?: string;
  expanded?: string[];
  sortOrder?: "asc" | "desc";
}

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current URL state - memoized to prevent unnecessary recalculations
  const urlState = useMemo((): UrlState => {
    const year = searchParams.get("year") || undefined;
    const search = searchParams.get("search") || undefined;
    const expanded = searchParams.get("expanded")?.split(",").filter(Boolean) || undefined;
    const sortOrder = (searchParams.get("sort") as "asc" | "desc") || undefined;

    return { year, search, expanded, sortOrder };
  }, [searchParams]);

  // Update URL with new state - debounced and optimized
  const updateUrlState = useCallback(
    (updates: Partial<UrlState>) => {
      // Build query string from current params + updates
      const params = new URLSearchParams(searchParams.toString());

      // Handle year - keep "all" in URL
      if (updates.year !== undefined) {
        if (updates.year) {
          params.set("year", updates.year);
        } else {
          params.delete("year");
        }
      }

      // Handle search
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set("search", updates.search);
        } else {
          params.delete("search");
        }
      }

      // Handle expanded
      if (updates.expanded !== undefined) {
        if (updates.expanded && updates.expanded.length > 0) {
          params.set("expanded", updates.expanded.join(","));
        } else {
          params.delete("expanded");
        }
      }

      // Handle sortOrder
      if (updates.sortOrder !== undefined) {
        if (updates.sortOrder && updates.sortOrder !== "asc") {
          params.set("sort", updates.sortOrder);
        } else {
          params.delete("sort");
        }
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Only update if URL actually changed
      const currentUrl = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      if (newUrl !== currentUrl) {
        router.replace(newUrl, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  // Clear specific state
  const clearUrlState = useCallback(
    (keys: (keyof UrlState)[]) => {
      const updates: Partial<UrlState> = {};

      keys.forEach((key) => {
        if (key === "expanded") {
          updates[key] = [];
        } else {
          updates[key] = undefined;
        }
      });

      updateUrlState(updates);
    },
    [updateUrlState]
  );

  // Get shareable URL
  const getShareableUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  // Copy URL to clipboard
  const copyUrlToClipboard = useCallback(async () => {
    const url = getShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error("Failed to copy URL:", error);
      return false;
    }
  }, [getShareableUrl]);

  return {
    urlState,
    updateUrlState,
    clearUrlState,
    getShareableUrl,
    copyUrlToClipboard,
  };
}