// app/dashboard/project/[year]/components/table-resize/types.ts

import { TableGroup, TableColumn, TableRow } from '@/lib/canvas-utils/tableStructure';

/**
 * Re-export types from tableStructure for convenience
 */
export type { TableGroup, TableColumn, TableRow };

/**
 * State while resizing a column
 */
export interface ResizingColumnState {
  groupId: string;
  columnIndex: number;
  startX: number;
  startWidth: number;
  currentDelta: number;
  currentWidth: number;
  tooltipX: number;
  tooltipY: number;
}

/**
 * State while resizing a row
 */
export interface ResizingRowState {
  groupId: string;
  rowIndex: number;
  startY: number;
  startHeight: number;
  currentDelta: number;
  currentHeight: number;
  tooltipX: number;
  tooltipY: number;
}

/**
 * Information about a hovered resize handle
 */
export interface HoveredHandle {
  type: 'column' | 'row';
  groupId: string;
  index: number;
}

/**
 * Props for TableResizeHandle component
 */
export interface TableResizeHandleProps {
  type: 'column' | 'row';
  position: { x?: number; y?: number };
  length: number;
  isHovered: boolean;
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Props for TableResizeOverlay component
 */
export interface TableResizeOverlayProps {
  elements: import('@/app/(extra)/canvas/_components/editor/types').CanvasElement[];
  onUpdateElement: (
    id: string,
    updates: Partial<import('@/app/(extra)/canvas/_components/editor/types').CanvasElement>
  ) => void;
  setIsDirty: (dirty: boolean) => void;
  isEditorMode: boolean;
  /** Page size for calculating resize constraints */
  pageSize?: 'A4' | 'Short' | 'Long';
  /** Page orientation for calculating resize constraints */
  pageOrientation?: 'portrait' | 'landscape';
}

/**
 * Return type of useTableCanvasResize hook
 */
export interface UseTableCanvasResizeReturn {
  tableGroups: TableGroup[];
  startResizeColumn: (groupId: string, columnIndex: number, startX: number, startY?: number) => void;
  startResizeRow: (groupId: string, rowIndex: number, startY: number, startX?: number) => void;
  handleAutoFitColumn: (groupId: string, columnIndex: number) => void;
  resizingColumn: ResizingColumnState | null;
  resizingRow: ResizingRowState | null;
  hoveredHandle: HoveredHandle | null;
  setHoveredHandle: (handle: HoveredHandle | null) => void;
}

/**
 * Hook options for useTableCanvasResize
 */
export interface UseTableCanvasResizeOptions {
  elements: import('@/app/(extra)/canvas/_components/editor/types').CanvasElement[];
  onUpdateElement: (
    id: string,
    updates: Partial<import('@/app/(extra)/canvas/_components/editor/types').CanvasElement>
  ) => void;
  setIsDirty: (dirty: boolean) => void;
  isEditorMode: boolean;
  /** Page size for calculating resize constraints */
  pageSize?: 'A4' | 'Short' | 'Long';
  /** Page orientation for calculating resize constraints */
  pageOrientation?: 'portrait' | 'landscape';
}
