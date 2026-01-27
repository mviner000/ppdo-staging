// app/(extra)/canvas/_components/editor/types.ts

export interface TextElement {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  backgroundColor?: string;
  shadow: boolean;
  outline: boolean;
  width: number;
  height: number;
  lineHeight?: number; // Line height multiplier (e.g., 1.2)
  locked?: boolean;
  visible?: boolean;
  groupId?: string;
  groupName?: string;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  imageId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  groupId?: string;
  groupName?: string;
}

export type CanvasElement = TextElement | ImageElement;

export interface HeaderFooter {
  elements: CanvasElement[];
  backgroundColor?: string;
}

export interface Page {
  id: string;
  size: 'A4' | 'Short' | 'Long';
  orientation: 'portrait' | 'landscape';
  elements: CanvasElement[];
  backgroundColor?: string;
}

export interface EditorState {
  pages: Page[];
  currentPageIndex: number;
  selectedElementId: string | null;
  isEditingElementId: string | null;
  header: HeaderFooter;
  footer: HeaderFooter;
}

// Ruler types
export type TabStopType = 'left' | 'center' | 'right' | 'decimal';
export type RulerUnit = 'inches' | 'cm' | 'pixels';

export interface TabStop {
  id: string;
  position: number; // Position in pixels from left edge
  type: TabStopType;
}

export interface IndentSettings {
  firstLine: number;   // First line indent in pixels
  hanging: number;     // Hanging indent in pixels (left side)
  left: number;        // Left indent in pixels
  right: number;       // Right indent in pixels
}

export interface MarginSettings {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface RulerState {
  visible: boolean;
  showVertical: boolean;
  unit: RulerUnit;
  margins: MarginSettings;
  indents: IndentSettings;
  tabStops: TabStop[];
  zoom: number;
}