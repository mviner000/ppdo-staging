// app/dashboard/project/budget/[particularId]/components/ProjectsTable/ProjectsTableBody.tsx

import React from "react";
// animations handled within row and group components
import { Project, GroupedProjects } from "../../types";
import { ProjectCategoryGroup } from "./ProjectCategoryGroup";


interface ProjectsTableBodyProps {
  groupedProjects: [string, GroupedProjects][];
  hiddenColumns: Set<string>;
  selectedIds: Set<string>;
  newlyAddedProjectId: string | null | undefined;
  canManageBulkActions: boolean;
  totalVisibleColumns: number;
  onSelectCategory: (projects: Project[], checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onRowClick: (project: Project, e: React.MouseEvent) => void;
  onContextMenu: (project: Project, e: React.MouseEvent) => void;
  accentColor: string;
  expandedRemarks: Set<string>; // 🆕 NEW PROP
  onToggleRemarks: (projectId: string, e: React.MouseEvent) => void; // 🆕 NEW PROP
}

/**
 * Table body that renders all project groups and rows
 */
export function ProjectsTableBody({
  groupedProjects,
  hiddenColumns,
  selectedIds,
  newlyAddedProjectId,
  canManageBulkActions,
  totalVisibleColumns,
  onSelectCategory,
  onSelectRow,
  onRowClick,
  onContextMenu,
  accentColor,
  expandedRemarks, // 🆕 NEW PROP
  onToggleRemarks, // 🆕 NEW PROP
}: ProjectsTableBodyProps) {
  // No outer motion wrapper here to preserve valid table structure.
  if (groupedProjects.length === 0) {
    return (
      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
        <tr>
          <td
            colSpan={totalVisibleColumns + (canManageBulkActions ? 1 : 0)}
            className="px-4 py-12 text-center text-sm text-zinc-500"
          >
            No projects found matching your criteria.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {groupedProjects.map(([categoryId, group]) => (
        <ProjectCategoryGroup
          key={categoryId}
          categoryId={categoryId}
          category={group.category}
          projects={group.projects}
          selectedIds={selectedIds}
          hiddenColumns={hiddenColumns}
          newlyAddedProjectId={newlyAddedProjectId ?? null}
          canManageBulkActions={canManageBulkActions}
          totalVisibleColumns={totalVisibleColumns}
          onSelectCategory={(checked) => onSelectCategory(group.projects, checked)}
          onSelectRow={onSelectRow}
          onRowClick={onRowClick}
          onContextMenu={onContextMenu}
          accentColor={accentColor}
          expandedRemarks={expandedRemarks} // 🆕 PASS DOWN
          onToggleRemarks={onToggleRemarks} // 🆕 PASS DOWN
        />
      ))}
    </tbody>
  );
}