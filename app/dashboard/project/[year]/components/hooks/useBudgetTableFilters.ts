// app/dashboard/project/[year]/components/hooks/useBudgetTableFilters.ts

import { useState, useEffect, useRef, useMemo } from "react";
import { BudgetItem, SortField } from "@/app/dashboard/project/[year]/types";
import {
  extractUniqueStatuses,
  extractUniqueYears,
} from "@/app/dashboard/project/[year]/utils";
import { STORAGE_KEYS } from "@/app/dashboard/project/[year]/constants";
import { UseBudgetTableFiltersReturn } from "../../types";

/**
 * Manages all filtering, sorting, and column visibility state
 * Handles search, status filter, year filter, sort, and column visibility
 */
export function useBudgetTableFilters(
  budgetItems: BudgetItem[]
): UseBudgetTableFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null!);

  // Initialize year filter from URL or sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const yearParam = urlParams.get("year");

      if (yearParam) {
        const year = parseInt(yearParam);
        if (!isNaN(year)) {
          setYearFilter([year]);
          return;
        }
      }

      // Fallback to sessionStorage
      const sessionYear = sessionStorage.getItem(
        STORAGE_KEYS.BUDGET_YEAR_PREFERENCE
      );
      if (sessionYear) {
        const year = parseInt(sessionYear);
        if (!isNaN(year)) {
          setYearFilter([year]);
        }
      }
    }
  }, []);

  // Sync yearFilter to URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (yearFilter.length > 0) {
        const params = new URLSearchParams();
        yearFilter.forEach((year) => params.append("year", String(year)));

        const currentParams = new URLSearchParams(window.location.search);
        currentParams.forEach((value, key) => {
          if (key !== "year") {
            params.append(key, value);
          }
        });

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
      } else {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("year");

        if (currentParams.toString()) {
          const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
          window.history.replaceState(null, "", newUrl);
        } else {
          const newUrl = window.location.pathname;
          window.history.replaceState(null, "", newUrl);
        }
      }
    }
  }, [yearFilter]);

  // Extract unique values for filters
  const uniqueStatuses = useMemo(
    () => extractUniqueStatuses(budgetItems),
    [budgetItems]
  );

  const uniqueYears = useMemo(
    () => extractUniqueYears(budgetItems),
    [budgetItems]
  );

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    searchQuery ||
      statusFilter.length > 0 ||
      yearFilter.length > 0 ||
      sortField
  );

  // Handler functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleYearFilter = (year: number) => {
    setYearFilter((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setYearFilter([]);
    setSortField(null);
    setSortDirection(null);
  };

  const handleToggleColumn = (columnId: string, isChecked: boolean) => {
    const newHidden = new Set(hiddenColumns);
    if (isChecked) {
      newHidden.delete(columnId);
    } else {
      newHidden.add(columnId);
    }
    setHiddenColumns(newHidden);
  };

  const handleShowAllColumns = () => {
    setHiddenColumns(new Set());
  };

  const handleHideAllColumns = () => {
    // This will trigger a warning modal in the parent component
    // The actual hiding is done after confirmation
  };

  return {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    statusFilter,
    yearFilter,
    hiddenColumns,
    searchInputRef,
    handleSort,
    toggleStatusFilter,
    toggleYearFilter,
    clearAllFilters,
    handleToggleColumn,
    handleShowAllColumns,
    handleHideAllColumns,
    hasActiveFilters,
    uniqueStatuses,
    uniqueYears,
  };
}