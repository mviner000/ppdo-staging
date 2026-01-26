// components/ppdo/funds/hooks/useColumnResize.ts

import { useState, useEffect, useRef } from "react";
import { ColumnWidths, ResizableColumn } from "../types";
import { MIN_COLUMN_WIDTH } from "../constants";

export const useColumnResize = (columnWidths: ColumnWidths, setColumnWidths: (widths: ColumnWidths) => void) => {
    const [isResizing, setIsResizing] = useState(false);
    const [resizingColumn, setResizingColumn] = useState<ResizableColumn | null>(null);
    const resizeStartX = useRef<number>(0);
    const resizeStartWidth = useRef<number>(0);

    const handleResizeStart = (column: ResizableColumn, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizingColumn(column);
        resizeStartX.current = e.clientX;
        resizeStartWidth.current = columnWidths[column];
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizingColumn) return;

            const delta = e.clientX - resizeStartX.current;
            const newWidth = Math.max(MIN_COLUMN_WIDTH, resizeStartWidth.current + delta);

            setColumnWidths({
                ...columnWidths,
                [resizingColumn]: newWidth,
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setResizingColumn(null);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizingColumn, columnWidths, setColumnWidths]);

    return { isResizing, resizingColumn, handleResizeStart };
};
