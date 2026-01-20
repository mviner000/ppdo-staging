// app/components/Spreadsheet/SpreadsheetGrid.tsx

"use client";

import { useEffect, useRef, RefObject } from "react";
import { SpreadsheetCell } from "./SpreadsheetCell";
import { SpreadsheetGridProps } from "./types";
import { getCellKey } from "./utils/formatting";

export function SpreadsheetGrid({
  columns,
  rows,
  columnHeaders,
  selectedCell,
  cellData,
  editingCell,
  totalRowNumber,
  columnWidths,
  columnAlignments,
  onCellClick,
  onCellDoubleClick,
  onCellChange,
  onEditingCellChange,
  onResizeStart,
  onDoubleClickResize,
  containerRef,
}: SpreadsheetGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const selectedCellRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep selected cell visible
  useEffect(() => {
    if (selectedCellRef.current && gridRef.current) {
      selectedCellRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedCell]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-auto" ref={gridRef}>
        {/* Column Letters */}
        <div className="sticky top-0 z-20 flex bg-[#f8f9fa]">
          <div className="sticky left-0 z-30 h-[30px] w-[46px] border-b border-r border-gray-300 bg-[#f8f9fa]" />
          {columns.map((col, colIndex) => (
            <div
              key={col}
              className="relative flex h-[30px] items-center justify-center border-b border-r border-gray-300 bg-[#f8f9fa] text-xs font-medium text-gray-700 group"
              style={{ width: `${columnWidths[colIndex]}px` }}
            >
              {col}
              {/* Resize Handle with Visual Indicator */}
              <div
                className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center"
                onMouseDown={(e) => onResizeStart(colIndex, e)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onDoubleClickResize(colIndex);
                }}
                title="Drag to resize, double-click to auto-fit"
              >
                {/* Two vertical lines - shown on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-[1px] h-4">
                  <div className="w-[1px] h-full bg-blue-500"></div>
                  <div className="w-[1px] h-full bg-blue-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Column Headers */}
        <div className="sticky top-[30px] z-20 flex bg-[#f8f9fa]">
          <div className="sticky left-0 z-30 h-[30px] w-[46px] border-b border-r border-gray-300 bg-[#f8f9fa]" />
          {columnHeaders.map((header, index) => (
            <div
              key={`header-${index}`}
              className="flex h-[30px] items-center justify-center border-b border-r border-gray-300 bg-[#f8f9fa] px-1 text-[10px] font-semibold text-gray-700 uppercase overflow-hidden"
              style={{ width: `${columnWidths[index]}px` }}
              title={header}
            >
              <span className="truncate">{header}</span>
            </div>
          ))}
        </div>

        {/* Rows - Infinite scroll (all data loaded) */}
        {rows.map((row) => {
          const isTotalRow = row === totalRowNumber;
          
          return (
            <div key={row} className="flex">
              {/* Row Header */}
              <div className={`sticky left-0 z-10 flex h-[21px] w-[46px] items-center justify-center border-b border-r border-gray-300 text-xs text-gray-700 ${
                isTotalRow ? "bg-gray-100 dark:bg-gray-800 font-bold" : "bg-[#f8f9fa]"
              }`}>
                {row}
              </div>

              {/* Cells */}
              {columns.map((col, colIndex) => {
                const cellKey = getCellKey(row, colIndex, columns);
                const isSelected = selectedCell.row === row && selectedCell.col === colIndex;
                const isEditing = editingCell === cellKey;

                return (
                  <SpreadsheetCell
                    key={cellKey}
                    cellKey={cellKey}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    cellData={cellData}
                    onClick={() => onCellClick(row, colIndex)}
                    onDoubleClick={() => onCellDoubleClick(row, colIndex)}
                    onChange={(value) => onCellChange(row, colIndex, value)}
                    onBlur={() => onEditingCellChange(null)}
                    dataCellAttr={cellKey}
                    isDisabled={isTotalRow}
                    isTotalRow={isTotalRow}
                    width={columnWidths[colIndex]}
                    alignment={columnAlignments[colIndex]}
                    ref={isSelected ? selectedCellRef : undefined}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}