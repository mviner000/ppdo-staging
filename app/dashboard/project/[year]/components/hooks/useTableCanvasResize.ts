// app/dashboard/project/[year]/components/hooks/useTableCanvasResize.ts

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CanvasElement } from '@/app/(extra)/canvas/_components/editor/types';
import {
  detectTableGroups,
  getColumnElements,
  getRowElements,
  calculateOptimalColumnWidth,
  TableGroup,
} from '@/lib/canvas-utils/tableStructure';
import {
  MIN_COLUMN_WIDTH,
  MIN_ROW_HEIGHT,
  MAX_COLUMN_WIDTH,
  MAX_ROW_HEIGHT,
  KEYBOARD_RESIZE_STEP,
  KEYBOARD_RESIZE_STEP_LARGE,
  KEYBOARD_RESIZE_STEP_SMALL,
  getMaxTableWidth,
} from '../../../../../../components/ppdo/table/print-preview/table-resize/constants';
import {
  ResizingColumnState,
  ResizingRowState,
  HoveredHandle,
  UseTableCanvasResizeReturn,
  UseTableCanvasResizeOptions,
} from '../../../../../../components/ppdo/table/print-preview/table-resize/types';

/**
 * Hook for managing table column and row resizing in canvas
 * Provides Google Docs-like resize behavior for canvas-based tables
 * Enforces page boundary constraints to prevent table from exceeding page size
 */
