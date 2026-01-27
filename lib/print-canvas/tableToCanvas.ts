// lib/print-canvas/tableToCanvas.ts

import { Page, HeaderFooter, TextElement } from '@/app/(extra)/canvas/_components/editor/types';
import {
  ConversionConfig,
  ConversionResult,
  DEFAULT_TABLE_STYLE,
  CellBounds,
  ColumnDefinition,
  BudgetTotals
} from './types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';
import {
  wrapText,
  calculateWrappedRow,
  calculateWrappedHeader,
  WrappedRowData,
} from './textUtils';

const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
};

const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 60;
const MARGIN = 20;
// Minimum row heights (rows will expand if text wraps)
const MIN_ROW_HEIGHT = 24;
const MIN_HEADER_ROW_HEIGHT = 28;
const LINE_HEIGHT = 1.2;

// ✅ Internal padding for text inside cells (NOT cell spacing)
const CELL_TEXT_PADDING = 4; // Small padding so text doesn't touch borders

// ✅ Extra left padding for first column text (spacing from left border)
const FIRST_COLUMN_LEFT_PADDING = 20;

/**
 * Converts budget table data into canvas pages
 * Supports row markers for category/group headers and dynamic text wrapping
 */
export function convertTableToCanvas(config: ConversionConfig): ConversionResult {
  const {
    items,
    totals,
    columns,
    hiddenColumns,
    pageSize,
    includeHeaders,
    includeTotals,
    title,
    subtitle,
    rowMarkers = [],
  } = config;

  const isLandscape = config.orientation === 'landscape';
  const baseSize = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES] || PAGE_SIZES.A4;
  const size = isLandscape
    ? { width: baseSize.height, height: baseSize.width }
    : baseSize;

  const availableHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT - (MARGIN * 2);

  // Filter visible columns
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));

  const columnWidths = calculateColumnWidths(visibleColumns, size.width - (MARGIN * 2));

  // Create column width map for text wrapping calculations
  // First column gets reduced width to account for extra left padding
  const columnWidthMap = new Map<string, number>();
  visibleColumns.forEach((col, index) => {
    const extraPadding = index === 0 ? FIRST_COLUMN_LEFT_PADDING : 0;
    columnWidthMap.set(col.key, columnWidths[index] - extraPadding);
  });

  // Pre-calculate header height with text wrapping
  const columnLabels = new Map<string, string>();
  visibleColumns.forEach(col => columnLabels.set(col.key, col.label));
  const headerWrappedData = calculateWrappedHeader(
    columnLabels,
    columnWidthMap,
    DEFAULT_TABLE_STYLE.headerFontSize,
    'Inter',
    CELL_TEXT_PADDING,
    MIN_HEADER_ROW_HEIGHT,
    LINE_HEIGHT
  );
  const dynamicHeaderHeight = includeHeaders ? headerWrappedData.rowHeight : 0;

  // Pre-calculate row heights for all items
  const preCalculatedRows: { item: BudgetItem; wrappedData: WrappedRowData; markerLabel?: string }[] = [];

  items.forEach((item, index) => {
    // Check for category marker
    const markerAtThisIndex = rowMarkers.find(m => m.index === index);

    // Create cell values map
    const cellValues = new Map<string, string>();
    visibleColumns.forEach(col => {
      cellValues.set(col.key, formatCellValue(item, col.key));
    });

    // Calculate wrapped row data
    const wrappedData = calculateWrappedRow(
      cellValues,
      columnWidthMap,
      DEFAULT_TABLE_STYLE.dataFontSize,
      'Inter',
      CELL_TEXT_PADDING,
      MIN_ROW_HEIGHT,
      LINE_HEIGHT
    );

    preCalculatedRows.push({
      item,
      wrappedData,
      markerLabel: markerAtThisIndex?.label,
    });
  });

  // Create pages using height-based pagination
  const pages: Page[] = [];

  // Create title page if title provided
  if (title) {
    const titlePage = createTitlePage(pageSize, title, subtitle, config.orientation);
    pages.push(titlePage);
  }

  // Paginate items based on accumulated height
  let itemIndex = 0;
  while (itemIndex < preCalculatedRows.length) {
    const pageElements: TextElement[] = [];
    let currentY = MARGIN;
    const globalRowIndex = itemIndex;

    // Create unique group ID for this page's table data
    const groupId = `table-group-${Date.now()}-${globalRowIndex}`;
    const groupName = `Table (Page Data ${pages.length + 1})`;

    // Add headers if requested
    if (includeHeaders) {
      pageElements.push(...createTableHeadersWithWrapping(
        visibleColumns,
        columnWidths,
        currentY,
        headerWrappedData,
        groupId,
        groupName
      ));
      currentY += dynamicHeaderHeight;
    }

    // Add rows until we run out of space or items
    while (itemIndex < preCalculatedRows.length) {
      const rowData = preCalculatedRows[itemIndex];
      let rowHeightNeeded = rowData.wrappedData.rowHeight;

      // Account for category marker if present
      if (rowData.markerLabel) {
        rowHeightNeeded += MIN_ROW_HEIGHT; // Category markers use minimum height
      }

      // Check if this row fits on the current page
      if (currentY + rowHeightNeeded > availableHeight && pageElements.length > (includeHeaders ? visibleColumns.length : 0)) {
        // Row doesn't fit and we have content, start a new page
        break;
      }

      // Add category marker if present
      if (rowData.markerLabel) {
        pageElements.push(...createCategoryHeaderRow(rowData.markerLabel, columnWidths, currentY, groupId, groupName));
        currentY += MIN_ROW_HEIGHT;
      }

      // Add the data row with wrapped text
      pageElements.push(...createTableRowWithWrapping(
        rowData.item,
        visibleColumns,
        columnWidths,
        currentY,
        rowData.wrappedData,
        groupId,
        groupName
      ));
      currentY += rowData.wrappedData.rowHeight;

      itemIndex++;
    }

    // Create the page
    const page: Page = {
      id: `page-data-${Date.now()}-${globalRowIndex}`,
      size: pageSize as 'A4' | 'Short' | 'Long',
      orientation: config.orientation || 'portrait',
      elements: pageElements,
      backgroundColor: '#ffffff',
    };
    pages.push(page);
  }

  // Add totals page if requested
  if (includeTotals && pages.length > 0) {
    const lastPage = pages[pages.length - 1];
    const hasSpace = checkSpaceForTotals(lastPage, availableHeight);

    if (hasSpace) {
      addTotalsToPage(lastPage, totals, visibleColumns, columnWidths);
    } else {
      const totalsPage = createTotalsPage(pageSize, totals, visibleColumns, columnWidths, config.orientation);
      pages.push(totalsPage);
    }
  }

  // Create header and footer
  const header = createPrintHeader(title || 'Budget Tracking Report');
  const footer = createPrintFooter();

  const result = {
    pages,
    header,
    footer,
    metadata: {
      totalPages: pages.length,
      totalRows: items.length,
      createdAt: Date.now(),
      pageSize,
      orientation: config.orientation || 'portrait',
      columnCount: visibleColumns.length,
    },
  };

  return result;
}

