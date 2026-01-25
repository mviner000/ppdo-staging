// app/dashboard/project/[year]/components/ColumnVisibilityPanel.tsx

'use client';

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ColumnDefinition {
  key: string;
  label: string;
  required?: boolean;
}

interface TableDimensions {
  width: number;
  height: number;
}

interface TableColumnGroup {
  tableId: string;
  tableName: string;
  columns: ColumnDefinition[];
}

interface ColumnVisibilityPanelProps {
  tables: TableColumnGroup[];
  hiddenColumns: Set<string>;
  hiddenColumnsVersion: number;
  columnWidths?: Map<string, number>; // columnKey -> width in px
  tableDimensions?: TableDimensions; // total table width/height
  onToggleColumn: (tableId: string, columnKey: string) => void;
  onShowAll: (tableId: string) => void;
  onHideAll: (tableId: string) => void;
  onRenameColumn?: (tableId: string, columnKey: string, newLabel: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface ColumnItemProps {
  tableId: string;
  column: ColumnDefinition;
  isHidden: boolean;
  width?: number;
  onToggle: (tableId: string, columnKey: string) => void;
  onRename?: (tableId: string, columnKey: string, newLabel: string) => void;
}

interface TableGroupProps {
  table: TableColumnGroup;
  hiddenColumns: Set<string>;
  hiddenColumnsVersion: number;
  columnWidths?: Map<string, number>;
  tableDimensions?: TableDimensions;
  onToggleColumn: (tableId: string, columnKey: string) => void;
  onShowAll: (tableId: string) => void;
  onHideAll: (tableId: string) => void;
  onRenameColumn?: (tableId: string, columnKey: string, newLabel: string) => void;
}

// ============================================================================
// COLUMN ITEM COMPONENT (Figma-style with inline editing)
// ============================================================================

function ColumnItem({ tableId, column, isHidden, width, onToggle, onRename }: ColumnItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(column.label);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when column label changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(column.label);
    }
  }, [column.label, isEditing]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!column.required) {
      onToggle(tableId, column.key);
    }
  }, [tableId, column.key, column.required, onToggle]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!column.required && onRename) {
      setIsEditing(true);
    }
  }, [column.required, onRename]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== column.label && onRename) {
      onRename(tableId, column.key, trimmed);
    }
    setIsEditing(false);
  }, [editValue, column.label, column.key, tableId, onRename]);

  const handleCancel = useCallback(() => {
    setEditValue(column.label);
    setIsEditing(false);
  }, [column.label]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md
        transition-all duration-200
        ${column.required
          ? 'opacity-50'
          : 'hover:bg-stone-50 dark:hover:bg-zinc-800'
        }
      `}
    >
      {/* Column Name (editable on double-click) */}
      <div
        className="flex-1 min-w-0"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full text-sm bg-white dark:bg-zinc-800 border border-blue-500 rounded px-1 py-0.5 text-stone-900 dark:text-stone-100 outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`
              text-sm text-stone-700 dark:text-stone-300 truncate block
              ${!column.required && onRename ? 'cursor-text' : 'cursor-default'}
            `}
            title={column.required ? 'Required column' : 'Double-click to rename'}
          >
            {column.label}
          </span>
        )}
      </div>

      {/* Width Label (gray, small) */}
      {width !== undefined && !isHidden && (
        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono shrink-0 tabular-nums">
          {Math.round(width)}px
        </span>
      )}

      {/* Eye Icon Container (separate click target) */}
      <button
        onClick={handleToggle}
        disabled={column.required}
        className={`
          w-6 h-6 flex items-center justify-center rounded shrink-0
          transition-all duration-200
          ${column.required
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer'
          }
        `}
        aria-label={isHidden ? `Show ${column.label} column` : `Hide ${column.label} column`}
        title={column.required ? 'Required column' : (isHidden ? 'Show column' : 'Hide column')}
      >
        {isHidden ? (
          <EyeOff className="w-4 h-4 text-stone-400" />
        ) : (
          <Eye className="w-4 h-4 text-green-600 dark:text-green-500" />
        )}
      </button>
    </div>
  );
}

// ============================================================================
// TABLE GROUP COMPONENT
// ============================================================================

function TableGroup({
  table,
  hiddenColumns,
  hiddenColumnsVersion,
  columnWidths,
  tableDimensions,
  onToggleColumn,
  onShowAll,
  onHideAll,
  onRenameColumn
}: TableGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { visibleCount, totalCount } = useMemo(() => {
    let hidden = 0;

    table.columns.forEach(col => {
      const fullKey = `${table.tableId}.${col.key}`;
      if (hiddenColumns.has(fullKey)) {
        hidden++;
      }
    });

    const total = table.columns.length;
    const visible = total - hidden;

    return {
      visibleCount: visible,
      totalCount: total
    };
  }, [table.tableId, table.columns, hiddenColumns, hiddenColumnsVersion]);

  return (
    <div className="mb-4">
      {/* Table Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          )}
          <span className="font-medium text-sm text-stone-900 dark:text-stone-100">
            {table.tableName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Table Dimensions (width × height) */}
          {tableDimensions && (
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tabular-nums">
              {Math.round(tableDimensions.width)}×{Math.round(tableDimensions.height)}
            </span>
          )}
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {visibleCount}/{totalCount}
          </span>
        </div>
      </button>

      {/* Column List */}
      {isExpanded && (
        <div className="mt-1 space-y-0.5 max-h-96 overflow-y-auto">
          {table.columns.map((column) => {
            const fullKey = `${table.tableId}.${column.key}`;
            const isHidden = hiddenColumns.has(fullKey);
            const colWidth = columnWidths?.get(column.key);

            return (
              <ColumnItem
                key={column.key}
                tableId={table.tableId}
                column={column}
                isHidden={isHidden}
                width={isHidden ? undefined : colWidth}
                onToggle={onToggleColumn}
                onRename={onRenameColumn}
              />
            );
          })}
        </div>
      )}

      {/* Bulk Actions */}
      {isExpanded && (
        <div className="mt-3 flex gap-2 px-3">
          <button
            onClick={() => onShowAll(table.tableId)}
            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            Show All
          </button>
          <button
            onClick={() => onHideAll(table.tableId)}
            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Hide All
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PANEL COMPONENT
// ============================================================================

export function ColumnVisibilityPanel({
  tables,
  hiddenColumns,
  hiddenColumnsVersion,
  columnWidths,
  tableDimensions,
  onToggleColumn,
  onShowAll,
  onHideAll,
  onRenameColumn,
  isCollapsed,
  onToggleCollapse,
}: ColumnVisibilityPanelProps) {

  // Keyboard shortcut: Ctrl+B to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        onToggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  return (
    <div
      className={`
        shrink-0 border-r border-stone-200 dark:border-stone-700
        bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out
        overflow-hidden
        ${isCollapsed ? 'w-12' : 'w-[280px]'}
      `}
      style={{ height: '100%' }}
    >
      {/* Panel Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-stone-700 px-3 py-3 flex items-center justify-between">
        {!isCollapsed && (
          <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
            Columns
          </h3>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          title={isCollapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          )}
        </button>
      </div>

      {/* Panel Content */}
      {!isCollapsed && (
        <div className="overflow-y-auto h-full pb-20">
          <div className="p-3">
            {tables.length === 0 ? (
              <div className="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                No columns available
              </div>
            ) : (
              tables.map((table) => (
                <TableGroup
                  key={table.tableId}
                  table={table}
                  hiddenColumns={hiddenColumns}
                  hiddenColumnsVersion={hiddenColumnsVersion}
                  columnWidths={columnWidths}
                  tableDimensions={tableDimensions}
                  onToggleColumn={onToggleColumn}
                  onShowAll={onShowAll}
                  onHideAll={onHideAll}
                  onRenameColumn={onRenameColumn}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Collapsed State Icon */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="writing-mode-vertical text-xs font-medium text-stone-600 dark:text-stone-400 transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Columns
          </div>
        </div>
      )}
    </div>
  );
}
