/**
 * Table Styling Types
 * Defines the structure for table style templates and their properties
 */

export interface TableStyle {
  id: string;
  name: string;
  preview: string; // Base64 thumbnail or SVG
  description: string;

  // Style properties for table header row
  headerStyle: {
    backgroundColor: string;
    color: string;
    bold: boolean;
    fontSize?: number;
  };

  // Style properties for data rows
  rowStyle: {
    evenRowColor: string;
    oddRowColor: string;
    color: string;
    fontSize?: number;
  };

  // Border style configuration
  borderStyle: {
    enabled: boolean;
    color: string;
    width: number;
    horizontalOnly?: boolean; // If true, only apply horizontal borders
  };

  // Optional style for category headers (intermediate headers)
  categoryHeaderStyle?: {
    backgroundColor: string;
    color: string;
    bold: boolean;
  };
}

/**
 * Determines the role of an element within a table structure
 */
export type TableElementRole = 'header' | 'evenRow' | 'oddRow' | 'categoryHeader';
