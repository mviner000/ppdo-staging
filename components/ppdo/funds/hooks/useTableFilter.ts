// components/ppdo/funds/hooks/useTableFilter.ts

import { useMemo } from "react";
import { BaseFund, SortField, SortDirection } from "../types";

export const useTableFilter = <T extends BaseFund>(
    data: T[],
    searchQuery: string,
    sortField: SortField,
    sortDirection: SortDirection
) => {
    return useMemo(() => {
        let result = [...data];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.projectTitle.toLowerCase().includes(query) ||
                    item.officeInCharge.toLowerCase().includes(query) ||
                    (item.status && item.status.toLowerCase().includes(query)) ||
                    (item.remarks && item.remarks.toLowerCase().includes(query))
            );
        }

        // Sort
        if (sortField && sortDirection) {
            result.sort((a, b) => {
                let aVal: any = a[sortField];
                let bVal: any = b[sortField];

                // Handle null/undefined
                if (aVal === null || aVal === undefined) aVal = "";
                if (bVal === null || bVal === undefined) bVal = "";

                // String comparison
                if (typeof aVal === "string" && typeof bVal === "string") {
                    return sortDirection === "asc"
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                // Number comparison
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
            });
        }

        return result;
    }, [data, searchQuery, sortField, sortDirection]);
};
