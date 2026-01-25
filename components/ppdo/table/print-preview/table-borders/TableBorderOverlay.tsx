// app/dashboard/project/[year]/components/table-borders/TableBorderOverlay.tsx

'use client';

import React, { useMemo } from 'react';
import { CanvasElement } from '@/app/(extra)/canvas/_components/editor/types';

interface TableBorderOverlayProps {
  elements: CanvasElement[];
  /** Detect table structure automatically if not provided */
  tableStructure?: TableStructure;
}

interface TableStructure {
  columns: { x: number; width: number }[];
  rows: { y: number; height: number }[];
  tableLeft: number;
  tableTop: number;
  tableWidth: number;
  tableHeight: number;
}

/**
 * TableBorderOverlay Component
 * Renders Google Docs-style table borders (1px solid black, edge-to-edge)
 * Works by detecting table groups and drawing precise border lines
 */
export function TableBorderOverlay({ elements, tableStructure: providedStructure }: TableBorderOverlayProps) {
  const structure = useMemo(() => {
    if (providedStructure) return providedStructure;
    return detectTableStructure(elements);
  }, [elements, providedStructure]);

  if (!structure) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      {/* Outer table border */}
      <rect
        x={structure.tableLeft}
        y={structure.tableTop}
        width={structure.tableWidth}
        height={structure.tableHeight}
        fill="none"
        stroke="#000000"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {/* Vertical column borders */}
      {structure.columns.slice(0, -1).map((col, index) => {
        const x = col.x + col.width;
        return (
          <line
            key={`col-${index}`}
            x1={x}
            y1={structure.tableTop}
            x2={x}
            y2={structure.tableTop + structure.tableHeight}
            stroke="#000000"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Horizontal row borders */}
      {structure.rows.slice(0, -1).map((row, index) => {
        const y = row.y + row.height;
        return (
          <line
            key={`row-${index}`}
            x1={structure.tableLeft}
            y1={y}
            x2={structure.tableLeft + structure.tableWidth}
            y2={y}
            stroke="#000000"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

/**
 * Detect table structure from canvas elements
 * Groups elements by groupId and analyzes their layout
 * Only considers visible elements to support column hiding
 */
function detectTableStructure(elements: CanvasElement[]): TableStructure | null {
  // Find visible table elements (filter out hidden columns)
  const tableElements = elements.filter(
    (el) => el.groupId && el.groupName?.toLowerCase().includes('table') && el.visible !== false
  );

  if (tableElements.length === 0) return null;

  // Get unique X positions (columns) and Y positions (rows)
  const uniqueX = Array.from(new Set(tableElements.map((el) => el.x))).sort((a, b) => a - b);
  const uniqueY = Array.from(new Set(tableElements.map((el) => el.y))).sort((a, b) => a - b);

  if (uniqueX.length === 0 || uniqueY.length === 0) return null;

  // Build column structure
  const columns = uniqueX.map((x) => {
    const cellsInColumn = tableElements.filter((el) => el.x === x);
    const width = cellsInColumn.length > 0 ? cellsInColumn[0].width : 0;
    return { x, width };
  });

  // Build row structure
  const rows = uniqueY.map((y) => {
    const cellsInRow = tableElements.filter((el) => el.y === y);
    const height = cellsInRow.length > 0 ? cellsInRow[0].height : 0;
    return { y, height };
  });

  // Calculate table bounds
  const tableLeft = Math.min(...tableElements.map((el) => el.x));
  const tableTop = Math.min(...tableElements.map((el) => el.y));
  const tableRight = Math.max(...tableElements.map((el) => el.x + el.width));
  const tableBottom = Math.max(...tableElements.map((el) => el.y + el.height));
  const tableWidth = tableRight - tableLeft;
  const tableHeight = tableBottom - tableTop;

  return {
    columns,
    rows,
    tableLeft,
    tableTop,
    tableWidth,
    tableHeight,
  };
}