// app/dashboard/canvas/_components/editor/constants.ts

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
} as const;

export const STORAGE_KEY = 'canvas-editor-state';

export const HEADER_HEIGHT = 80;
export const FOOTER_HEIGHT = 60;

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