// components/ppdo/funds/hooks/useTableSort.ts

import { useState } from "react";
import { SortField, SortDirection } from "../types";

export const useTableSort = () => {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(
                sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc"
            );
            if (sortDirection === "desc") setSortField(null);
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    return { sortField, sortDirection, handleSort };
};
