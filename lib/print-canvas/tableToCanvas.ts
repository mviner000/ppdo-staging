// lib/print-canvas/tableToCanvas.ts

import { Page, HeaderFooter, TextElement } from '@/app/dashboard/canvas/_components/editor/types';
import { 
  ConversionConfig, 
  ConversionResult, 
  DEFAULT_TABLE_STYLE,
  CellBounds,
  ColumnDefinition,
  BudgetTotals
} from './types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';

const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
};

const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 60;
const MARGIN = 20;
const ROW_HEIGHT = 24;
const HEADER_ROW_HEIGHT = 28;

/**
 * Converts budget table data into canvas pages
 */
export function convertTableToCanvas(config: ConversionConfig): ConversionResult {
  console.group('📍 STEP 5: Table to Canvas Conversion - Started');
  console.log('🔧 Config received:', config);
  console.log('📊 Items to convert:', config.items?.length || 0);
  console.log('📊 First item:', config.items?.[0]);
  console.log('📊 Totals:', config.totals);
  console.log('📊 Columns:', config.columns);
  console.log('📊 Columns count:', config.columns?.length || 0);
  console.log('🔍 Hidden columns:', config.hiddenColumns);
  console.log('🔍 Hidden columns size:', config.hiddenColumns?.size || 0);
  console.log('📄 Page size:', config.pageSize);
  console.log('📋 Include headers:', config.includeHeaders);
  console.log('📋 Include totals:', config.includeTotals);
  console.log('📝 Title:', config.title);
  console.log('📝 Subtitle:', config.subtitle);
  
  // Validate inputs
  if (!config.items || config.items.length === 0) {
    console.error('❌ CRITICAL: No items to convert!');
  }
  if (!config.columns || config.columns.length === 0) {
    console.error('❌ CRITICAL: No columns defined!');
  }
  if (!config.totals) {
    console.error('❌ CRITICAL: Totals object is missing!');
  }

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
  } = config;

  const size = PAGE_SIZES[pageSize];
  console.log('📐 Page dimensions:', size);
  
  const availableHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT - (MARGIN * 2);
  console.log('📐 Available height for content:', availableHeight);
  
  // Filter visible columns
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));
  console.log('👁️ Visible columns:', visibleColumns);
  console.log('👁️ Visible columns count:', visibleColumns.length);
  
  const columnWidths = calculateColumnWidths(visibleColumns, size.width - (MARGIN * 2));
  console.log('📏 Column widths calculated:', columnWidths);
  
  // Create pages
  const pages: Page[] = [];
  
  // Calculate rows per page
  const headerHeight = includeHeaders ? HEADER_ROW_HEIGHT : 0;
  const rowsPerPage = Math.floor((availableHeight - headerHeight) / ROW_HEIGHT);
  console.log('📊 Rows per page:', rowsPerPage);
  console.log('📊 Expected page count:', Math.ceil(items.length / rowsPerPage));

  // Create title page if title provided
  if (title) {
    console.log('📄 Creating title page...');
    const titlePage = createTitlePage(pageSize, title, subtitle);
    pages.push(titlePage);
    console.log('✅ Title page created with', titlePage.elements.length, 'elements');
  }

  // Paginate items
  let rowStartIndex = 0;
  for (let i = 0; i < items.length; i += rowsPerPage) {
    const pageItems = items.slice(i, Math.min(i + rowsPerPage, items.length));
    console.log(`📄 Creating data page ${pages.length + 1} with ${pageItems.length} rows...`);
    
    const page = createDataPage(
      pageSize,
      pageItems,
      visibleColumns,
      columnWidths,
      includeHeaders,
      rowStartIndex,
      i
    );
    
    console.log(`✅ Data page created with ${page.elements.length} elements`);
    pages.push(page);
    rowStartIndex = i + pageItems.length;
  }

  // Add totals page if requested
  if (includeTotals && pages.length > 0) {
    console.log('📊 Adding totals...');
    const lastPage = pages[pages.length - 1];
    const hasSpace = checkSpaceForTotals(lastPage);
    
    if (hasSpace) {
      console.log('✅ Adding totals to last page');
      addTotalsToPage(lastPage, totals, visibleColumns, columnWidths);
    } else {
      console.log('📄 Creating separate totals page');
      const totalsPage = createTotalsPage(pageSize, totals, visibleColumns, columnWidths);
      pages.push(totalsPage);
    }
  }

  // Create header and footer
  console.log('📄 Creating header and footer...');
  const header = createPrintHeader(title || 'Budget Tracking Report');
  const footer = createPrintFooter();
  console.log('✅ Header elements:', header.elements.length);
  console.log('✅ Footer elements:', footer.elements.length);

  const result = {
    pages,
    header,
    footer,
    metadata: {
      totalPages: pages.length,
      totalRows: items.length,
      createdAt: Date.now(),
      pageSize,
      columnCount: visibleColumns.length,
    },
  };

  console.log('✅ Conversion complete!');
  console.log('📊 Final result:', result);
  console.log('📄 Total pages created:', pages.length);
  console.groupEnd();
  
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
function createTitlePage(pageSize: string, title: string, subtitle?: string): Page {
  const size = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES];
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
    size: pageSize as any,
    elements,
    backgroundColor: '#ffffff',
  };
}