/**
 * Calculate column widths based on content and alignment
 */
function calculateColumnWidths(columns: ColumnDefinition[], totalWidth: number): number[] {
  const weights: Record<string, number> = {
    particular: 3,
    year: 1,
    status: 1.2,
    totalBudgetAllocated: 2,
    obligatedBudget: 2,
    totalBudgetUtilized: 2,
    utilizationRate: 1.5,
    projectCompleted: 1.2,
    projectDelayed: 1.2,
    projectsOnTrack: 1.2,
  };

  const totalWeight = columns.reduce((sum, col) => sum + (weights[col.key] || 1), 0);

  return columns.map(col => {
    const weight = weights[col.key] || 1;
    return (totalWidth * weight) / totalWeight;
  });
}

/**
 * Create title page
 */
function createTitlePage(pageSize: string, title: string, subtitle?: string, orientation: 'portrait' | 'landscape' = 'portrait'): Page {
  const baseSize = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES];
  const size = orientation === 'landscape'
    ? { width: baseSize.height, height: baseSize.width }
    : baseSize;
  const elements: TextElement[] = [];

  // Main title
  elements.push({
    id: `title-${Date.now()}`,
    type: 'text',
    text: title,
    x: size.width / 2 - 200,
    y: size.height / 2 - 100,
    width: 400,
    height: 50,
    fontSize: 32,
    fontFamily: 'Inter',
    bold: true,
    italic: false,
    underline: false,
    color: '#18181b',
    shadow: false,
    outline: false,
    visible: true,
  });

  // Subtitle
  if (subtitle) {
    elements.push({
      id: `subtitle-${Date.now()}`,
      type: 'text',
      text: subtitle,
      x: size.width / 2 - 200,
      y: size.height / 2 - 40,
      width: 400,
      height: 30,
      fontSize: 16,
      fontFamily: 'Inter',
      bold: false,
      italic: false,
      underline: false,
      color: '#71717a',
      shadow: false,
      outline: false,
      visible: true,
    });
  }

  // Generated date
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  elements.push({
    id: `date-${Date.now()}`,
    type: 'text',
    text: `Generated on ${dateStr}`,
    x: size.width / 2 - 150,
    y: size.height / 2 + 20,
    width: 300,
    height: 25,
    fontSize: 12,
    fontFamily: 'Inter',
    bold: false,
    italic: true,
    underline: false,
    color: '#a1a1aa',
    shadow: false,
    outline: false,
    visible: true,
  });

  return {
    id: `page-title-${Date.now()}`,
    size: pageSize as 'A4' | 'Short' | 'Long',
    orientation: orientation,
    elements,
    backgroundColor: '#ffffff',
  };
}

