// app/dashboard/particulars/_components/ConsolidatedParticularsList.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { TreeNode } from "./TreeNode";
import { HierarchyHeader } from "./HierarchyHeader";
import { HierarchyFooter } from "./HierarchyFooter";
import { SearchResultsView } from "./SearchResultsView";
import { ParticularDeleteDialog } from "./ParticularDeleteDialog";
import { ParticularDetailModal } from "./ParticularDetailModal";
import { useParticularPermissions } from "../_hooks/useParticularPermissions";
import { useHierarchyData } from "../_hooks/useHierarchyData";
import { useSearchFilter } from "../_hooks/useSearchFilter";
import { useUrlState } from "../_hooks/useUrlState";
import { UI_TIMING } from "../_constants/particularConstants";

type NodeType = "budget" | "project" | "breakdown";
type SortOrder = "asc" | "desc";

interface EditingState {
  type: NodeType;
  id: string;
  value: string;
}

interface ProjectWithBreakdowns extends Doc<"projects"> {
  breakdowns: Doc<"govtProjectBreakdowns">[];
}

interface BudgetItemWithProjects extends Doc<"budgetItems"> {
  projects: ProjectWithBreakdowns[];
}

interface ConsolidatedParticularsListProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export function ConsolidatedParticularsList({ 
  selectedYear, 
  onYearChange 
}: ConsolidatedParticularsListProps) {
  const { canEditParticular, canDeleteParticular } = useParticularPermissions();
  const { urlState, updateUrlState, copyUrlToClipboard } = useUrlState();

  // Queries
  const budgetParticulars = useQuery(api.budgetParticulars.list, {
    includeInactive: true,
  });
  const projectParticulars = useQuery(api.projectParticulars.list, {
    includeInactive: true,
  });
  // ✅ Fixed: Pass empty object {} to satisfy the required args parameter
  const budgetItems = useQuery(api.budgetItems.list, {});
  const projects = useQuery(api.projects.list, {}); 
  const breakdowns = useQuery(api.govtProjects.getProjectBreakdowns, {});

  // Mutations
  const updateBudgetParticular = useMutation(api.budgetParticulars.update);
  const updateProjectParticular = useMutation(api.projectParticulars.update);
  const updateProject = useMutation(api.projects.update);
  const updateBreakdown = useMutation(api.govtProjects.updateProjectBreakdown);

  // State
  const [searchTerm, setSearchTerm] = useState(urlState.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(urlState.search || "");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(urlState.expanded || [])
  );
  const [editingNode, setEditingNode] = useState<EditingState | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    type: "budget" | "project";
    item: any;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: NodeType;
    item: any;
  } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>(urlState.sortOrder || "asc");
  const [urlCopied, setUrlCopied] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const isLoading =
    budgetParticulars === undefined ||
    projectParticulars === undefined ||
    budgetItems === undefined ||
    projects === undefined ||
    breakdowns === undefined;

  // Sync URL state with local state on mount
  useEffect(() => {
    if (urlState.year && urlState.year !== selectedYear) {
      onYearChange(urlState.year);
    }
  }, []);

  // Debounce search - using constant
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      updateUrlState({ search: searchTerm || undefined });
    }, UI_TIMING.SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm, updateUrlState]);

  // Update URL when expanded nodes change
  useEffect(() => {
    const expandedArray = Array.from(expandedNodes);
    updateUrlState({ expanded: expandedArray.length > 0 ? expandedArray : undefined });
  }, [expandedNodes, updateUrlState]);

  // Update URL when sort order changes
  useEffect(() => {
    updateUrlState({ sortOrder });
  }, [sortOrder, updateUrlState]);

  // Custom hooks for data processing
  const { hierarchyData, groupedByYear, totals } = useHierarchyData({
    budgetParticulars,
    projectParticulars,
    budgetItems,
    projects,
    breakdowns,
    selectedYear,
    sortOrder,
  });

  const { filteredData, searchResults, searchSuggestions } = useSearchFilter({
    hierarchyData,
    debouncedSearch,
    budgetParticulars,
    projects,
    breakdowns,
  });

  // Handlers
  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveEdit = async (newValue: string) => {
    if (!editingNode) return;

    try {
      const { type, id } = editingNode;

      if (type === "budget") {
        const particular = budgetParticulars?.find((p) => p._id === id);
        if (particular) {
          await updateBudgetParticular({
            id: particular._id,
            fullName: newValue,
          });
          toast.success(`Budget particular updated to "${newValue}"`);
        }
      } else if (type === "project") {
        const particular = projectParticulars?.find((p) => p._id === id);
        if (particular) {
          await updateProjectParticular({
            id: particular._id,
            fullName: newValue,
          });
          toast.success(`Project particular updated to "${newValue}"`);
        }
      } else if (type === "breakdown") {
        const breakdown = breakdowns?.find((b) => b._id === id);
        if (breakdown) {
          await updateBreakdown({
            breakdownId: breakdown._id as Id<"govtProjectBreakdowns">,
            projectName: newValue,
          });
          toast.success(`Breakdown title updated to "${newValue}"`);
        }
      }

      setEditingNode(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSuggestionClick = (label: string) => {
    setSearchTerm(label);
    setShowSuggestions(false);
  };

  // Handler for edit from search results
  const handleSearchEdit = (type: NodeType, item: any) => {
    if (!canEditParticular) {
      toast.error("You don't have permission to edit particulars");
      return;
    }

    const value = 
      type === "budget" ? item.fullName :
      type === "project" ? item.particulars :
      item.projectName;

    setEditingNode({
      type,
      id: item._id,
      value,
    });
  };

  // Handler for delete from search results
  const handleSearchDelete = (type: NodeType, item: any) => {
    if (!canDeleteParticular) {
      toast.error("You don't have permission to delete particulars");
      return;
    }

    if (type === "budget" || type === "project") {
      setDeletingItem({ type, item });
    } else {
      toast.error("Breakdowns cannot be deleted from this view");
    }
  };

  // Handler for item click (view details)
  const handleItemClick = (type: NodeType, item: any) => {
    setSelectedItem({ type, item });
  };

  // Handle share URL - using constant
  const handleShareUrl = async () => {
    const success = await copyUrlToClipboard();
    if (success) {
      setUrlCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setUrlCopied(false), UI_TIMING.URL_COPIED_DURATION);
    } else {
      toast.error("Failed to copy link");
    }
  };

  // Trigger animation when year changes
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [selectedYear]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render year header component
  const YearHeader = ({ year }: { year: number }) => (
    <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-4 pt-1 mb-2">
      <h3 className="text-lg font-semibold text-black dark:text-gray-100">
        {year}
      </h3>
    </div>
  );

  // Render tree items helper - using constant for animation delay
  const renderTreeItems = (data: typeof hierarchyData) => {
    return data.map((item, index) => {
      const budgetExpanded = expandedNodes.has(item.particular._id);

      return (
        <div
          key={`${animationKey}-${item.particular._id}`}
          className="animate-slide-down"
          style={{
            animationDelay: `${index * UI_TIMING.ANIMATION_DELAY_PER_ITEM}ms`,
            animationFillMode: "backwards",
          }}
        >
          <TreeNode
            item={item.particular}
            level={0}
            type="budget"
            isExpanded={budgetExpanded}
            onToggle={() => toggleNode(item.particular._id)}
            onClick={() => handleItemClick("budget", item.particular)}
            onEdit={() =>
              setEditingNode({
                type: "budget",
                id: item.particular._id,
                value: item.particular.fullName,
              })
            }
            onDelete={() =>
              setDeletingItem({ type: "budget", item: item.particular })
            }
            isEditing={
              editingNode?.type === "budget" &&
              editingNode?.id === item.particular._id
            }
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditingNode(null)}
            canEdit={canEditParticular}
            canDelete={canDeleteParticular}
            childrenCount={item.totalProjects}
            grandChildrenCount={item.totalBreakdowns}
          >
            {item.budgetItems.map((budgetItem: BudgetItemWithProjects) =>
              budgetItem.projects.map((project: ProjectWithBreakdowns) => {
                const projectExpanded = expandedNodes.has(project._id);
                const breakdownCount = project.breakdowns?.length || 0;

                return (
                  <TreeNode
                    key={project._id}
                    item={project}
                    level={1}
                    type="project"
                    isExpanded={projectExpanded}
                    onToggle={() => toggleNode(project._id)}
                    onClick={() => handleItemClick("project", project)}
                    onEdit={() =>
                      setEditingNode({
                        type: "project",
                        id: project._id,
                        value: project.particulars,
                      })
                    }
                    onDelete={() =>
                      setDeletingItem({ type: "project", item: project })
                    }
                    isEditing={
                      editingNode?.type === "project" &&
                      editingNode?.id === project._id
                    }
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditingNode(null)}
                    canEdit={canEditParticular}
                    canDelete={canDeleteParticular}
                    childrenCount={breakdownCount}
                  >
                    {project.breakdowns?.map((breakdown: Doc<"govtProjectBreakdowns">) => (
                      <TreeNode
                        key={breakdown._id}
                        item={breakdown}
                        level={2}
                        type="breakdown"
                        isExpanded={false}
                        onToggle={() => {}}
                        onClick={() => handleItemClick("breakdown", breakdown)}
                        onEdit={() =>
                          setEditingNode({
                            type: "breakdown",
                            id: breakdown._id,
                            value: breakdown.projectName,
                          })
                        }
                        onDelete={() => {}}
                        isEditing={
                          editingNode?.type === "breakdown" &&
                          editingNode?.id === breakdown._id
                        }
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={() => setEditingNode(null)}
                        canEdit={canEditParticular}
                        canDelete={false}
                      />
                    ))}
                  </TreeNode>
                );
              })
            )}
          </TreeNode>
        </div>
      );
    });
  };

  return (
    <>
      <Card>
        <HierarchyHeader
          sortOrder={sortOrder}
          onToggleSort={toggleSortOrder}
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setShowSuggestions(true);
          }}
          onSearchFocus={() => setShowSuggestions(true)}
          onSearchBlur={() => setTimeout(() => setShowSuggestions(false), UI_TIMING.SUGGESTION_CLOSE_DELAY)}
          showSuggestions={showSuggestions}
          searchSuggestions={searchSuggestions}
          onSuggestionClick={handleSuggestionClick}
          isSearchActive={!!debouncedSearch}
        />

        <CardContent className="-my-4 px-2 max-h-[calc(100vh-340px)] overflow-y-auto">
          {debouncedSearch ? (
            <SearchResultsView 
              results={searchResults}
              onEdit={canEditParticular ? handleSearchEdit : undefined}
              onDelete={canDeleteParticular ? handleSearchDelete : undefined}
            />
          ) : (
            <>
              {/* When "All Years" is selected and data is grouped by year */}
              {selectedYear === "all" && groupedByYear && groupedByYear.length > 0 ? (
                groupedByYear.map((yearGroup, yearIndex) => (
                  <div key={`year-${yearGroup.year}`} className="mb-4">
                    <YearHeader year={yearGroup.year} />
                    <div className="space-y-1">
                      {renderTreeItems(yearGroup.data)}
                    </div>
                  </div>
                ))
              ) : selectedYear !== "all" && filteredData.length > 0 ? (
                /* When specific year is selected */
                renderTreeItems(filteredData)
              ) : (
                /* No data */
                <div className="text-center py-8 text-sm text-gray-500">
                  No particulars available
                  {selectedYear !== "all" && ` for year ${selectedYear}`}
                </div>
              )}
            </>
          )}
        </CardContent>

        {!debouncedSearch && (selectedYear === "all" ? (groupedByYear && groupedByYear.length > 0) : filteredData.length > 0) && (
          <HierarchyFooter
            budgetItems={totals.budgetItems}
            projects={totals.projects}
            breakdowns={totals.breakdowns}
          />
        )}
      </Card>

      {deletingItem && (
        <ParticularDeleteDialog
          type={deletingItem.type}
          particular={{
            _id: deletingItem.item._id,
            code: deletingItem.item.code,
            fullName: deletingItem.item.fullName,
            usageCount: deletingItem.item.usageCount,
            projectUsageCount: deletingItem.item.projectUsageCount,
            isSystemDefault: deletingItem.item.isSystemDefault,
          }}
          open={!!deletingItem}
          onOpenChange={(open: boolean) => !open && setDeletingItem(null)}
          onSuccess={() => setDeletingItem(null)}
        />
      )}

      {selectedItem && (
        <ParticularDetailModal
          type={selectedItem.type}
          item={selectedItem.item}
          open={!!selectedItem}
          onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
          onEdit={canEditParticular ? handleSearchEdit : undefined}
          onDelete={canDeleteParticular ? handleSearchDelete : undefined}
        />
      )}

      {/* Add CSS for animation */}
      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}