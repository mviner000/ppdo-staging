// app/components/Spreadsheet/hooks/useColumnResize.ts

import { useState, useCallback, useEffect } from "react";
import { ColumnDefinition } from "../types";

const DEFAULT_COLUMN_WIDTH = 100;
const MIN_COLUMN_WIDTH = 50;
const MAX_COLUMN_WIDTH = 500;
const STORAGE_KEY_PREFIX = "spreadsheet_column_";

interface ColumnResizeState {
  columnWidths: number[];
  columnAlignments: ("left" | "center" | "right")[];
}

/**
 * Hook to manage column resizing and alignment
 */
export function useColumnResize(
  columns: string[],
  data: any[],
  columnDefinitions: ColumnDefinition[]
) {
  // Initialize alignment based on column definitions
  const getInitialAlignments = useCallback(() => {
    const alignments: ("left" | "center" | "right")[] = [];
    
    columnDefinitions.forEach((col) => {
      // Use defined alignment or default based on type
      if (col.align) {
        alignments.push(col.align);
      } else {
        // Default alignments based on data type
        switch (col.type) {
          case "currency":
          case "number":
          case "percentage":
            alignments.push("right");
            break;
          default:
            alignments.push("left");
        }
      }
    });
    
    // Add alignment for total column if exists
    if (columns.length > columnDefinitions.length) {
      alignments.push("right"); // Total column is always right-aligned
    }
    
    return alignments;
  }, [columnDefinitions, columns.length]);

  // Load saved state from sessionStorage
  const loadSavedState = useCallback((): ColumnResizeState => {
    if (typeof window === "undefined") {
      return {
        columnWidths: Array(columns.length).fill(DEFAULT_COLUMN_WIDTH),
        columnAlignments: getInitialAlignments(),
      };
    }

    try {
      const savedWidths = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}widths`);
      const savedAlignments = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}alignments`);

      return {
        columnWidths: savedWidths 
          ? JSON.parse(savedWidths) 
          : Array(columns.length).fill(DEFAULT_COLUMN_WIDTH),
        columnAlignments: savedAlignments
          ? JSON.parse(savedAlignments)
          : getInitialAlignments(),
      };
    } catch (error) {
      return {
        columnWidths: Array(columns.length).fill(DEFAULT_COLUMN_WIDTH),
        columnAlignments: getInitialAlignments(),
      };
    }
  }, [columns.length, getInitialAlignments]);

  const [columnWidths, setColumnWidths] = useState<number[]>(() => loadSavedState().columnWidths);
  const [columnAlignments, setColumnAlignments] = useState<("left" | "center" | "right")[]>(
    () => loadSavedState().columnAlignments
  );

  // Save to sessionStorage whenever widths or alignments change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}widths`, JSON.stringify(columnWidths));
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}alignments`, JSON.stringify(columnAlignments));
      } catch (error) {
        console.error("Failed to save to sessionStorage:", error);
      }
    }
  }, [columnWidths, columnAlignments]);

  // Calculate optimal width for a column based on content
  const calculateOptimalWidth = useCallback((colIndex: number): number => {
    if (!data.length) return DEFAULT_COLUMN_WIDTH;

    const columnKey = columnDefinitions[colIndex]?.key;
    if (!columnKey) return DEFAULT_COLUMN_WIDTH;

    // Measure header width
    const headerText = columnDefinitions[colIndex]?.label || "";
    const headerWidth = Math.max(headerText.length * 8, 50);

    // Measure content width (sample first 100 rows for performance)
    const sampleSize = Math.min(data.length, 100);
    const contentWidths = data.slice(0, sampleSize).map((row) => {
      const value = String(row[columnKey] || "");
      return value.length * 7; // Approximate character width
    });

    const maxContentWidth = Math.max(...contentWidths, headerWidth);
    
    // Add padding and clamp to min/max
    const optimalWidth = Math.min(
      Math.max(maxContentWidth + 20, MIN_COLUMN_WIDTH),
      MAX_COLUMN_WIDTH
    );

    return optimalWidth;
  }, [data, columnDefinitions]);

  // Handle resize start
  const handleResizeStart = useCallback((colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = columnWidths[colIndex];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(
        Math.max(startWidth + deltaX, MIN_COLUMN_WIDTH),
        MAX_COLUMN_WIDTH
      );

      setColumnWidths((prev) => {
        const newWidths = [...prev];
        newWidths[colIndex] = newWidth;
        return newWidths;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [columnWidths]);

  // Handle double-click auto-resize
  const handleDoubleClickResize = useCallback((colIndex: number) => {
    const optimalWidth = calculateOptimalWidth(colIndex);
    setColumnWidths((prev) => {
      const newWidths = [...prev];
      newWidths[colIndex] = optimalWidth;
      return newWidths;
    });
  }, [calculateOptimalWidth]);

  // Update column alignment
  const updateColumnAlignment = useCallback((colIndex: number, alignment: "left" | "center" | "right") => {
    setColumnAlignments((prev) => {
      const newAlignments = [...prev];
      newAlignments[colIndex] = alignment;
      return newAlignments;
    });
  }, []);

  return {
    columnWidths,
    columnAlignments,
    handleResizeStart,
    handleDoubleClickResize,
    updateColumnAlignment,
  };
}