/**
 * Create data page with table rows and optional category markers
 * @deprecated Use the new height-based pagination in convertTableToCanvas instead
 */
function createDataPage(
  pageSize: string,
  items: BudgetItem[],
  columns: ColumnDefinition[],
  columnWidths: number[],
  includeHeaders: boolean,
  rowStartIndex: number,
  globalRowIndex: number,
  orientation: 'portrait' | 'landscape' = 'portrait',
  rowMarkers: import('./types').RowMarker[] = []
): Page {
  const baseSize = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES];
  const size = orientation === 'landscape'
    ? { width: baseSize.height, height: baseSize.width }
    : baseSize;
  const elements: TextElement[] = [];
  let currentY = MARGIN;

  // Create unique group ID for this page's table data
  const groupId = `table-group-${Date.now()}-${globalRowIndex}`;
  const groupName = `Table (Page Data ${globalRowIndex + 1})`;

  // Add headers if requested
  if (includeHeaders) {
    elements.push(...createTableHeaders(columns, columnWidths, currentY, groupId, groupName));
    currentY += MIN_HEADER_ROW_HEIGHT;
  }

  // Add data rows with category marker support
  items.forEach((item, index) => {
    // Check if there's a category marker at this position
    const markerAtThisIndex = rowMarkers.find(m => m.index === globalRowIndex + index);

    if (markerAtThisIndex) {
      // Render category header
      elements.push(...createCategoryHeaderRow(markerAtThisIndex.label, columnWidths, currentY, groupId, groupName));
      currentY += MIN_ROW_HEIGHT;
    }

    // Render data row
    elements.push(...createTableRow(item, columns, columnWidths, currentY, index % 2 === 0, groupId, groupName));
    currentY += MIN_ROW_HEIGHT;
  });

  return {
    id: `page-data-${Date.now()}-${globalRowIndex}`,
    size: pageSize as 'A4' | 'Short' | 'Long',
    orientation: orientation,
    elements,
    backgroundColor: '#ffffff',
  };
}

