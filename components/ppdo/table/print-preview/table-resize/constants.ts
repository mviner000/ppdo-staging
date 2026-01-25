// app/dashboard/project/[year]/components/table-resize/constants.ts

/**
 * Minimum allowed column width in pixels
 * Ensures columns remain readable and functional
 */
export const MIN_COLUMN_WIDTH = 40;

/**
 * Minimum allowed row height in pixels
 * Ensures rows remain readable and functional
 */
export const MIN_ROW_HEIGHT = 16;

/**
 * Maximum allowed column width in pixels
 * Prevents excessively wide columns
 */
export const MAX_COLUMN_WIDTH = 600;

/**
 * Maximum allowed row height in pixels
 * Prevents excessively tall rows
 */
export const MAX_ROW_HEIGHT = 200;

/**
 * Width of the resize handle hit area in pixels
 * Larger value makes it easier to grab, especially on touch devices
 */
export const RESIZE_HANDLE_WIDTH = 8;

/**
 * Visual width of the resize handle indicator in pixels
 * The visible line shown on hover
 */
export const RESIZE_HANDLE_VISUAL_WIDTH = 2;

/**
 * Active (dragging) width of the resize handle indicator in pixels
 */
export const RESIZE_HANDLE_ACTIVE_WIDTH = 3;

/**
 * Color of the resize handle (blue-500)
 */
export const RESIZE_HANDLE_COLOR = '#3b82f6';

/**
 * Hover opacity for resize handles
 */
export const RESIZE_HANDLE_HOVER_OPACITY = 0.5;

/**
 * Active (dragging) opacity for resize handles
 */
export const RESIZE_HANDLE_ACTIVE_OPACITY = 1;

/**
 * Tolerance in pixels for detecting resize handle hover
 */
export const RESIZE_HANDLE_TOLERANCE = 4;

/**
 * Step size in pixels for keyboard resize (arrow keys)
 */
export const KEYBOARD_RESIZE_STEP = 5;

/**
 * Animation duration for hover transitions in milliseconds
 */
export const TRANSITION_DURATION = 150;

/**
 * Cell padding used in table cells (for auto-fit calculation)
 * Should match the padding used in tableToCanvas.ts
 */
export const CELL_PADDING = 6;

/**
 * Touch target size for mobile devices (44x44px minimum)
 */
export const TOUCH_TARGET_SIZE = 44;

/**
 * Desktop resize handle width
 */
export const DESKTOP_HANDLE_WIDTH = 8;

/**
 * Tablet resize handle width
 */
export const TABLET_HANDLE_WIDTH = 32;

/**
 * Extended hit area around resize handle (in pixels)
 * Makes it easier to target the handle
 */
export const HANDLE_HIT_AREA_EXTENSION = 4;

/**
 * Hover delay before showing cursor change (in milliseconds)
 */
export const HOVER_DELAY = 100;

/**
 * Scale transform on hover for resize handle
 */
export const HOVER_SCALE = 1.1;

/**
 * Active column/row highlight color (semi-transparent blue)
 */
export const ACTIVE_HIGHLIGHT_COLOR = 'rgba(59, 130, 246, 0.1)';

/**
 * Active column/row border color
 */
export const ACTIVE_BORDER_COLOR = '#3b82f6';

/**
 * Active column/row border width
 */
export const ACTIVE_BORDER_WIDTH = 2;

/**
 * Dimension tooltip background color
 */
export const TOOLTIP_BG_COLOR = '#1f2937';

/**
 * Dimension tooltip text color
 */
export const TOOLTIP_TEXT_COLOR = '#ffffff';

/**
 * Dimension tooltip offset from cursor (in pixels)
 */
export const TOOLTIP_OFFSET = 12;

/**
 * Large keyboard resize step (with Shift key)
 */
export const KEYBOARD_RESIZE_STEP_LARGE = 50;

/**
 * Small keyboard resize step (with Ctrl/Cmd key)
 */
export const KEYBOARD_RESIZE_STEP_SMALL = 1;

/**
 * Debounce duration for save operations after resize (in milliseconds)
 */
export const SAVE_DEBOUNCE_DURATION = 500;

/**
 * Animation easing function for resize completion
 */
export const RESIZE_EASING = 'ease-out';

/**
 * Focus ring width for accessibility
 */
export const FOCUS_RING_WIDTH = 3;

/**
 * Focus ring color for accessibility (high contrast)
 */
export const FOCUS_RING_COLOR = '#3b82f6';

/**
 * Minimum contrast ratio for WCAG AA compliance
 */
export const MIN_CONTRAST_RATIO = 3;

// ============================================================================
// PAGE SIZE CONSTRAINTS
// ============================================================================

/**
 * Page sizes in pixels at 72 DPI (web/screen standard)
 * These match the values used in tableToCanvas.ts
 */
export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
} as const;

/**
 * Default margin used in table canvas rendering (from tableToCanvas.ts)
 */
export const TABLE_MARGIN = 20;

/**
 * Calculate maximum allowed table width based on page size and orientation
 * @param pageSize - 'A4', 'Short', or 'Long'
 * @param orientation - 'portrait' or 'landscape'
 * @returns Maximum table width in pixels
 */
export function getMaxTableWidth(
  pageSize: keyof typeof PAGE_SIZES = 'A4',
  orientation: 'portrait' | 'landscape' = 'portrait'
): number {
  const baseSize = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const pageWidth = orientation === 'landscape' ? baseSize.height : baseSize.width;
  return pageWidth - (TABLE_MARGIN * 2);
}

/**
 * Calculate maximum allowed table height based on page size and orientation
 * @param pageSize - 'A4', 'Short', or 'Long'
 * @param orientation - 'portrait' or 'landscape'
 * @returns Maximum table height in pixels
 */
export function getMaxTableHeight(
  pageSize: keyof typeof PAGE_SIZES = 'A4',
  orientation: 'portrait' | 'landscape' = 'portrait'
): number {
  const baseSize = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const pageHeight = orientation === 'landscape' ? baseSize.width : baseSize.height;
  // Account for header, footer, and margins
  const HEADER_HEIGHT = 80;
  const FOOTER_HEIGHT = 60;
  return pageHeight - HEADER_HEIGHT - FOOTER_HEIGHT - (TABLE_MARGIN * 2);
}
