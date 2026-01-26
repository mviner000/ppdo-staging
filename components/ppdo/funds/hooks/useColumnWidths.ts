// components/ppdo/funds/hooks/useColumnWidths.ts

import { useState, useEffect } from "react";
import { ColumnWidths } from "../types";
import { DEFAULT_COLUMN_WIDTHS } from "../constants";

const COLUMN_WIDTHS_STORAGE_KEY = "fundsTableColumnWidths";

export const useColumnWidths = () => {
    const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    return DEFAULT_COLUMN_WIDTHS;
                }
            }
        }
        return DEFAULT_COLUMN_WIDTHS;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(columnWidths));
        }
    }, [columnWidths]);

    return { columnWidths, setColumnWidths };
};
