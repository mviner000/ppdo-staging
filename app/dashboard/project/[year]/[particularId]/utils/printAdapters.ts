/**
 * Print adapters for converting table data to print-ready format
 * Handles transformation of table data (with categories, filtering, etc.) 
 * into the canonical shape expected by PrintPreviewModal
 */

import { Project } from '../types';
import { GroupedProjects, ProjectCategory } from '../types';
import { ColumnDefinition, RowMarker } from '@/lib/print-canvas/types';

/**
 * Result of preparing projects for print
 */
export interface PrintProjectsData {
  flatItems: Project[];
  rowMarkers: RowMarker[];
}

/**
 * Flattens grouped projects into a single array with category row markers
 * 
 * @param groupedProjects - Projects grouped by category
 * @returns Flat items array and row markers indicating category positions
 * 
 * @example
 * Input: [{ category: {id: "cat1", label: "Infrastructure"}, projects: [p1, p2] }]
 * Output: {
 *   flatItems: [p1, p2],
 *   rowMarkers: [{ index: 0, type: 'category', label: 'Infrastructure', categoryId: 'cat1' }]
 * }
 */
export function flattenGroupedProjectsForPrint(
  groupedProjects: GroupedProjects[]
): PrintProjectsData {
  const flatItems: Project[] = [];
  const rowMarkers: RowMarker[] = [];

  for (const group of groupedProjects) {
    // Skip empty categories
    if (!group.projects || group.projects.length === 0) {
      continue;
    }

    // Record the position of this category header
    const categoryLabel = group.category?.fullName || group.category?.code || 'Uncategorized';
    const categoryId = group.category?._id;

    rowMarkers.push({
      index: flatItems.length,
      type: 'category',
      label: categoryLabel,
      categoryId,
    });

    // Add all projects from this group
    flatItems.push(...group.projects);
  }

  return { flatItems, rowMarkers };
}

/**
 * Maps project table columns to print column definitions
 * Ensures consistency between UI columns and print output
 * 
 * @param hiddenColumns - Set of column keys that should not be printed
 * @returns Array of visible column definitions
 */
export function getProjectPrintColumns(hiddenColumns: Set<string>): ColumnDefinition[] {
  const allColumns: ColumnDefinition[] = [
    { key: 'particulars', label: 'Particulars', align: 'left' },
    { key: 'description', label: 'Description', align: 'left' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'budget', label: 'Budget Allocated', align: 'right' },
    { key: 'obligations', label: 'Obligations', align: 'right' },
    { key: 'disbursements', label: 'Disbursements', align: 'right' },
    { key: 'utilizationRate', label: 'Utilization %', align: 'right' },
  ];

  return allColumns.filter(col => !hiddenColumns.has(col.key));
}
