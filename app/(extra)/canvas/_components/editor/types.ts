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
  shadow: boolean;
  outline: boolean;
  width: number;
  height: number;
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