/**
 * Create table headers - ZERO PADDING, text has small internal padding
 */
function createTableHeaders(
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number,
  groupId?: string,
  groupName?: string
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    // Extra left padding for first column
    const firstColPadding = index === 0 ? FIRST_COLUMN_LEFT_PADDING : 0;

    elements.push({
      id: `header-${col.key}-${Date.now()}`,
      type: 'text',
      text: col.label,
      x: currentX + CELL_TEXT_PADDING + firstColPadding,
      y: y + CELL_TEXT_PADDING,
      width: columnWidths[index] - (CELL_TEXT_PADDING * 2) - firstColPadding,
      height: MIN_HEADER_ROW_HEIGHT - (CELL_TEXT_PADDING * 2),
      fontSize: DEFAULT_TABLE_STYLE.headerFontSize,
      fontFamily: 'Inter',
      bold: true,
      italic: false,
      underline: false,
      color: DEFAULT_TABLE_STYLE.headerColor,
      shadow: false,
      outline: false,
      visible: true,
      lineHeight: LINE_HEIGHT,
      groupId,
      groupName,
    });

    currentX += columnWidths[index]; // ✅ NO GAP between columns
  });

  return elements;
}

/**
 * Create table headers with text wrapping support
 */
function createTableHeadersWithWrapping(
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number,
  wrappedData: WrappedRowData,
  groupId?: string,
  groupName?: string
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    // Find the wrapped cell data for this column
    const cellData = wrappedData.cells.find(c => c.columnKey === col.key);
    const wrappedText = cellData ? cellData.lines.join('\n') : col.label;

    // Extra left padding for first column
    const firstColPadding = index === 0 ? FIRST_COLUMN_LEFT_PADDING : 0;

    elements.push({
      id: `header-${col.key}-${Date.now()}`,
      type: 'text',
      text: wrappedText,
      x: currentX + CELL_TEXT_PADDING + firstColPadding,
      y: y + CELL_TEXT_PADDING,
      width: columnWidths[index] - (CELL_TEXT_PADDING * 2) - firstColPadding,
      height: wrappedData.rowHeight - (CELL_TEXT_PADDING * 2),
      fontSize: DEFAULT_TABLE_STYLE.headerFontSize,
      fontFamily: 'Inter',
      bold: true,
      italic: false,
      underline: false,
      color: DEFAULT_TABLE_STYLE.headerColor,
      shadow: false,
      outline: false,
      visible: true,
      lineHeight: LINE_HEIGHT,
      groupId,
      groupName,
    });

    currentX += columnWidths[index];
  });

  return elements;
}

/**
 * Create a category header row (full-width, styled differently)
 */
function createCategoryHeaderRow(
  categoryLabel: string,
  columnWidths: number[],
  y: number,
  groupId?: string,
  groupName?: string
): TextElement[] {
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);

  // Apply extra left padding to category header as well for consistency
  const firstColPadding = FIRST_COLUMN_LEFT_PADDING;

  return [{
    id: `category-header-${categoryLabel}-${Date.now()}`,
    type: 'text',
    text: categoryLabel,
    x: MARGIN + CELL_TEXT_PADDING + firstColPadding,
    y: y + CELL_TEXT_PADDING,
    width: totalWidth - (CELL_TEXT_PADDING * 2) - firstColPadding,
    height: MIN_ROW_HEIGHT - (CELL_TEXT_PADDING * 2),
    fontSize: 11,
    fontFamily: 'Inter',
    bold: true,
    italic: false,
    underline: false,
    color: '#18181b',
    shadow: false,
    outline: false,
    visible: true,
    lineHeight: LINE_HEIGHT,
    groupId,
    groupName,
  }];
}

