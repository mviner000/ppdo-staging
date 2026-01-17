// app/dashboard/particulars/_components/TreeNode.tsx

"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const tooltipStyles = `
  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes tooltipFadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(4px);
    }
  }

  [data-state="delayed-open"][data-side="bottom"] {
    animation: tooltipFadeIn 200ms ease-out;
  }

  [data-state="closed"][data-side="bottom"] {
    animation: tooltipFadeOut 150ms ease-in;
  }
`;

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  FolderOpen,
  Folder,
  FileText,
  Boxes,
} from "lucide-react";
import { InlineEdit } from "./InlineEdit";

type NodeType = "budget" | "project" | "breakdown";

interface TreeNodeProps {
  item: any;
  level: number;
  type: NodeType;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
  isEditing: boolean;
  onSaveEdit: (newValue: string) => void;
  onCancelEdit: () => void;
  canEdit: boolean;
  canDelete: boolean;
  childrenCount?: number;
  grandChildrenCount?: number;
  children?: React.ReactNode;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function TreeNode({
  item,
  level,
  type,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onClick,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  canEdit,
  canDelete,
  childrenCount,
  grandChildrenCount,
  children,
}: TreeNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChildren = Boolean(children) && (childrenCount || 0) > 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const getIcon = () => {
    if (type === "budget")
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 text-blue-500" />
      ) : (
        <Folder className="h-4 w-4 text-blue-500" />
      );
    if (type === "project")
      return <FileText className="h-4 w-4 text-purple-500" />;
    return <Boxes className="h-4 w-4 text-green-500" />;
  };

  const getLabel = () => {
    if (type === "budget") return item.fullName;
    if (type === "project") return item.particulars;
    return item.projectName;
  };

  const getBackgroundColor = () => {
    if (isEditing) {
      return "bg-blue-50 dark:bg-blue-950";
    }
    if (type === "budget") {
      return "bg-blue-50 shadow-md dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30";
    }
    if (type === "project") {
      return "bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30";
    }
    return "bg-green-50 dark:bg-green-950/20 hover:bg-green-100/70 dark:hover:bg-green-900/30";
  };

  const getTooltipContent = () => {
    if (type === "budget") {
      return (
        <div className="space-y-1">
          <p className="font-semibold">{item.code}</p>
          <p className="text-xs">{item.fullName}</p>
          {item.description && (
            <p className="text-xs text-gray-300 mt-1">{item.description}</p>
          )}
          {item.category && (
            <p className="text-xs mt-1">
              <span className="text-gray-400">Category:</span> {item.category}
            </p>
          )}
        </div>
      );
    }
    if (type === "project") {
      return (
        <div className="space-y-1">
          <p className="font-semibold">{item.particulars}</p>
          <p className="text-xs">
            <span className="text-gray-400">Office:</span>{" "}
            {item.implementingOffice}
          </p>
          {item.year && (
            <p className="text-xs">
              <span className="text-gray-400">Year:</span> {item.year}
            </p>
          )}
          <p className="text-xs">
            <span className="text-gray-400">Budget:</span>{" "}
            {formatCurrency(item.totalBudgetAllocated || 0)}
          </p>
          {item.status && (
            <p className="text-xs">
              <span className="text-gray-400">Status:</span>{" "}
              <span className="capitalize">{item.status}</span>
            </p>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <p className="font-semibold">{item.projectName}</p>
        <p className="text-xs">
          <span className="text-gray-400">Office:</span>{" "}
          {item.implementingOffice}
        </p>
        {item.municipality && (
          <p className="text-xs">
            <span className="text-gray-400">Location:</span>{" "}
            {item.municipality}
            {item.barangay && `, ${item.barangay}`}
          </p>
        )}
        <p className="text-xs">
          <span className="text-gray-400">Budget:</span>{" "}
          {formatCurrency(item.allocatedBudget || 0)}
        </p>
        {item.status && (
          <p className="text-xs">
            <span className="text-gray-400">Status:</span>{" "}
            <span className="capitalize">{item.status}</span>
          </p>
        )}
      </div>
    );
  };

  const nodeContent = (
    <div
      className={`grid grid-cols-12 gap-2 py-1.5 px-2 rounded transition-colors ${getBackgroundColor()}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>{tooltipStyles}</style>
      
      {/* Column 1-5: Particular Name */}
      <div className="col-span-5 flex items-center gap-2 min-w-0" style={{ paddingLeft: `${level * 12}px` }}>
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={onToggle}
            className="h-5 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="w-5 shrink-0" />
        )}

        {/* Icon */}
        <div className="shrink-0">{getIcon()}</div>

        {/* Budget Code (for budget type only) */}
        {type === "budget" && !isEditing && (
          <Badge variant="outline" className="text-xs font-mono shrink-0">
            {item.code}
          </Badge>
        )}

        {/* Content with Tooltip */}
        <TooltipProvider delayDuration={0}>
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isEditing ? (
                  <InlineEdit
                    value={getLabel()}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                  />
                ) : (
                  <button
                    onClick={() => onClick?.()}
                    className="text-sm font-medium truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full cursor-pointer"
                  >
                    {getLabel()}
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              align="start" 
              className="max-w-xs"
            >
              {getTooltipContent()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Column 6-8: Implementing Office */}
      <div className="col-span-3 flex items-center justify-center">
        {(type === "project" || type === "breakdown") && !isEditing && (
          <Badge variant="secondary" className="text-xs">
            {item.implementingOffice}
          </Badge>
        )}
      </div>

      {/* Column 9-12: Totals and Actions */}
      <div className="col-span-4 flex items-center justify-end gap-2">
        {/* Children Count */}
        {!isEditing && (childrenCount || grandChildrenCount) ? (
          <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
            {childrenCount !== undefined && childrenCount > 0 && (
              <Badge 
                variant="outline" 
                className="text-xs h-5 bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300"
              >
                {childrenCount} {type === "budget" ? "projects" : "items"}
              </Badge>
            )}
            {grandChildrenCount !== undefined &&
              grandChildrenCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs h-5 bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
                >
                  {grandChildrenCount} breakdowns
                </Badge>
              )}
          </div>
        ) : null}

        {/* Action Buttons */}
        {!isEditing && isHovered && (
          <div className="flex items-center gap-1 shrink-0">
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="h-3 w-3 text-blue-600" />
              </Button>
            )}
            {canDelete && (type === "budget" || type === "project") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (type === "budget" || type === "project") {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>
            {nodeContent}
            {isExpanded && hasChildren && (
              <div className="border-l border-gray-200 dark:border-gray-700 ml-3">
                {children}
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onEdit} disabled={!canEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem
            onClick={onDelete}
            disabled={!canDelete}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <div>
      {nodeContent}
      {isExpanded && hasChildren && (
        <div className="border-l border-gray-200 dark:border-gray-700 ml-3">
          {children}
        </div>
      )}
    </div>
  );
}