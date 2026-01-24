/**
 * Pre-defined Table Styles
 * Inspired by Microsoft Word/PowerPoint table templates
 */

import { TableStyle } from '../types/table-style';

/**
 * Style 1: Grid Table Light (Default)
 * Classic professional table with dark blue header
 */
export const GRID_TABLE_LIGHT: TableStyle = {
  id: 'grid-table-light',
  name: 'Grid Table Light',
  description: 'Classic table style with dark blue header and alternating gray rows',
  preview: `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="white"/>
      <rect x="10" y="10" width="100" height="15" fill="#1F4E78"/>
      <rect x="10" y="25" width="100" height="13" fill="#FFFFFF" stroke="#BFBFBF" stroke-width="1"/>
      <rect x="10" y="38" width="100" height="13" fill="#F2F2F2" stroke="#BFBFBF" stroke-width="1"/>
      <rect x="10" y="51" width="100" height="13" fill="#FFFFFF" stroke="#BFBFBF" stroke-width="1"/>
    </svg>
  `)}`,
  headerStyle: {
    backgroundColor: '#1F4E78',
    color: '#FFFFFF',
    bold: true,
    fontSize: 11,
  },
  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#F2F2F2',
    color: '#000000',
    fontSize: 10,
  },
  borderStyle: {
    enabled: true,
    color: '#BFBFBF',
    width: 1,
  },
  categoryHeaderStyle: {
    backgroundColor: '#D9D9D9',
    color: '#000000',
    bold: true,
  },
};

/**
 * Style 2: Grid Table Accent 1
 * Modern blue theme with lighter header
 */
export const GRID_TABLE_ACCENT_1: TableStyle = {
  id: 'grid-table-accent-1',
  name: 'Grid Table Accent 1',
  description: 'Modern blue theme with alternating light blue rows',
  preview: `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="white"/>
      <rect x="10" y="10" width="100" height="15" fill="#4472C4"/>
      <rect x="10" y="25" width="100" height="13" fill="#FFFFFF" stroke="#4472C4" stroke-width="1"/>
      <rect x="10" y="38" width="100" height="13" fill="#D9E2F3" stroke="#4472C4" stroke-width="1"/>
      <rect x="10" y="51" width="100" height="13" fill="#FFFFFF" stroke="#4472C4" stroke-width="1"/>
    </svg>
  `)}`,
  headerStyle: {
    backgroundColor: '#4472C4',
    color: '#FFFFFF',
    bold: true,
    fontSize: 11,
  },
  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#D9E2F3',
    color: '#000000',
    fontSize: 10,
  },
  borderStyle: {
    enabled: true,
    color: '#4472C4',
    width: 1,
  },
  categoryHeaderStyle: {
    backgroundColor: '#B4C7E7',
    color: '#000000',
    bold: true,
  },
};

/**
 * Style 3: Grid Table Medium
 * Fresh green theme for environmental/growth data
 */
export const GRID_TABLE_MEDIUM: TableStyle = {
  id: 'grid-table-medium',
  name: 'Grid Table Medium',
  description: 'Fresh green theme with alternating light green rows',
  preview: `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="white"/>
      <rect x="10" y="10" width="100" height="15" fill="#70AD47"/>
      <rect x="10" y="25" width="100" height="13" fill="#FFFFFF" stroke="#70AD47" stroke-width="1"/>
      <rect x="10" y="38" width="100" height="13" fill="#E2EFDA" stroke="#70AD47" stroke-width="1"/>
      <rect x="10" y="51" width="100" height="13" fill="#FFFFFF" stroke="#70AD47" stroke-width="1"/>
    </svg>
  `)}`,
  headerStyle: {
    backgroundColor: '#70AD47',
    color: '#FFFFFF',
    bold: true,
    fontSize: 11,
  },
  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#E2EFDA',
    color: '#000000',
    fontSize: 10,
  },
  borderStyle: {
    enabled: true,
    color: '#70AD47',
    width: 1,
  },
  categoryHeaderStyle: {
    backgroundColor: '#C5E0B4',
    color: '#000000',
    bold: true,
  },
};

/**
 * Style 4: List Table Light
 * Minimal gray theme with horizontal borders only
 */
export const LIST_TABLE_LIGHT: TableStyle = {
  id: 'list-table-light',
  name: 'List Table Light',
  description: 'Minimal style with gray header and horizontal borders only',
  preview: `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="white"/>
      <rect x="10" y="10" width="100" height="15" fill="#D9D9D9"/>
      <line x1="10" y1="25" x2="110" y2="25" stroke="#BFBFBF" stroke-width="1"/>
      <line x1="10" y1="38" x2="110" y2="38" stroke="#BFBFBF" stroke-width="1"/>
      <line x1="10" y1="51" x2="110" y2="51" stroke="#BFBFBF" stroke-width="1"/>
      <line x1="10" y1="64" x2="110" y2="64" stroke="#BFBFBF" stroke-width="1"/>
    </svg>
  `)}`,
  headerStyle: {
    backgroundColor: '#D9D9D9',
    color: '#000000',
    bold: true,
    fontSize: 11,
  },
  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#FFFFFF',
    color: '#000000',
    fontSize: 10,
  },
  borderStyle: {
    enabled: true,
    color: '#BFBFBF',
    width: 1,
    horizontalOnly: true,
  },
  categoryHeaderStyle: {
    backgroundColor: '#F2F2F2',
    color: '#000000',
    bold: true,
  },
};