/**
 * Create a single table row - ZERO PADDING between cells
 */
function createTableRow(
  item: BudgetItem,
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number,
  isEven: boolean,
  groupId?: string,
  groupName?: string
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    const value = formatCellValue(item, col.key);

    // Extra left padding for first column
    const firstColPadding = index === 0 ? FIRST_COLUMN_LEFT_PADDING : 0;

    elements.push({
      id: `cell-${item.id}-${col.key}-${Date.now()}`,
      type: 'text',
      text: value,
      x: currentX + CELL_TEXT_PADDING + firstColPadding,
      y: y + CELL_TEXT_PADDING,
      width: columnWidths[index] - (CELL_TEXT_PADDING * 2) - firstColPadding,
      height: MIN_ROW_HEIGHT - (CELL_TEXT_PADDING * 2),
      fontSize: DEFAULT_TABLE_STYLE.dataFontSize,
      fontFamily: 'Inter',
      bold: false,
      italic: false,
      underline: false,
      color: DEFAULT_TABLE_STYLE.dataColor,
      shadow: false,
      outline: false,
      visible: true,
      lineHeight: LINE_HEIGHT,
      groupId,
      groupName,
    });

    currentX += columnWidths[index]; // ✅ NO GAP between columns
  });

  return elements;
}

/**
 * Create a single table row with text wrapping support
 */
function createTableRowWithWrapping(
  item: BudgetItem,
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number,
  wrappedData: WrappedRowData,
  groupId?: string,
  groupName?: string
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    // Find the wrapped cell data for this column
    const cellData = wrappedData.cells.find(c => c.columnKey === col.key);
    const wrappedText = cellData ? cellData.lines.join('\n') : formatCellValue(item, col.key);

    // Extra left padding for first column
    const firstColPadding = index === 0 ? FIRST_COLUMN_LEFT_PADDING : 0;

    elements.push({
      id: `cell-${item.id}-${col.key}-${Date.now()}`,
      type: 'text',
      text: wrappedText,
      x: currentX + CELL_TEXT_PADDING + firstColPadding,
      y: y + CELL_TEXT_PADDING,
      width: columnWidths[index] - (CELL_TEXT_PADDING * 2) - firstColPadding,
      height: wrappedData.rowHeight - (CELL_TEXT_PADDING * 2),
      fontSize: DEFAULT_TABLE_STYLE.dataFontSize,
      fontFamily: 'Inter',
      bold: false,
      italic: false,
      underline: false,
      color: DEFAULT_TABLE_STYLE.dataColor,
      shadow: false,
      outline: false,
      visible: true,
      lineHeight: LINE_HEIGHT,
      groupId,
      groupName,
    });

    currentX += columnWidths[index];
  });

  return elements;
}

/**
 * Format cell value based on column type
 */
