// components/ColumnVisibilityMenu.tsx (updated version with config)

"use client";

import { LayoutTemplate, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, ReactNode } from "react";
import { COLUMN_VISIBILITY_CONFIG } from "@/lib/column-visibility-config";

/**
 * Generic column interface that all table columns should extend
 */
export interface BaseColumn {
  key: string;
  label: string;
}

/**
 * Props for the ColumnVisibilityMenu component
 */
export interface ColumnVisibilityMenuProps<T extends BaseColumn> {
  columns: T[];
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  
  // Customization props (with defaults from config)
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  contentClassName?: string;
  label?: string;
  showCount?: boolean;
  maxHeight?: string;
  showAllText?: string;
  hideAllText?: string;
  hideAllButtonClass?: string;
  
  // Custom render props (optional)
  renderTrigger?: (props: {
    hiddenCount: number;
    isOpen: boolean;
    defaultTrigger: ReactNode;
  }) => ReactNode;
}

/**
 * Base ColumnVisibilityMenu Component
 * 
 * A reusable dropdown menu for controlling table column visibility.
 * Keeps the dropdown open when checking/unchecking items.
 * 
 * Styling can be customized globally via lib/column-visibility-config.ts
 * or per-instance via props.
 * 
 * @example
 * ```tsx
 * <ColumnVisibilityMenu
 *   columns={columns}
 *   hiddenColumns={hiddenColumns}
 *   onToggleColumn={handleToggleColumn}
 *   onShowAll={handleShowAll}
 *   onHideAll={handleHideAll}
 * />
 * ```
 */
export function ColumnVisibilityMenu<T extends BaseColumn>({
  columns,
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll,
  triggerClassName,
  triggerStyle,
  contentClassName = COLUMN_VISIBILITY_CONFIG.contentWidth,
  label = COLUMN_VISIBILITY_CONFIG.defaultLabel,
  showCount = COLUMN_VISIBILITY_CONFIG.showCount,
  maxHeight = COLUMN_VISIBILITY_CONFIG.maxHeight,
  showAllText = COLUMN_VISIBILITY_CONFIG.showAllText,
  hideAllText = COLUMN_VISIBILITY_CONFIG.hideAllText,
  hideAllButtonClass = COLUMN_VISIBILITY_CONFIG.hideAllButtonClass,
  renderTrigger,
}: ColumnVisibilityMenuProps<T>) {
  const [open, setOpen] = useState(false);

  const handleToggleColumn = (columnId: string, isChecked: boolean) => {
    // Prevent dropdown from closing by not calling setOpen(false)
    onToggleColumn(columnId, isChecked);
  };

  const handleShowAll = () => {
    onShowAll();
    // Keep dropdown open
  };

  const handleHideAll = () => {
    onHideAll();
    // Keep dropdown open
  };

  const hiddenCount = hiddenColumns.size;

  // Default trigger button
  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={triggerClassName || "gap-2"}
      style={triggerStyle}
    >
      <LayoutTemplate className="w-4 h-4" />
      Columns
      {showCount && hiddenCount > 0 && (
        <span className="ml-0.5 text-xs text-zinc-500">
          ({hiddenCount} hidden)
        </span>
      )}
    </Button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {renderTrigger 
          ? renderTrigger({ hiddenCount, isOpen: open, defaultTrigger })
          : defaultTrigger
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={contentClassName}
        onCloseAutoFocus={(e) => {
          // Prevent focus from returning to trigger when closing
          e.preventDefault();
        }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">{label}</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DropdownMenuSeparator />
        
        {/* Column checkboxes */}
        <div 
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.key}
              checked={!hiddenColumns.has(column.key)}
              onCheckedChange={(checked) => handleToggleColumn(column.key, checked)}
              onSelect={(e) => {
                // Prevent dropdown from closing when selecting items
                e.preventDefault();
              }}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Show All / Hide All buttons */}
        <div className="p-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowAll}
            className="w-full h-7 text-xs"
            disabled={hiddenCount === 0}
          >
            {showAllText}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHideAll}
            className={`w-full h-7 text-xs ${hideAllButtonClass}`}
            disabled={hiddenCount === columns.length}
          >
            {hideAllText}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}