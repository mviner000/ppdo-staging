// lib/print-canvas/types.ts

import { Page, HeaderFooter } from '@/app/dashboard/canvas/_components/editor/types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';

/**
 * Column definition for table-to-canvas conversion
 */
export interface ColumnDefinition {
  key: string;
  label: string;
  align: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
}

/**
 * Configuration for table-to-canvas conversion
 */
export interface ConversionConfig {
  items: BudgetItem[];
  totals: BudgetTotals;
  columns: ColumnDefinition[];
  hiddenColumns: Set<string>;
  pageSize: 'A4' | 'Short' | 'Long';
  includeHeaders: boolean;
  includeTotals: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * Budget totals interface
 */
export interface BudgetTotals {
  totalBudgetAllocated: number;
  obligatedBudget: number;
  totalBudgetUtilized: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
}

/**
 * Result of table-to-canvas conversion
 */
export interface ConversionResult {
  pages: Page[];
  header: HeaderFooter;
  footer: HeaderFooter;
  metadata: ConversionMetadata;
}

/**
 * Metadata about the conversion
 */
export interface ConversionMetadata {
  totalPages: number;
  totalRows: number;
  createdAt: number;
  pageSize: string;
  columnCount: number;
}

/**
 * Page metadata for tracking table content
 */
export interface PageMetadata {
  isTablePage: boolean;
  tableRowRange?: { start: number; end: number };
  hasUserEdits: boolean;
  pageType?: 'title' | 'data' | 'totals';
}

/**
 * Print draft storage interface
 */
export interface PrintDraft {
  id: string;
  timestamp: number;
  budgetYear: number;
  budgetParticular?: string;
  
  filterState: {
    searchQuery: string;
    statusFilter: string[];
    yearFilter: number[];
    sortField: string | null;
    sortDirection: string | null;
    hiddenColumns: string[];
  };
  
  canvasState: {
    pages: Page[];
    currentPageIndex: number;
    header: HeaderFooter;
    footer: HeaderFooter;
  };
  
  tableSnapshot: {
    items: BudgetItem[];
    totals: BudgetTotals;
    columns: ColumnDefinition[];
  };
}

/**
 * Draft metadata for tracking all drafts
 */
export interface DraftMetadata {
  drafts: DraftInfo[];
}

/**
 * Individual draft info
 */
export interface DraftInfo {
  key: string;
  year: number;
  particular?: string;
  timestamp: number;
  pageCount: number;
}

/**
 * Cell position and size
 */
export interface CellBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Table styling configuration
 */
export interface TableStyle {
  headerFontSize: number;
  dataFontSize: number;
  totalsFontSize: number;
  cellPadding: number;
  borderWidth: number;
  headerColor: string;
  dataColor: string;
  totalsColor: string;
  borderColor: string;
  headerBgColor: string;
  totalsBgColor: string;
}

/**
 * Default table styling
 */
export const DEFAULT_TABLE_STYLE: TableStyle = {
  headerFontSize: 10,
  dataFontSize: 9,
  totalsFontSize: 10,
  cellPadding: 6,
  borderWidth: 1,
  headerColor: '#18181b',
  dataColor: '#27272a',
  totalsColor: '#18181b',
  borderColor: '#e4e4e7',
  headerBgColor: '#f4f4f5',
  totalsBgColor: '#e4e4e7',
};