function formatCellValue(item: BudgetItem, key: string): string {
  const value = (item as any)[key];

  if (value === null || value === undefined) return '-';

  // Currency formatting
  if (key.includes('Budget') || key.includes('budget')) {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  // Percentage formatting
  if (key === 'utilizationRate') {
    return `${value.toFixed(1)}%`;
  }

  // Status formatting
  if (key === 'status') {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  return String(value);
}

/**
 * Create totals page
 */
function createTotalsPage(
  pageSize: string,
  totals: BudgetTotals,
  columns: ColumnDefinition[],
  columnWidths: number[],
  orientation: 'portrait' | 'landscape' = 'portrait'
): Page {
  const elements: TextElement[] = [];
  const y = MARGIN;

  // Create unique group ID for totals page
  const groupId = `table-group-totals-${Date.now()}`;
  const groupName = 'Table (Totals)';

  elements.push(...createTotalsRow(totals, columns, columnWidths, y, groupId, groupName));

  return {
    id: `page-totals-${Date.now()}`,
    size: pageSize as 'A4' | 'Short' | 'Long',
    orientation: orientation,
    elements,
    backgroundColor: '#ffffff',
  };
}

/**
 * Add totals to existing page
 */
function addTotalsToPage(
  page: Page,
  totals: BudgetTotals,
  columns: ColumnDefinition[],
  columnWidths: number[]
): void {
  const lastElement = page.elements[page.elements.length - 1];
  const y = lastElement ? lastElement.y + lastElement.height + CELL_TEXT_PADDING * 2 : MARGIN;

  // Use the same groupId as other elements on this page
  const existingGroupId = lastElement?.groupId;
  const existingGroupName = lastElement?.groupName;

  const totalsElements = createTotalsRow(totals, columns, columnWidths, y, existingGroupId, existingGroupName);
  page.elements.push(...totalsElements);
}

/**
 * Create totals row - ZERO PADDING
 */
function createTotalsRow(
  totals: BudgetTotals,
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number,
  groupId?: string,
  groupName?: string
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    let value = '';

    if (col.key === 'particular') {
      value = 'TOTAL';
    } else if (col.key in totals) {
      const totalValue = (totals as any)[col.key];
      value = formatCellValue({ [col.key]: totalValue } as any, col.key);
    }

    // Extra left padding for first column
    const firstColPadding = index === 0 ? FIRST_COLUMN_LEFT_PADDING : 0;

    if (value) {
      elements.push({
        id: `total-${col.key}-${Date.now()}`,
        type: 'text',
        text: value,
        x: currentX + CELL_TEXT_PADDING + firstColPadding,
        y: y + CELL_TEXT_PADDING,
        width: columnWidths[index] - (CELL_TEXT_PADDING * 2) - firstColPadding,
        height: MIN_ROW_HEIGHT - (CELL_TEXT_PADDING * 2),
        fontSize: DEFAULT_TABLE_STYLE.totalsFontSize,
        fontFamily: 'Inter',
        bold: true,
        italic: false,
        underline: false,
        color: DEFAULT_TABLE_STYLE.totalsColor,
        shadow: false,
        outline: false,
        visible: true,
        lineHeight: LINE_HEIGHT,
        groupId,
        groupName,
      });
    }

    currentX += columnWidths[index]; // ✅ NO GAP between columns
  });

  return elements;
}

/**
 * Check if page has space for totals row
 */
function checkSpaceForTotals(page: Page, availableHeight: number): boolean {
  if (page.elements.length === 0) return true;

  const lastElement = page.elements[page.elements.length - 1];
  const lastElementBottom = lastElement.y + lastElement.height + CELL_TEXT_PADDING * 2;

  return (lastElementBottom + MIN_ROW_HEIGHT) < availableHeight;
}

/**
 * Create print header
 */
function createPrintHeader(title: string): HeaderFooter {
  return {
    elements: [
      {
        id: `header-title-${Date.now()}`,
        type: 'text',
        text: title,
        x: MARGIN,
        y: 20,
        width: 400,
        height: 30,
        fontSize: 18,
        fontFamily: 'Inter',
        bold: true,
        italic: false,
        underline: false,
        color: '#18181b',
        shadow: false,
        outline: false,
        visible: true,
      },
    ],
    backgroundColor: '#ffffff',
  };
}

/**
 * Create print footer
 */
function createPrintFooter(): HeaderFooter {
  return {
    elements: [
      {
        id: `footer-page-${Date.now()}`,
        type: 'text',
        text: 'Page {{pageNumber}} of {{totalPages}}',
        x: MARGIN,
        y: 20,
        width: 200,
        height: 20,
        fontSize: 10,
        fontFamily: 'Inter',
        bold: false,
        italic: false,
        underline: false,
        color: '#71717a',
        shadow: false,
        outline: false,
        visible: true,
      },
    ],
    backgroundColor: '#ffffff',
  };
}