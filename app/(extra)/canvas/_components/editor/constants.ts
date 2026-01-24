// app/(extra)/canvas/_components/editor/constants.ts

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
} as const;

export const STORAGE_KEY = 'canvas-editor-state';
export const RULER_STORAGE_KEY = 'canvas-editor-ruler-state';

export const HEADER_HEIGHT = 80;
export const FOOTER_HEIGHT = 60;

// Ruler constants
export const RULER_HEIGHT = 24; // Height for horizontal ruler
export const RULER_WIDTH = 24;  // Width for vertical ruler

// Conversion: 1 inch = 72 points (standard DPI for print)
// A4 width in points: 595 / 72 = 8.27 inches
// Short/Long width in points: 612 / 72 = 8.5 inches
export const POINTS_PER_INCH = 72;
export const CM_PER_INCH = 2.54;

// Page dimensions in inches for reference
export const PAGE_SIZES_INCHES = {
  A4: { width: 8.27, height: 11.69 },
  Short: { width: 8.5, height: 11 },
  Long: { width: 8.5, height: 13 },
} as const;

// Default margins in pixels (approximately 1 inch = 72px)
export const DEFAULT_MARGINS = {
  left: 72,
  right: 72,
  top: 72,
  bottom: 72,
} as const;

// Tab stop types
export type TabStopType = 'left' | 'center' | 'right' | 'decimal';

// Ruler unit options
export type RulerUnit = 'inches' | 'cm' | 'pixels';

// Helper function to get page dimensions based on size and orientation
export const getPageDimensions = (
  size: 'A4' | 'Short' | 'Long',
  orientation: 'portrait' | 'landscape' = 'portrait'
): { width: number; height: number } => {
  const baseSize = PAGE_SIZES[size];
  
  if (orientation === 'landscape') {
    return {
      width: baseSize.height,
      height: baseSize.width,
    };
  }
  
  return baseSize;
};