/**
 * Create data page with table rows
 */
function createDataPage(
  pageSize: string,
  items: BudgetItem[],
  columns: ColumnDefinition[],
  columnWidths: number[],
  includeHeaders: boolean,
  rowStartIndex: number,
  globalRowIndex: number
): Page {
  const size = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES];
  const elements: TextElement[] = [];
  let currentY = MARGIN;

  // Add headers if requested
  if (includeHeaders) {
    elements.push(...createTableHeaders(columns, columnWidths, currentY));
    currentY += HEADER_ROW_HEIGHT;
  }

  // Add data rows
  items.forEach((item, index) => {
    elements.push(...createTableRow(item, columns, columnWidths, currentY, index % 2 === 0));
    currentY += ROW_HEIGHT;
  });

  return {
    id: `page-data-${Date.now()}-${globalRowIndex}`,
    size: pageSize as any,
    elements,
    backgroundColor: '#ffffff',
  };
}

/**
 * Create table headers
 */
function createTableHeaders(
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    elements.push({
      id: `header-${col.key}-${Date.now()}`,
      type: 'text',
      text: col.label,
      x: currentX + DEFAULT_TABLE_STYLE.cellPadding,
      y: y + DEFAULT_TABLE_STYLE.cellPadding,
      width: columnWidths[index] - (DEFAULT_TABLE_STYLE.cellPadding * 2),
      height: HEADER_ROW_HEIGHT - (DEFAULT_TABLE_STYLE.cellPadding * 2),
      fontSize: DEFAULT_TABLE_STYLE.headerFontSize,
      fontFamily: 'Inter',
      bold: true,
      italic: false,
      underline: false,
      color: DEFAULT_TABLE_STYLE.headerColor,
      shadow: false,
      outline: false,
      visible: true,
    });

    currentX += columnWidths[index];
  });

  return elements;
}

/**
 * Create a single table row
 */
function createTableRow(
  item: BudgetItem,
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number,
  isEven: boolean
): TextElement[] {
  const elements: TextElement[] = [];
  let currentX = MARGIN;

  columns.forEach((col, index) => {
    const value = formatCellValue(item, col.key);
    
    elements.push({
      id: `cell-${item.id}-${col.key}-${Date.now()}`,
      type: 'text',
      text: value,
      x: currentX + DEFAULT_TABLE_STYLE.cellPadding,
      y: y + DEFAULT_TABLE_STYLE.cellPadding,
      width: columnWidths[index] - (DEFAULT_TABLE_STYLE.cellPadding * 2),
      height: ROW_HEIGHT - (DEFAULT_TABLE_STYLE.cellPadding * 2),
      fontSize: DEFAULT_TABLE_STYLE.dataFontSize,
      fontFamily: 'Inter',
      bold: false,
      italic: false,
      underline: false,
      color: DEFAULT_TABLE_STYLE.dataColor,
      shadow: false,
      outline: false,
      visible: true,
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
  columnWidths: number[]
): Page {
  const elements: TextElement[] = [];
  const y = MARGIN;
  
  elements.push(...createTotalsRow(totals, columns, columnWidths, y));
  
  return {
    id: `page-totals-${Date.now()}`,
    size: pageSize as any,
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
  const y = lastElement ? lastElement.y + ROW_HEIGHT + 10 : MARGIN;
  
  const totalsElements = createTotalsRow(totals, columns, columnWidths, y);
  page.elements.push(...totalsElements);
}

/**
 * Create totals row
 */
function createTotalsRow(
  totals: BudgetTotals,
  columns: ColumnDefinition[],
  columnWidths: number[],
  y: number
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
    
    if (value) {
      elements.push({
        id: `total-${col.key}-${Date.now()}`,
        type: 'text',
        text: value,
        x: currentX + DEFAULT_TABLE_STYLE.cellPadding,
        y: y + DEFAULT_TABLE_STYLE.cellPadding,
        width: columnWidths[index] - (DEFAULT_TABLE_STYLE.cellPadding * 2),
        height: ROW_HEIGHT - (DEFAULT_TABLE_STYLE.cellPadding * 2),
        fontSize: DEFAULT_TABLE_STYLE.totalsFontSize,
        fontFamily: 'Inter',
        bold: true,
        italic: false,
        underline: false,
        color: DEFAULT_TABLE_STYLE.totalsColor,
        shadow: false,
        outline: false,
        visible: true,
      });
    }

    currentX += columnWidths[index];
  });

  return elements;
}

/**
 * Check if page has space for totals row
 */
function checkSpaceForTotals(page: Page): boolean {
  if (page.elements.length === 0) return true;
  
  const lastElement = page.elements[page.elements.length - 1];
  const pageSize = PAGE_SIZES[page.size];
  const availableHeight = pageSize.height - HEADER_HEIGHT - FOOTER_HEIGHT - MARGIN;
  
  return (lastElement.y + ROW_HEIGHT + ROW_HEIGHT) < availableHeight;
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