// app/dashboard/project/budget/[particularId]/components/ProjectsTable/ProjectsTableRow.tsx

import React, { useState } from "react";
import { Pin, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "../../types";
import { ANIMATION } from "../../constants";
import { formatCurrency, formatPercentage, getUtilizationColor, getStatusColor } from "../../utils";

interface ProjectsTableRowProps {
  project: Project;
  hiddenColumns: Set<string>;
  isSelected: boolean;
  isNewlyAdded: boolean;
  canManageBulkActions: boolean;
  onSelect: (checked: boolean) => void;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  accentColor: string;
  rowRef?: React.RefObject<HTMLTableRowElement | null>;
  isRemarksExpanded?: boolean; // 🆕 NEW PROP
  onToggleRemarks?: (projectId: string, e: React.MouseEvent) => void; // 🆕 NEW PROP
}

/**
 * Individual project table row
 * Handles display of all project data in table format
 */
export function ProjectsTableRow({
  project,
  hiddenColumns,
  isSelected,
  isNewlyAdded,
  canManageBulkActions,
  onSelect,
  onClick,
  onContextMenu,
  accentColor,
  rowRef,
  isRemarksExpanded = false, // 🆕 DEFAULT FALSE
  onToggleRemarks, // 🆕 NEW PROP
}: ProjectsTableRowProps) {
  
  const [isHoveringRemarks, setIsHoveringRemarks] = useState(false); // 🆕 HOVER STATE
  const animationConfig = useReducedMotion();
  
  const rowClassName = `
    hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors
    ${project.isPinned ? 'bg-amber-50 dark:bg-amber-950/20' : ''}
    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
  `;

  return (
    <motion.tr
      ref={rowRef}
      initial={animationConfig.shouldAnimate && isNewlyAdded ? {
        boxShadow: `0 0 0 3px ${accentColor}`,
        scale: 1.01
      } : undefined}
      animate={animationConfig.shouldAnimate && isNewlyAdded ? {
        boxShadow: [
          `0 0 0 3px ${accentColor}`,
          `0 0 0 0px ${accentColor}00`,
        ],
        scale: [1.01, 1]
      } : undefined}
      transition={animationConfig.shouldAnimate && isNewlyAdded ? {
        duration: ANIMATION.NEW_PROJECT_DURATION / 1000,
        ease: animationConfig.ease,
      } : undefined}
      onContextMenu={onContextMenu}
      onClick={onClick}
      className={rowClassName}
    >
      {/* Checkbox */}
      {canManageBulkActions && (
        <td className="px-3 py-3 text-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}

      {/* Particulars */}
      {!hiddenColumns.has('particulars') && (
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            {project.isPinned && <Pin className="w-3.5 h-3.5 text-amber-600" />}
            <span className="text-sm font-medium">{project.particulars}</span>
          </div>
        </td>
      )}

      {/* Implementing Office */}
      {!hiddenColumns.has('implementingOffice') && (
        <td className="px-3 py-3 text-sm text-zinc-600">
          {project.implementingOffice}
        </td>
      )}

      {/* Year */}
      {!hiddenColumns.has('year') && (
        <td className="px-3 py-3 text-sm text-center">
          {project.year || "-"}
        </td>
      )}

      {/* Status */}
      {!hiddenColumns.has('status') && (
        <td className="px-3 py-3 text-sm">
          <span className={`font-medium ${getStatusColor(project.status)}`}>
            {project.status
              ? project.status.replace('_', ' ').charAt(0).toUpperCase() + 
                project.status.slice(1).replace('_', ' ')
              : '-'}
          </span>
        </td>
      )}

      {/* Budget Allocated */}
      {!hiddenColumns.has('totalBudgetAllocated') && (
        <td className="px-3 py-3 text-right text-sm font-medium">
          {formatCurrency(project.totalBudgetAllocated)}
        </td>
      )}

      {/* Obligated Budget */}
      {!hiddenColumns.has('obligatedBudget') && (
        <td className="px-3 py-3 text-right text-sm">
          {project.obligatedBudget ? formatCurrency(project.obligatedBudget) : "-"}
        </td>
      )}

      {/* Budget Utilized */}
      {!hiddenColumns.has('totalBudgetUtilized') && (
        <td className="px-3 py-3 text-right text-sm font-medium">
          {formatCurrency(project.totalBudgetUtilized)}
        </td>
      )}

      {/* Utilization Rate */}
      {!hiddenColumns.has('utilizationRate') && (
        <td className="px-3 py-3 text-right text-sm font-semibold">
          <span className={getUtilizationColor(project.utilizationRate)}>
            {formatPercentage(project.utilizationRate)}
          </span>
        </td>
      )}

      {/* Completed */}
      {!hiddenColumns.has('projectCompleted') && (
        <td className="px-3 py-3 text-right text-sm">
          <span className={project.projectCompleted >= 80 ? "text-green-600" : "text-zinc-600"}>
            {Math.round(project.projectCompleted)}
          </span>
        </td>
      )}

      {/* Delayed */}
      {!hiddenColumns.has('projectDelayed') && (
        <td className="px-3 py-3 text-right text-sm">
          {Math.round(project.projectDelayed)}
        </td>
      )}

      {/* Ongoing */}
      {!hiddenColumns.has('projectsOngoing') && (
        <td className="px-3 py-3 text-right text-sm">
          {Math.round(project.projectsOngoing)}
        </td>
      )}

      {/* 🆕 Remarks - WITH EXPAND BUTTON */}
      {!hiddenColumns.has('remarks') && (
        <td 
          className="px-3 py-3 text-sm text-zinc-500 relative group"
          onMouseEnter={() => setIsHoveringRemarks(true)}
          onMouseLeave={() => setIsHoveringRemarks(false)}
        >
          <div className="flex items-center gap-2">
            <span 
              className={`${
                isRemarksExpanded 
                  ? 'whitespace-normal break-words' 
                  : 'truncate max-w-[150px]'
              }`}
              title={!isRemarksExpanded && project.remarks ? project.remarks : undefined}
            >
              {project.remarks || "-"}
            </span>
            
            {/* 🆕 ELLIPSIS BUTTON - Shows on hover if there's text */}
            {project.remarks && project.remarks !== "-" && (
              <button
                onClick={(e) => {
                  if (onToggleRemarks) {
                    onToggleRemarks(project.id, e);
                  }
                }}
                className={`
                  no-click flex-shrink-0 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 
                  transition-opacity duration-200
                  ${isHoveringRemarks || isRemarksExpanded ? 'opacity-100' : 'opacity-0'}
                `}
                title={isRemarksExpanded ? "Collapse remarks" : "Expand remarks"}
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
          </div>
        </td>
      )}
    </motion.tr>
  );
}