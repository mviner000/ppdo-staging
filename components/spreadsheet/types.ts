// app/components/spreadsheet/types.ts

import { Id } from "@/convex/_generated/dataModel";
import { RefObject } from "react";

/**
 * Core spreadsheet types
 */
export interface CellPosition {
  row: number;
  col: number;
}

export interface CellData {
  [key: string]: string;
}

/**
 * Column definition for dynamic spreadsheet
 */
export interface ColumnDefinition {
  key: string;
  label: string;
  type: "text" | "currency" | "percentage" | "number";
  align?: "left" | "center" | "right";
}

/**
 * Feature flags for spreadsheet functionality
 */
export interface SpreadsheetFeatures {
  enableExport: boolean;
  enablePrint: boolean;
  enableShare: boolean;
  showTotalsRow: boolean;
  showTotalsColumn: boolean;
  viewMode: "viewer" | "editor"; // New: Control edit permissions
}

/**
 * Main spreadsheet configuration
 */
export interface SpreadsheetConfig {
  // Data source
  tableName: string;
  fetchQuery: any; // Convex query reference
  
  // Column definitions
  columns: ColumnDefinition[];
  
  // Features
  features: SpreadsheetFeatures;
  
  // Styling
  accentColor?: string;
  title: string;
  
  // Optional filters
  filters?: Record<string, any>;
}

/**
 * Spreadsheet state management
 */
export interface SpreadsheetState {
  selectedCell: CellPosition;
  cellData: CellData;
  formulaBarValue: string;
  editingCell: string | null;
  showExportModal: boolean;
}

/**
 * Props for spreadsheet components
 */
export interface SpreadsheetContainerProps {
  config: SpreadsheetConfig;
  filters?: Record<string, any>;
}

export interface SpreadsheetHeaderProps {
  title: string;
  selectedYear?: number;
  dataRows: number;
  columns: string[];
  detectedColumns: ColumnDefinition[];
  onShare?: () => void;
}

export interface SpreadsheetMenuBarProps {
  onExport?: () => void;
  selectedColumn: number;
  selectedColumnType: "text" | "currency" | "percentage" | "number";
  columnAlignment?: "left" | "center" | "right";
  onAlignmentChange: (alignment: "left" | "center" | "right") => void;
  onTextTransform: (transform: "uppercase" | "lowercase" | "camelCase" | "reset") => void;
}

export interface SpreadsheetFormulaBarProps {
  selectedCell: CellPosition;
  formulaBarValue: string;
  columns: string[];
  onFormulaBarChange: (value: string) => void;
  viewMode: "viewer" | "editor";
}

export interface SpreadsheetGridProps {
  columns: string[];
  rows: number[];
  columnHeaders: string[];
  selectedCell: CellPosition;
  cellData: CellData;
  editingCell: string | null;
  totalRowNumber: number;
  columnWidths: number[];
  columnAlignments: ("left" | "center" | "right")[];
  onCellClick: (row: number, col: number) => void;
  onCellDoubleClick: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: string) => void;
  onEditingCellChange: (cell: string | null) => void;
  onResizeStart: (colIndex: number, e: React.MouseEvent) => void;
  onDoubleClickResize: (colIndex: number) => void;
  containerRef?: RefObject<HTMLDivElement | null>;
}

export interface SpreadsheetCellProps {
  cellKey: string;
  isSelected: boolean;
  isEditing: boolean;
  cellData: CellData;
  onClick: () => void;
  onDoubleClick: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  dataCellAttr?: string;
  isDisabled?: boolean;
  isTotalRow?: boolean;
  width?: number;
  alignment?: "left" | "center" | "right";
}

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  selectedYear?: number | string;
  dataRows: number;
  detectedColumns: ColumnDefinition[];
  totals: Record<string, number>;
}