export function useTableCanvasResize({
  elements,
  onUpdateElement,
  setIsDirty,
  isEditorMode,
  pageSize = 'A4',
  pageOrientation = 'portrait',
}: UseTableCanvasResizeOptions): UseTableCanvasResizeReturn {
  // State for tracking resize operations
  const [resizingColumn, setResizingColumn] = useState<ResizingColumnState | null>(null);
  const [resizingRow, setResizingRow] = useState<ResizingRowState | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<HoveredHandle | null>(null);
  const [focusedHandle, setFocusedHandle] = useState<HoveredHandle | null>(null);

  // Ref to track if we're currently in a resize operation
  const isResizingRef = useRef(false);

  // Detect and parse table structure from elements
  const tableGroups = useMemo(() => {
    if (!isEditorMode) return [];
    return detectTableGroups(elements);
  }, [elements, isEditorMode]);

  /**
   * Starts a column resize operation
   */
  const startResizeColumn = useCallback(
    (groupId: string, columnIndex: number, startX: number, startY: number = 0) => {
      const group = tableGroups.find((g) => g.groupId === groupId);
      if (!group || columnIndex >= group.columns.length) return;

      const column = group.columns[columnIndex];
      setResizingColumn({
        groupId,
        columnIndex,
        startX,
        startWidth: column.width,
        currentDelta: 0,
        currentWidth: column.width,
        tooltipX: startX,
        tooltipY: startY,
      });
      isResizingRef.current = true;

      // Disable text selection during drag
      document.body.style.userSelect = 'none';
    },
    [tableGroups]
  );

  /**
   * Starts a row resize operation
   */
  const startResizeRow = useCallback(
    (groupId: string, rowIndex: number, startY: number, startX: number = 0) => {
      const group = tableGroups.find((g) => g.groupId === groupId);
      if (!group || rowIndex >= group.rows.length) return;

      const row = group.rows[rowIndex];
      setResizingRow({
        groupId,
        rowIndex,
        startY,
        startHeight: row.height,
        currentDelta: 0,
        currentHeight: row.height,
        tooltipX: startX,
        tooltipY: startY,
      });
      isResizingRef.current = true;

      // Disable text selection during drag
      document.body.style.userSelect = 'none';
    },
    [tableGroups]
  );

  // Calculate max table width based on page size and orientation
  const maxTableWidth = useMemo(
    () => getMaxTableWidth(pageSize, pageOrientation),
    [pageSize, pageOrientation]
  );

  /**
   * Handles column resize during mouse move
   * Enforces page boundary constraints
   */
  const handleColumnMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return;

      const group = tableGroups.find((g) => g.groupId === resizingColumn.groupId);
      if (!group) return;

      const column = group.columns[resizingColumn.columnIndex];
      const delta = e.clientX - resizingColumn.startX;

      // Calculate current table width (sum of all column widths)
      const currentTableWidth = group.columns.reduce((sum, col) => sum + col.width, 0);

      // Calculate proposed new width
      let newWidth = Math.max(
        MIN_COLUMN_WIDTH,
        Math.min(MAX_COLUMN_WIDTH, resizingColumn.startWidth + delta)
      );

      // Enforce page boundary: don't let total table width exceed max
      const proposedDelta = newWidth - resizingColumn.startWidth;
      const proposedTableWidth = currentTableWidth + proposedDelta;

      if (proposedTableWidth > maxTableWidth) {
        // Limit the resize to stay within page bounds
        const allowedDelta = maxTableWidth - currentTableWidth;
        newWidth = resizingColumn.startWidth + allowedDelta;
        newWidth = Math.max(MIN_COLUMN_WIDTH, newWidth);
      }

      const actualDelta = newWidth - resizingColumn.startWidth;

      // Update current delta, width, and tooltip position for visual feedback
      setResizingColumn((prev) =>
        prev ? {
          ...prev,
          currentDelta: actualDelta,
          currentWidth: newWidth,
          tooltipX: e.clientX,
          tooltipY: e.clientY,
        } : null
      );

      // Update all elements in this column
      const columnElements = getColumnElements(group.elements, column);
      columnElements.forEach((el) => {
        onUpdateElement(el.id, { width: newWidth });
      });

      // Shift columns to the right
      if (actualDelta !== 0) {
        for (let i = resizingColumn.columnIndex + 1; i < group.columns.length; i++) {
          const nextColumn = group.columns[i];
          const nextColumnElements = getColumnElements(group.elements, nextColumn);
          nextColumnElements.forEach((el) => {
            onUpdateElement(el.id, { x: el.x + actualDelta });
          });
        }
      }
    },
    [resizingColumn, tableGroups, onUpdateElement, maxTableWidth]
  );

  /**
   * Handles row resize during mouse move
   */
  const handleRowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingRow) return;

      const group = tableGroups.find((g) => g.groupId === resizingRow.groupId);
      if (!group) return;

      const row = group.rows[resizingRow.rowIndex];
      const delta = e.clientY - resizingRow.startY;
      const newHeight = Math.max(
        MIN_ROW_HEIGHT,
        Math.min(MAX_ROW_HEIGHT, resizingRow.startHeight + delta)
      );
      const actualDelta = newHeight - resizingRow.startHeight;

      // Update current delta, height, and tooltip position for visual feedback
      setResizingRow((prev) =>
        prev ? {
          ...prev,
          currentDelta: actualDelta,
          currentHeight: newHeight,
          tooltipX: e.clientX,
          tooltipY: e.clientY,
        } : null
      );

      // Update all elements in this row
      const rowElements = getRowElements(group.elements, row);
      rowElements.forEach((el) => {
        onUpdateElement(el.id, { height: newHeight });
      });

      // Shift rows below
      if (actualDelta !== 0) {
        for (let i = resizingRow.rowIndex + 1; i < group.rows.length; i++) {
          const nextRow = group.rows[i];
          const nextRowElements = getRowElements(group.elements, nextRow);
          nextRowElements.forEach((el) => {
            onUpdateElement(el.id, { y: el.y + actualDelta });
          });
        }
      }
    },
    [resizingRow, tableGroups, onUpdateElement]
  );

  /**
   * Handles mouse move during any resize operation
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizingColumn) {
        // Use requestAnimationFrame for smooth 60fps updates
        requestAnimationFrame(() => handleColumnMouseMove(e));
      } else if (resizingRow) {
        requestAnimationFrame(() => handleRowMouseMove(e));
      }
    },
    [resizingColumn, resizingRow, handleColumnMouseMove, handleRowMouseMove]
  );

  /**
   * Handles mouse up to end resize operation
   */
  const handleMouseUp = useCallback(() => {
    if (resizingColumn || resizingRow) {
      setIsDirty(true);
      setResizingColumn(null);
      setResizingRow(null);
      isResizingRef.current = false;

      // Re-enable text selection
      document.body.style.userSelect = '';
    }
  }, [resizingColumn, resizingRow, setIsDirty]);

  /**
   * Auto-fits a column to its content
   */
  const handleAutoFitColumn = useCallback(
    (groupId: string, columnIndex: number) => {
      const group = tableGroups.find((g) => g.groupId === groupId);
      if (!group || columnIndex >= group.columns.length) return;

      const column = group.columns[columnIndex];
      const columnElements = getColumnElements(group.elements, column);

      // Calculate optimal width
      const optimalWidth = calculateOptimalColumnWidth(
        columnElements,
        MIN_COLUMN_WIDTH,
        MAX_COLUMN_WIDTH
      );
      const delta = optimalWidth - column.width;

      if (delta === 0) return;

      // Update all elements in this column
      columnElements.forEach((el) => {
        onUpdateElement(el.id, { width: optimalWidth });
      });

      // Shift columns to the right
      for (let i = columnIndex + 1; i < group.columns.length; i++) {
        const nextColumn = group.columns[i];
        const nextColumnElements = getColumnElements(group.elements, nextColumn);
        nextColumnElements.forEach((el) => {
          onUpdateElement(el.id, { x: el.x + delta });
        });
      }

      setIsDirty(true);
    },
    [tableGroups, onUpdateElement, setIsDirty]
  );

  /**
   * Handles keyboard resize for focused handle
   * Supports:
   * - Arrow keys for standard resize (5px)
   * - Shift + Arrow for large resize (50px)
   * - Ctrl/Cmd + Arrow for small resize (1px)
   * - Escape to cancel
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focusedHandle) return;

      // Handle Escape key to cancel/blur
      if (e.key === 'Escape') {
        setFocusedHandle(null);
        // Remove focus from currently focused element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      const group = tableGroups.find((g) => g.groupId === focusedHandle.groupId);
      if (!group) return;

      let handled = false;
      let delta = 0;

      // Determine step size based on modifier keys
      const step = e.shiftKey
        ? KEYBOARD_RESIZE_STEP_LARGE
        : e.ctrlKey || e.metaKey
        ? KEYBOARD_RESIZE_STEP_SMALL
        : KEYBOARD_RESIZE_STEP;

      if (focusedHandle.type === 'column') {
        const column = group.columns[focusedHandle.index];
        if (!column) return;

        if (e.key === 'ArrowRight') {
          // Widen column
          delta = step;
          handled = true;
        } else if (e.key === 'ArrowLeft') {
          // Narrow column
          delta = -step;
          handled = true;
        }

        if (handled) {
          e.preventDefault();
          const newWidth = Math.max(
            MIN_COLUMN_WIDTH,
            Math.min(MAX_COLUMN_WIDTH, column.width + delta)
          );
          const actualDelta = newWidth - column.width;

          if (actualDelta !== 0) {
            // Update column elements
            const columnElements = getColumnElements(group.elements, column);
            columnElements.forEach((el) => {
              onUpdateElement(el.id, { width: newWidth });
            });

            // Shift columns to the right
            for (let i = focusedHandle.index + 1; i < group.columns.length; i++) {
              const nextColumn = group.columns[i];
              const nextColumnElements = getColumnElements(group.elements, nextColumn);
              nextColumnElements.forEach((el) => {
                onUpdateElement(el.id, { x: el.x + actualDelta });
              });
            }

            setIsDirty(true);
          }
        }
      } else if (focusedHandle.type === 'row') {
        const row = group.rows[focusedHandle.index];
        if (!row) return;

        if (e.key === 'ArrowDown') {
          // Increase row height
          delta = step;
          handled = true;
        } else if (e.key === 'ArrowUp') {
          // Decrease row height
          delta = -step;
          handled = true;
        }

        if (handled) {
          e.preventDefault();
          const newHeight = Math.max(
            MIN_ROW_HEIGHT,
            Math.min(MAX_ROW_HEIGHT, row.height + delta)
          );
          const actualDelta = newHeight - row.height;

          if (actualDelta !== 0) {
            // Update row elements
            const rowElements = getRowElements(group.elements, row);
            rowElements.forEach((el) => {
              onUpdateElement(el.id, { height: newHeight });
            });

            // Shift rows below
            for (let i = focusedHandle.index + 1; i < group.rows.length; i++) {
              const nextRow = group.rows[i];
              const nextRowElements = getRowElements(group.elements, nextRow);
              nextRowElements.forEach((el) => {
                onUpdateElement(el.id, { y: el.y + actualDelta });
              });
            }

            setIsDirty(true);
          }
        }
      }
    },
    [focusedHandle, tableGroups, onUpdateElement, setIsDirty]
  );

  /**
   * Set up mouse event listeners during resize
   */
  useEffect(() => {
    if (resizingColumn || resizingRow) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, resizingRow, handleMouseMove, handleMouseUp]);

  /**
   * Set up keyboard event listeners for focused handle
   */
  useEffect(() => {
    if (focusedHandle && isEditorMode) {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusedHandle, isEditorMode, handleKeyDown]);

  /**
   * Update focused handle when hovered handle changes
   */
  useEffect(() => {
    if (hoveredHandle && !isResizingRef.current) {
      setFocusedHandle(hoveredHandle);
    }
  }, [hoveredHandle]);

  return {
    tableGroups,
    startResizeColumn,
    startResizeRow,
    handleAutoFitColumn,
    resizingColumn,
    resizingRow,
    hoveredHandle,
    setHoveredHandle,
  };
}
