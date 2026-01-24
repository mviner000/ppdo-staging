/**
 * Table Style Application Utility
 * Provides functions to apply table styles to grouped table elements
 */

import { CanvasElement, TextElement } from '../types';
import { TableStyle, TableElementRole } from '../types/table-style';

/**
 * Determines the role of a text element within a table structure
 */
function determineElementRole(
  element: TextElement,
  allTableElements: TextElement[]
): TableElementRole {
  // Sort elements by Y position to understand row structure
  const sortedByY = [...allTableElements].sort((a, b) => a.y - b.y);

  // Find the Y position of this element
  const elementIndex = sortedByY.findIndex(el => el.id === element.id);

  // First row is typically the header (and usually has bold text)
  if (elementIndex === 0 || (elementIndex < sortedByY.length * 0.1 && element.bold)) {
    return 'header';
  }

  // Check if this might be a category header (bold text in middle of table)
  if (element.bold && elementIndex > 0) {
    return 'categoryHeader';
  }

  // Determine if this is an even or odd row based on unique Y positions
  const uniqueYPositions = Array.from(new Set(sortedByY.map(el => el.y))).sort((a, b) => a - b);
  const rowIndex = uniqueYPositions.indexOf(element.y);

  // Account for header row (index 0)
  const dataRowIndex = rowIndex - 1;

  // Even/odd determination (0-indexed, so odd index = even row visually)
  return dataRowIndex % 2 === 0 ? 'evenRow' : 'oddRow';
}

/**
 * Generates style updates for an element based on its role and the table style
 */
function getStyleUpdatesForRole(
  role: TableElementRole,
  style: TableStyle
): Partial<TextElement> {
  const updates: Partial<TextElement> = {};

  switch (role) {
    case 'header':
      updates.backgroundColor = style.headerStyle.backgroundColor;
      updates.color = style.headerStyle.color;
      updates.bold = style.headerStyle.bold;
      if (style.headerStyle.fontSize) {
        updates.fontSize = style.headerStyle.fontSize;
      }
      break;

    case 'evenRow':
      updates.backgroundColor = style.rowStyle.evenRowColor;
      updates.color = style.rowStyle.color;
      if (style.rowStyle.fontSize) {
        updates.fontSize = style.rowStyle.fontSize;
      }
      break;

    case 'oddRow':
      updates.backgroundColor = style.rowStyle.oddRowColor;
      updates.color = style.rowStyle.color;
      if (style.rowStyle.fontSize) {
        updates.fontSize = style.rowStyle.fontSize;
      }
      break;

    case 'categoryHeader':
      if (style.categoryHeaderStyle) {
        updates.backgroundColor = style.categoryHeaderStyle.backgroundColor;
        updates.color = style.categoryHeaderStyle.color;
        updates.bold = style.categoryHeaderStyle.bold;
      }
      break;
  }

  return updates;
}

/**
 * Applies a table style to all elements in a table group
 *
 * @param elements - All canvas elements (from all sections)
 * @param groupId - The ID of the table group to style
 * @param style - The table style to apply
 * @param onUpdateElement - Callback to update each element
 */
export function applyTableStyle(
  elements: CanvasElement[],
  groupId: string,
  style: TableStyle,
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
): void {
  // Filter to get only text elements in this table group
  const tableElements = elements.filter(
    el => el.groupId === groupId && el.type === 'text'
  ) as TextElement[];

  if (tableElements.length === 0) {
    console.warn(`No text elements found for group: ${groupId}`);
    return;
  }

  // Apply styles to each element based on its role
  tableElements.forEach((element) => {
    const role = determineElementRole(element, tableElements);
    const styleUpdates = getStyleUpdatesForRole(role, style);

    // Apply the updates
    onUpdateElement(element.id, styleUpdates);
  });
}

/**
 * Batch version of applyTableStyle for better performance with large tables
 *
 * @param elements - All canvas elements
 * @param groupId - The ID of the table group to style
 * @param style - The table style to apply
 * @param onBatchUpdate - Callback to update multiple elements at once
 */
export function applyTableStyleBatch(
  elements: CanvasElement[],
  groupId: string,
  style: TableStyle,
  onBatchUpdate: (updates: Array<{ id: string; changes: Partial<CanvasElement> }>) => void
): void {
  // Filter to get only text elements in this table group
  const tableElements = elements.filter(
    el => el.groupId === groupId && el.type === 'text'
  ) as TextElement[];

  if (tableElements.length === 0) {
    console.warn(`No text elements found for group: ${groupId}`);
    return;
  }

  // Collect all updates
  const updates: Array<{ id: string; changes: Partial<CanvasElement> }> = [];

  tableElements.forEach((element) => {
    const role = determineElementRole(element, tableElements);
    const styleUpdates = getStyleUpdatesForRole(role, style);

    updates.push({
      id: element.id,
      changes: styleUpdates,
    });
  });

  // Apply all updates in a single batch
  onBatchUpdate(updates);
}

/**
 * Preview what roles would be assigned to elements without applying styles
 * Useful for debugging or showing a preview
 */
export function previewTableRoles(
  elements: CanvasElement[],
  groupId: string
): Map<string, TableElementRole> {
  const tableElements = elements.filter(
    el => el.groupId === groupId && el.type === 'text'
  ) as TextElement[];

  const roleMap = new Map<string, TableElementRole>();

  tableElements.forEach((element) => {
    const role = determineElementRole(element, tableElements);
    roleMap.set(element.id, role);
  });

  return roleMap;
}
