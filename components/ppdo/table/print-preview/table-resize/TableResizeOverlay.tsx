// app/dashboard/project/[year]/components/table-resize/TableResizeOverlay.tsx

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useTableCanvasResize } from '../../../../../app/dashboard/project/[year]/components/hooks/useTableCanvasResize';
import { TableResizeHandle } from './TableResizeHandle';
import { DimensionTooltip } from './DimensionTooltip';
import { ActiveResizeHighlight } from './ActiveResizeHighlight';
import { ResizeLiveRegion } from './ResizeLiveRegion';
import { TableResizeOverlayProps, HoveredHandle } from './types';

/**
 * TableResizeOverlay Component
 *
 * Renders resize handles over all table groups in the canvas
 * Features:
 * - Column resize handles at column boundaries
 * - Row resize handles at row boundaries
 * - Double-click auto-fit for columns
 * - Hover state management
 * - Keyboard accessibility
 */
export function TableResizeOverlay({
  elements,
  onUpdateElement,
  setIsDirty,
  isEditorMode,
  pageSize,
  pageOrientation,
}: TableResizeOverlayProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Use the resize hook to manage all resize operations
  const {
    tableGroups,
    startResizeColumn,
    startResizeRow,
    handleAutoFitColumn,
    resizingColumn,
    resizingRow,
    hoveredHandle,
    setHoveredHandle,
  } = useTableCanvasResize({
    elements,
    onUpdateElement,
    setIsDirty,
    isEditorMode,
    pageSize,
    pageOrientation,
  });

  /**
   * Checks if a specific handle is hovered
   */
  const isHandleHovered = useCallback(
    (type: 'column' | 'row', groupId: string, index: number): boolean => {
      return (
        hoveredHandle?.type === type &&
        hoveredHandle?.groupId === groupId &&
        hoveredHandle?.index === index
      );
    },
    [hoveredHandle]
  );

  /**
   * Checks if a specific handle is active (being dragged)
   */
  const isHandleActive = useCallback(
    (type: 'column' | 'row', groupId: string, index: number): boolean => {
      if (type === 'column') {
        return (
          resizingColumn?.groupId === groupId &&
          resizingColumn?.columnIndex === index
        );
      } else {
        return (
          resizingRow?.groupId === groupId && resizingRow?.rowIndex === index
        );
      }
    },
    [resizingColumn, resizingRow]
  );

  /**
   * Handles mouse enter on a resize handle
   */
  const handleMouseEnter = useCallback(
    (handle: HoveredHandle) => {
      setHoveredHandle(handle);
    },
    [setHoveredHandle]
  );

  /**
   * Handles mouse leave from a resize handle
   */
  const handleMouseLeave = useCallback(() => {
    setHoveredHandle(null);
  }, [setHoveredHandle]);

  /**
   * Gets bounds for active column highlight
   */
  const getActiveColumnBounds = useCallback(() => {
    if (!resizingColumn) return null;

    const group = tableGroups.find((g) => g.groupId === resizingColumn.groupId);
    if (!group || resizingColumn.columnIndex >= group.columns.length) return null;

    const column = group.columns[resizingColumn.columnIndex];
    return {
      x: column.x,
      y: group.bounds.y,
      width: resizingColumn.currentWidth,
      height: group.bounds.height,
    };
  }, [resizingColumn, tableGroups]);

  /**
   * Gets bounds for active row highlight
   */
  const getActiveRowBounds = useCallback(() => {
    if (!resizingRow) return null;

    const group = tableGroups.find((g) => g.groupId === resizingRow.groupId);
    if (!group || resizingRow.rowIndex >= group.rows.length) return null;

    const row = group.rows[resizingRow.rowIndex];
    return {
      x: group.bounds.x,
      y: row.y,
      width: group.bounds.width,
      height: resizingRow.currentHeight,
    };
  }, [resizingRow, tableGroups]);

  // Don't render if not in editor mode or no tables found
  if (!isEditorMode || tableGroups.length === 0) {
    return null;
  }

  // Get active bounds for highlights
  const activeColumnBounds = getActiveColumnBounds();
  const activeRowBounds = getActiveRowBounds();

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* Active column highlight */}
        {activeColumnBounds && (
          <ActiveResizeHighlight
            type="column"
            bounds={activeColumnBounds}
            visible={!!resizingColumn}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {/* Active row highlight */}
        {activeRowBounds && (
          <ActiveResizeHighlight
            type="row"
            bounds={activeRowBounds}
            visible={!!resizingRow}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {tableGroups.map((group) => (
          <div key={group.groupId}>
            {/* Column resize handles - skip the last column (right edge) */}
            {group.columns.slice(0, -1).map((column, index) => {
            const x = column.x + column.width;
            const isHovered = isHandleHovered('column', group.groupId, index);
            const isActive = isHandleActive('column', group.groupId, index);

            return (
              <TableResizeHandle
                key={`col-${group.groupId}-${index}`}
                type="column"
                position={{ x, y: group.bounds.y }}
                length={group.bounds.height}
                isHovered={isHovered}
                isActive={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startResizeColumn(group.groupId, index, e.clientX, e.clientY);
                }}
                onDoubleClick={() => {
                  handleAutoFitColumn(group.groupId, index);
                }}
                onMouseEnter={() =>
                  handleMouseEnter({
                    type: 'column',
                    groupId: group.groupId,
                    index,
                  })
                }
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* Row resize handles - skip the last row (bottom edge) */}
          {group.rows.slice(0, -1).map((row, index) => {
            const y = row.y + row.height;
            const isHovered = isHandleHovered('row', group.groupId, index);
            const isActive = isHandleActive('row', group.groupId, index);

            return (
              <TableResizeHandle
                key={`row-${group.groupId}-${index}`}
                type="row"
                position={{ x: group.bounds.x, y }}
                length={group.bounds.width}
                isHovered={isHovered}
                isActive={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startResizeRow(group.groupId, index, e.clientY, e.clientX);
                }}
                onMouseEnter={() =>
                  handleMouseEnter({
                    type: 'row',
                    groupId: group.groupId,
                    index,
                  })
                }
                onMouseLeave={handleMouseLeave}
              />
            );
            })}
          </div>
        ))}
      </div>

      {/* Dimension tooltip for column resize */}
      {resizingColumn && (
        <DimensionTooltip
          x={resizingColumn.tooltipX}
          y={resizingColumn.tooltipY}
          dimension={resizingColumn.currentWidth}
          type="width"
          visible={true}
        />
      )}

      {/* Dimension tooltip for row resize */}
      {resizingRow && (
        <DimensionTooltip
          x={resizingRow.tooltipX}
          y={resizingRow.tooltipY}
          dimension={resizingRow.currentHeight}
          type="height"
          visible={true}
        />
      )}

      {/* Screen reader live region for column resize */}
      {resizingColumn && (
        <ResizeLiveRegion
          type="column"
          dimension={resizingColumn.currentWidth}
          visible={true}
        />
      )}

      {/* Screen reader live region for row resize */}
      {resizingRow && (
        <ResizeLiveRegion
          type="row"
          dimension={resizingRow.currentHeight}
          visible={true}
        />
      )}
    </>
  );
}