/**
 * Style 5: Colorful Grid
 * Vibrant orange theme for emphasis
 */
export const COLORFUL_GRID: TableStyle = {
  id: 'colorful-grid',
  name: 'Colorful Grid',
  description: 'Vibrant orange theme with bold borders',
  preview: `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="white"/>
      <rect x="10" y="10" width="100" height="15" fill="#ED7D31"/>
      <rect x="10" y="25" width="100" height="13" fill="#FFFFFF" stroke="#ED7D31" stroke-width="2"/>
      <rect x="10" y="38" width="100" height="13" fill="#FBE5D6" stroke="#ED7D31" stroke-width="2"/>
      <rect x="10" y="51" width="100" height="13" fill="#FFFFFF" stroke="#ED7D31" stroke-width="2"/>
    </svg>
  `)}`,
  headerStyle: {
    backgroundColor: '#ED7D31',
    color: '#FFFFFF',
    bold: true,
    fontSize: 11,
  },
  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#FBE5D6',
    color: '#000000',
    fontSize: 10,
  },
  borderStyle: {
    enabled: true,
    color: '#ED7D31',
    width: 2,
  },
  categoryHeaderStyle: {
    backgroundColor: '#F4B183',
    color: '#000000',
    bold: true,
  },
};

/**
 * Style 6: Minimal
 * Clean minimal design with subtle borders
 */
export const MINIMAL: TableStyle = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean minimal design with subtle horizontal borders',
  preview: `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="white"/>
      <rect x="10" y="10" width="100" height="15" fill="#FFFFFF"/>
      <line x1="10" y1="25" x2="110" y2="25" stroke="#E7E6E6" stroke-width="1"/>
      <line x1="10" y1="38" x2="110" y2="38" stroke="#E7E6E6" stroke-width="1"/>
      <line x1="10" y1="51" x2="110" y2="51" stroke="#E7E6E6" stroke-width="1"/>
      <line x1="10" y1="64" x2="110" y2="64" stroke="#E7E6E6" stroke-width="1"/>
    </svg>
  `)}`,
  headerStyle: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    bold: true,
    fontSize: 11,
  },
  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#FFFFFF',
    color: '#000000',
    fontSize: 10,
  },
  borderStyle: {
    enabled: true,
    color: '#E7E6E6',
    width: 1,
    horizontalOnly: true,
  },
  categoryHeaderStyle: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    bold: true,
  },
};

/**
 * Export all table styles as an array for easy iteration
 */
export const TABLE_STYLES: TableStyle[] = [
  GRID_TABLE_LIGHT,
  GRID_TABLE_ACCENT_1,
  GRID_TABLE_MEDIUM,
  LIST_TABLE_LIGHT,
  COLORFUL_GRID,
  MINIMAL,
];

/**
 * Export a map for quick lookup by style ID
 */
export const TABLE_STYLES_MAP = new Map<string, TableStyle>(
  TABLE_STYLES.map(style => [style.id, style])
);
