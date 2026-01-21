// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/TableHeader.tsx

"use client";

import { GripVertical } from "lucide-react";
import { ColumnConfig } from "../types/breakdown.types";

interface TableHeaderProps {
  columns: ColumnConfig[];
  gridTemplateColumns: string;
  canEditLayout: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (index: number) => void;
  onStartResize: (e: React.MouseEvent, index: number) => void;
}

export function TableHeader({
  columns,
  gridTemplateColumns,
  canEditLayout,
  onDragStart,
  onDragOver,
  onDrop,
  onStartResize,
}: TableHeaderProps) {
  return (
    <thead 
      className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800"
    >
      <tr>
        {/* Row Number Column */}
        <th 
          className="text-center py-2 text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide"
          style={{ 
            width: '48px',
            border: '1px solid rgb(228 228 231 / 1)',
            borderColor: 'rgb(228 228 231 / 1)',
          }}
        >
          #
        </th>

        {/* Data Columns */}
        {columns.map((column, index) => (
          <th
            key={column.key}
            draggable={canEditLayout}
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            className={`relative px-2 sm:px-3 py-2 text-zinc-700 dark:text-zinc-200 ${
              canEditLayout ? "cursor-move" : ""
            }`}
            style={{ 
              width: `${column.width}px`,
              border: '1px solid rgb(228 228 231 / 1)',
              textAlign: column.align,
            }}
          >
            <div className="flex items-center gap-1.5">
              {canEditLayout && (
                <GripVertical 
                  className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" 
                  style={{ width: '12px', height: '12px' }}
                />
              )}
              
              <span className="flex-1 truncate text-[11px] sm:text-xs font-semibold uppercase tracking-wide">
                {column.label}
              </span>
            </div>

            {canEditLayout && (
              <div
                className="absolute right-0 top-0 h-full cursor-col-resize z-10"
                onMouseDown={e => onStartResize(e, index)}
                style={{ 
                  width: '4px',
                  marginRight: '-2px',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(59 130 246 / 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              />
            )}
          </th>
        ))}

        {/* Actions Column */}
        <th 
          className="text-center py-2 text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide"
          style={{ 
            width: '64px',
            border: '1px solid rgb(228 228 231 / 1)',
          }}
        >
          Actions
        </th>
      </tr>
    </thead>
  );
}