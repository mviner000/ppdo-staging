// app/components/Spreadsheet/SpreadsheetCell.tsx

"use client";

import { forwardRef, useCallback } from "react";
import { SpreadsheetCellProps } from "./types";

export const SpreadsheetCell = forwardRef<HTMLDivElement, SpreadsheetCellProps>(
  function SpreadsheetCell(
    {
      cellKey,
      isSelected,
      isEditing,
      cellData,
      onClick,
      onDoubleClick,
      onChange,
      onBlur,
      dataCellAttr,
      isDisabled,
      isTotalRow,
      width = 100,
      alignment = "left",
    },
    ref
  ) {
    // Simple Tailwind alignment classes
    const textAlignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[alignment];

    const inputRef = useCallback((node: HTMLInputElement | null) => {
      if (node && isEditing && !isDisabled) {
        node.focus();
        node.select();
      }
    }, [isEditing, isDisabled]);

    return (
      <div
        ref={ref}
        className={`relative h-[21px] border-b border-r border-gray-300 ${
          isSelected && !isDisabled ? "ring-2 ring-blue-500 ring-inset z-10" : ""
        } ${isTotalRow ? "bg-gray-100 dark:bg-gray-800" : "bg-white"} ${
          isDisabled ? "cursor-default" : "cursor-cell"
        }`}
        onClick={isDisabled ? undefined : onClick}
        onDoubleClick={isDisabled ? undefined : onDoubleClick}
        data-cell={dataCellAttr}
        style={{ width: `${width}px` }}
      >
        {isEditing && !isDisabled ? (
          <input
            ref={inputRef}
            type="text"
            value={cellData[cellKey] || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={isDisabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                onBlur();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onBlur();
              }
            }}
            className={`h-full w-full border-none px-1 text-xs outline-none ${textAlignClass}`}
          />
        ) : (
          <div 
            className={`flex h-full items-center px-1 text-xs overflow-hidden ${
              isTotalRow ? "font-bold text-gray-900 dark:text-gray-100" : "text-gray-900"
            } ${textAlignClass}`}
            title={cellData[cellKey] || ""}
          >
            <span className="truncate w-full">{cellData[cellKey] || ""}</span>
          </div>
        )}
        {isSelected && !isEditing && !isDisabled && (
          <div className="absolute bottom-0 right-0 h-1.5 w-1.5 bg-blue-500" />
        )}
      </div>
    );
  }
);