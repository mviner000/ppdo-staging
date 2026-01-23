// app/dashboard/canvas/_components/editor/constants.ts

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
} as const;

export const STORAGE_KEY = 'canvas-editor-state';

export const HEADER_HEIGHT = 80;
export const FOOTER_HEIGHT = 60;