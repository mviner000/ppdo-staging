// app/dashboard/project/[year]/[particularId]/components/ProjectsTable.tsx

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAccentColor } from "@/contexts/AccentColorContext";

// UI Components
import { Modal } from "@/app/dashboard/project/[year]/components/BudgetModal";
import { ConfirmationModal } from "@/app/dashboard/project/[year]/components/BudgetConfirmationModal";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";

// Local Components
import { ProjectForm } from "./ProjectForm";
import { ProjectCategoryCombobox } from "./ProjectCategoryCombobox";
import { ProjectShareModal } from "./ProjectShareModal";
import { ProjectCategoryFilter } from "./ProjectsTable/ProjectCategoryFilter";
import { ProjectsTableToolbar } from "./ProjectsTable/ProjectsTableToolbar";
import { ProjectsTableHeader } from "./ProjectsTable/ProjectsTableHeader";
import { ProjectsTableBody } from "./ProjectsTable/ProjectsTableBody";
import { ProjectsTableFooter } from "./ProjectsTable/ProjectsTableFooter";
import { ProjectContextMenu } from "./ProjectsTable/ProjectContextMenu";
import { ProjectBulkToggleDialog } from "./ProjectBulkToggleDialog";
import { PrintPreviewModal } from "@/components/ppdo/table/print-preview/PrintPreviewModal";

// Types, Constants, and Utils
import {
  Project,
  ProjectsTableProps,
  SortDirection,
  ProjectSortField,
  ProjectContextMenuState,
} from "../types";
import { AVAILABLE_COLUMNS } from "../constants";
import {
  groupProjectsByCategory,
  calculateProjectTotals,
  createProjectSlug,
  getParticularFullName,
} from "../utils";
import {
  applyFilters,
  createProjectFilterConfig,
  exportToCSV,
  createProjectExportConfig,
} from "@/services";
import {
  flattenGroupedProjectsForPrint,
  getProjectPrintColumns,
} from "../utils/printAdapters";
import { BudgetTotals, PrintDraft } from "@/lib/print-canvas/types";

export function ProjectsTable({
  projects,
  particularId,
  budgetItemId,
  budgetItemYear,
  onAdd,
  onEdit,
  onDelete,
  onOpenTrash,
  newlyAddedProjectId,
  expandButton,
}: ProjectsTableProps) {
  const { accentColorValue } = useAccentColor();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ==================== QUERIES & MUTATIONS ====================
  const currentUser = useQuery(api.users.current);
  const allCategories = useQuery(api.projectCategories.list, {});
  const pendingParticularRequests = useQuery(
    api.accessRequests.getParticularPendingCount,
    { particularCode: particularId }
  );

  const togglePinProject = useMutation(api.projects.togglePin);
  const bulkMoveToTrash = useMutation(api.projects.bulkMoveToTrash);
  const bulkUpdateCategory = useMutation(api.projects.bulkUpdateCategory);
  const updateProject = useMutation(api.projects.update);
  const toggleAutoCalculate = useMutation(api.projects.toggleAutoCalculate);
  const bulkToggleAutoCalculate = useMutation(api.projects.bulkToggleAutoCalculate);

  // ==================== STATE: MODALS ====================
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBulkCategoryConfirmModal, setShowBulkCategoryConfirmModal] = useState(false);
  const [showSingleCategoryModal, setShowSingleCategoryModal] = useState(false);
  const [showSearchWarningModal, setShowSearchWarningModal] = useState(false);
  const [showHideAllWarning, setShowHideAllWarning] = useState(false);
  const [showBulkToggleDialog, setShowBulkToggleDialog] = useState(false);
  const [isBulkToggling, setIsBulkToggling] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // ==================== STATE: DATA ====================
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategoryProject, setSelectedCategoryProject] = useState<Project | null>(null);
  const [singleCategoryId, setSingleCategoryId] = useState<Id<"projectCategories"> | undefined>(undefined);
  const [pendingBulkCategoryId, setPendingBulkCategoryId] = useState<Id<"projectCategories"> | undefined>(undefined);

  // ==================== STATE: SELECTION & FILTERS ====================
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<ProjectSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [officeFilter, setOfficeFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]); // 🆕 NEW: Category filter state
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);

  // ==================== STATE: UI ====================
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ProjectContextMenuState | null>(null);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [selectedLogProject, setSelectedLogProject] = useState<Project | null>(null);
  const [expandedRemarks, setExpandedRemarks] = useState<Set<string>>(new Set());
  const [isTogglingAutoCalculate, setIsTogglingAutoCalculate] = useState(false);

  // ==================== COMPUTED VALUES ====================
  const canManageBulkActions = useMemo(() => {
    return currentUser?.role === "admin" || currentUser?.role === "super_admin";
  }, [currentUser]);

  // 🆕 Filter by category first
  const categoryFilteredProjects = useMemo(() => {
    if (categoryFilter.length === 0) return projects;
    return projects.filter((project) =>
      categoryFilter.includes(project.categoryId || "uncategorized")
    );
  }, [projects, categoryFilter]);

  // Apply remaining filters and sorting
  const filteredAndSortedProjects = useMemo(() =>
    applyFilters(categoryFilteredProjects, createProjectFilterConfig(
      searchQuery,
      statusFilter,
      yearFilter,
      officeFilter,
      sortField,
      sortDirection
    )),
    [categoryFilteredProjects, searchQuery, statusFilter, yearFilter, officeFilter, sortField, sortDirection]
  );

  // Group projects by category
  const groupedProjects = useMemo(() => {
    return groupProjectsByCategory(filteredAndSortedProjects, allCategories);
  }, [filteredAndSortedProjects, allCategories]);

  // Prepare categories for the category filter UI (include counts)
  const categoriesForFilter = useMemo(() => {
    const total = filteredAndSortedProjects.length;
    // groupedProjects contains only groups with projects (>0)
    const groups = groupedProjects.map(([id, group]) => ({
      _id: id,
      fullName: group.category?.fullName || "Uncategorized",
      count: group.projects.length,
    }));

    return [
      { _id: "all", fullName: "All Categories", count: total },
      ...groups,
    ];
  }, [groupedProjects, filteredAndSortedProjects]);

  // Calculate totals
  const totals = useMemo(() => {
    return calculateProjectTotals(filteredAndSortedProjects);
  }, [filteredAndSortedProjects]);

  // Prepare print data with category row markers
  const printData = useMemo(() => {
    const groupedArray = groupedProjects.map(([_, group]) => group);
    return flattenGroupedProjectsForPrint(groupedArray);
  }, [groupedProjects]);

  // Get print columns (respecting hidden columns)
  const printColumns = useMemo(() => {
    return getProjectPrintColumns(hiddenColumns);
  }, [hiddenColumns]);

  // Convert project totals to budget totals format for PrintPreviewModal
  const printTotals: BudgetTotals = useMemo(() => ({
    totalBudgetAllocated: totals.totalBudgetAllocated || 0,
    obligatedBudget: totals.obligatedBudget || 0,
    totalBudgetUtilized: totals.totalBudgetUtilized || 0,
    projectCompleted: totals.projectCompleted || 0,
    projectDelayed: totals.projectDelayed || 0,
    projectsOnTrack: totals.projectsOngoing || 0,
  }), [totals]);

  // Selection state
  const isAllSelected = filteredAndSortedProjects.length > 0 &&
    selectedIds.size === filteredAndSortedProjects.length;
  const isIndeterminate = selectedIds.size > 0 &&
    selectedIds.size < filteredAndSortedProjects.length;

  // Count visible columns
  const totalVisibleColumns = AVAILABLE_COLUMNS.filter(
    col => !hiddenColumns.has(col.id)
  ).length;

  // ==================== URL SYNC HELPER ====================
  const updateURL = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing params with this key
    params.delete(key);

    // Add new values
    if (values.length > 0) {
      values.forEach(value => params.append(key, value));
    }

    const newURL = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(newURL, { scroll: false });
  };

  // ==================== EFFECTS ====================

  // 🆕 Initialize category filter from URL (ONLY ON MOUNT)
  useEffect(() => {
    const categoryParams = searchParams.getAll("category");
    if (categoryParams.length > 0) {
      setCategoryFilter(categoryParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Initialize year filter from URL (ONLY ON MOUNT)
  useEffect(() => {
    const yearParams = searchParams.getAll("year");
    if (yearParams.length > 0) {
      const years = yearParams.map(y => parseInt(y)).filter(y => !isNaN(y));
      if (years.length > 0) {
        setYearFilter(years);
        return;
      }
    }

    const sessionYear = typeof window !== "undefined"
      ? sessionStorage.getItem("budget_year_preference")
      : null;
    if (sessionYear) {
      const year = parseInt(sessionYear);
      if (!isNaN(year)) {
        setYearFilter([year]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // 🆕 Sync category filter to URL (skip if matching URL)
  useEffect(() => {
    const currentParams = searchParams.getAll("category");
    const isSame = currentParams.length === categoryFilter.length &&
      currentParams.every(p => categoryFilter.includes(p));

    if (!isSame) {
      updateURL("category", categoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  // Sync year filter to URL (skip if matching URL)
  useEffect(() => {
    const currentParams = searchParams.getAll("year");
    const currentYears = yearFilter.map(String);
    const isSame = currentParams.length === currentYears.length &&
      currentParams.every(p => currentYears.includes(p));

    if (!isSame) {
      updateURL("year", yearFilter.map(String));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearFilter]);

  // 🆕 Handle category filter change
  const handleCategoryFilterChange = (categoryIds: string[]) => {
    setCategoryFilter(categoryIds);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAndSortedProjects.map(p => p.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectCategory = (categoryProjects: Project[], checked: boolean) => {
    const newSelected = new Set(selectedIds);
    categoryProjects.forEach(p => {
      if (checked) {
        newSelected.add(p.id);
      } else {
        newSelected.delete(p.id);
      }
    });
    setSelectedIds(newSelected);
  };

  const handleSort = (field: ProjectSortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" :
          sortDirection === "desc" ? null :
            "asc"
      );
      if (sortDirection === "desc") setSortField(null);
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (project: Project, e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("[role='checkbox']") ||
      (e.target as HTMLElement).closest(".no-click")
    ) {
      return;
    }

    const pathSegments = pathname.split('/');
    const projectIndex = pathSegments.findIndex(seg => seg === 'project');
    const year = pathSegments[projectIndex + 1];

    const projectSlug = createProjectSlug(project.particulars, project.id);

    // The `particularId` is already decoded by the page-level route handler.
    // Avoid calling `decodeURIComponent` here which can throw on malformed inputs.
    const encodedParticularId = encodeURIComponent(particularId);
    const targetUrl = `/dashboard/project/${year}/${encodedParticularId}/${projectSlug}`;

    router.push(targetUrl);
  };

  const handleContextMenu = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entity: project });
  };

  const handleBulkTrash = async () => {
    try {
      const toastId = toast.loading(`Moving ${selectedIds.size} project(s) to trash...`);

      const result = await bulkMoveToTrash({
        ids: Array.from(selectedIds) as Id<"projects">[]
      });

      toast.dismiss(toastId);
      toast.success(`Successfully moved ${selectedIds.size} project(s) to trash`);

      const failed = (result as any)?.failed || 0;
      if (failed > 0) {
        toast.info(`Note: ${failed} project(s) failed to move`);
      }

      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to move projects to trash");
      console.error(error);
    }
  };

  const handleBulkCategoryChange = (categoryId: Id<"projectCategories"> | undefined) => {
    if (!categoryId) return;
    setPendingBulkCategoryId(categoryId);
    setShowBulkCategoryConfirmModal(true);
  };

  const confirmBulkCategoryUpdate = async () => {
    if (!pendingBulkCategoryId) return;

    try {
      const toastId = toast.loading(`Updating ${selectedIds.size} project(s)...`);

      await bulkUpdateCategory({
        ids: Array.from(selectedIds) as Id<"projects">[],
        categoryId: pendingBulkCategoryId
      });

      toast.dismiss(toastId);
      toast.success(`Successfully updated ${selectedIds.size} project(s)`);

      setSelectedIds(new Set());
      setPendingBulkCategoryId(undefined);
      setShowBulkCategoryConfirmModal(false);
    } catch (error) {
      toast.error("Failed to update categories");
      setShowBulkCategoryConfirmModal(false);
      console.error(error);
    }
  };

  const handleToggleAutoCalculate = async (newValue: boolean) => {
    if (!contextMenu) return;

    setIsTogglingAutoCalculate(true);

    try {
      const toastId = toast.loading("Updating auto-calculate mode...");

      await toggleAutoCalculate({
        id: contextMenu.entity.id as Id<"projects">,
        autoCalculate: newValue,
      });

      toast.dismiss(toastId);
      toast.success(`Switched to ${newValue ? 'auto-calculate' : 'manual'} mode`, {
        description: newValue
          ? "Budget utilized will be calculated from breakdowns"
          : "You can now enter budget utilized manually"
      });
    } catch (error) {
      console.error("Error toggling auto-calculate:", error);
      toast.error("Failed to toggle auto-calculate", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsTogglingAutoCalculate(false);
    }
  };

  const handleOpenBulkToggleDialog = () => {
    if (selectedIds.size === 0) {
      toast.error("No items selected");
      return;
    }
    setShowBulkToggleDialog(true);
  };

  const handleBulkToggleAutoCalculate = async (autoCalculate: boolean, reason?: string) => {
    setIsBulkToggling(true);

    try {
      const result = await bulkToggleAutoCalculate({
        ids: Array.from(selectedIds) as Id<"projects">[],
        autoCalculate,
        reason,
      });

      const count = (result as any).count || selectedIds.size;

      toast.success(`Updated ${count} project(s)`, {
        description: `All items switched to ${autoCalculate ? 'auto-calculate' : 'manual'} mode`
      });

      setSelectedIds(new Set());
      setShowBulkToggleDialog(false);
    } catch (error) {
      console.error("Error bulk toggling auto-calculate:", error);
      toast.error("Failed to update items", {
        description: error instanceof Error ? error.message : "Some items could not be updated"
      });
    } finally {
      setIsBulkToggling(false);
    }
  };

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (selectedIds.size > 0) {
      e.target.blur();
      setShowSearchWarningModal(true);
    }
  };

  const handleConfirmSearchClear = () => {
    setSelectedIds(new Set());
    setShowSearchWarningModal(false);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  };

  const handleToggleColumn = (columnId: string, isChecked: boolean) => {
    const newHidden = new Set(hiddenColumns);
    if (isChecked) {
      newHidden.delete(columnId);
    } else {
      newHidden.add(columnId);
    }
    setHiddenColumns(newHidden);
  };

  const handleHideAllColumns = () => {
    setShowHideAllWarning(true);
  };

  const confirmHideAll = () => {
    const allColIds = AVAILABLE_COLUMNS.map(c => c.id);
    setHiddenColumns(new Set(allColIds));
    setShowHideAllWarning(false);
  };

  const handleShowAllColumns = () => {
    setHiddenColumns(new Set());
  };

  const handleOpenPrintPreview = () => {
    setShowPrintPreview(true);
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(
        filteredAndSortedProjects,
        createProjectExportConfig(AVAILABLE_COLUMNS, hiddenColumns)
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  };

  const handleContextChangeCategory = () => {
    if (!contextMenu) return;
    setSelectedCategoryProject(contextMenu.entity);
    setSingleCategoryId(contextMenu.entity.categoryId as Id<"projectCategories"> | undefined);
    setShowSingleCategoryModal(true);
  };

  const saveSingleCategoryChange = async () => {
    if (!selectedCategoryProject) return;

    try {
      const toastId = toast.loading("Updating category...");

      await updateProject({
        id: selectedCategoryProject.id as Id<"projects">,
        categoryId: singleCategoryId,
        particulars: selectedCategoryProject.particulars,
        implementingOffice: selectedCategoryProject.implementingOffice,
        totalBudgetAllocated: selectedCategoryProject.totalBudgetAllocated,
        totalBudgetUtilized: selectedCategoryProject.totalBudgetUtilized,
        budgetItemId: selectedCategoryProject.budgetItemId as Id<"budgetItems">,
        remarks: selectedCategoryProject.remarks,
        year: selectedCategoryProject.year,
        projectManagerId: selectedCategoryProject.projectManagerId as Id<"users">,
        reason: "Category updated via context menu"
      });

      toast.dismiss(toastId);
      toast.success("Category updated successfully");

      setShowSingleCategoryModal(false);
      setSelectedCategoryProject(null);
    } catch (error) {
      toast.error("Failed to update category");
      console.error(error);
    }
  };

  const handlePinProject = async () => {
    if (!contextMenu) return;

    try {
      await togglePinProject({ id: contextMenu.entity.id as Id<"projects"> });
    } catch (error) {
      toast.error("Failed to toggle pin");
    }
  };

  const handleViewLog = () => {
    if (!contextMenu) return;
    setSelectedLogProject(contextMenu.entity);
    setLogSheetOpen(true);
  };

  const handleEditProject = () => {
    if (!contextMenu) return;
    setSelectedProject(contextMenu.entity);
    setShowEditModal(true);
  };

  const handleDeleteProject = () => {
    if (!contextMenu) return;
    setSelectedProject(contextMenu.entity);
    setShowDeleteModal(true);
  };

  const handleToggleRemarks = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedRemarks);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedRemarks(newExpanded);
  };

  return (
    <>
      <div className="print-area bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-visible transition-all duration-300 shadow-sm">

        {/* Toolbar */}
        <ProjectsTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchFocus={handleSearchFocus}
          searchInputRef={searchInputRef}
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          canManageBulkActions={canManageBulkActions}
          onBulkCategoryChange={handleBulkCategoryChange}
          hiddenColumns={hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onShowAllColumns={handleShowAllColumns}
          onHideAllColumns={handleHideAllColumns}
          onExportCSV={handleExportCSV}
          onOpenPrintPreview={handleOpenPrintPreview}
          onOpenTrash={onOpenTrash}
          onBulkTrash={handleBulkTrash}
          isAdmin={canManageBulkActions}
          pendingRequestsCount={pendingParticularRequests}
          onOpenShare={() => setShowShareModal(true)}
          onBulkToggleAutoCalculate={handleOpenBulkToggleDialog}
          onAddProject={onAdd ? () => setShowAddModal(true) : undefined}
          expandButton={expandButton}
          accentColor={accentColorValue}
        />

        {/* 🆕 Category Filter - YouTube Style */}
        <ProjectCategoryFilter
          categories={categoriesForFilter}
          selectedCategoryIds={categoryFilter}
          onSelectionChange={handleCategoryFilterChange}
          accentColor={accentColorValue}
        />

        {/* Table */}
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full">

            {/* Header */}
            <ProjectsTableHeader
              hiddenColumns={hiddenColumns}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              canManageBulkActions={canManageBulkActions}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              onSelectAll={handleSelectAll}
              onFilterClick={setActiveFilterColumn}
              activeFilterColumn={activeFilterColumn}
            />

            {/* Body */}
            <ProjectsTableBody
              groupedProjects={groupedProjects}
              hiddenColumns={hiddenColumns}
              selectedIds={selectedIds}
              newlyAddedProjectId={newlyAddedProjectId}
              canManageBulkActions={canManageBulkActions}
              totalVisibleColumns={totalVisibleColumns}
              onSelectCategory={handleSelectCategory}
              onSelectRow={handleSelectRow}
              onRowClick={handleRowClick}
              onContextMenu={handleContextMenu}
              accentColor={accentColorValue}
              expandedRemarks={expandedRemarks}
              onToggleRemarks={handleToggleRemarks}
            />

            {/* Footer */}
            <tfoot>
              <ProjectsTableFooter
                totals={totals}
                hiddenColumns={hiddenColumns}
                canManageBulkActions={canManageBulkActions}
                accentColor={accentColorValue}
              />
            </tfoot>

          </table>
        </div>
      </div>

      {/* Context Menu */}
      <ProjectContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onPin={handlePinProject}
        onViewLog={handleViewLog}
        onChangeCategory={handleContextChangeCategory}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        canEdit={!!onEdit}
        canDelete={!!onDelete}
        onToggleAutoCalculate={handleToggleAutoCalculate}
        isTogglingAutoCalculate={isTogglingAutoCalculate}
      />

      {/* Bulk Auto-Calculate Toggle Dialog */}
      <ProjectBulkToggleDialog
        isOpen={showBulkToggleDialog}
        onClose={() => setShowBulkToggleDialog(false)}
        onConfirm={handleBulkToggleAutoCalculate}
        selectedCount={selectedIds.size}
        isLoading={isBulkToggling}
      />

      {/* Activity Log Sheet */}
      {selectedLogProject && (
        <ActivityLogSheet
          type="project"
          entityId={selectedLogProject.id}
          title={`Project History: ${selectedLogProject.particulars}`}
          isOpen={logSheetOpen}
          onOpenChange={(open) => {
            setLogSheetOpen(open);
            if (!open) setSelectedLogProject(null);
          }}
        />
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Project"
          size="xl"
        >
          <ProjectForm
            budgetItemId={budgetItemId}
            budgetItemYear={budgetItemYear}
            onSave={(data) => {
              if (onAdd) onAdd(data);
              setShowAddModal(false);
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          title="Edit Project"
          size="xl"
        >
          <ProjectForm
            project={selectedProject}
            budgetItemId={budgetItemId}
            onSave={(data) => {
              if (onEdit) onEdit(selectedProject.id, data);
              setShowEditModal(false);
              setSelectedProject(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedProject(null);
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          onConfirm={() => {
            if (onDelete) onDelete(selectedProject.id);
            setSelectedProject(null);
          }}
          title="Move to Trash"
          message={`Are you sure you want to move "${selectedProject.particulars}" to trash? Associated breakdowns will also be moved.`}
          confirmText="Move to Trash"
          variant="danger"
        />
      )}

      {/* Bulk Category Confirmation Modal */}
      {showBulkCategoryConfirmModal && pendingBulkCategoryId && (
        <ConfirmationModal
          isOpen={showBulkCategoryConfirmModal}
          onClose={() => {
            setShowBulkCategoryConfirmModal(false);
            setPendingBulkCategoryId(undefined);
          }}
          onConfirm={confirmBulkCategoryUpdate}
          title="Confirm Bulk Category Update"
          message={`Are you sure you want to move ${selectedIds.size} selected projects to this category? This will update their classification.`}
          confirmText="Yes, Update Projects"
          variant="default"
        />
      )}

      {/* Single Category Change Modal */}
      {showSingleCategoryModal && selectedCategoryProject && (
        <Modal
          isOpen={showSingleCategoryModal}
          onClose={() => {
            setShowSingleCategoryModal(false);
            setSelectedCategoryProject(null);
          }}
          title="Move Project to Category"
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-medium">{selectedCategoryProject.particulars}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Current Category:{" "}
                {selectedCategoryProject.categoryId
                  ? allCategories?.find((c) => c._id === selectedCategoryProject.categoryId)
                    ?.fullName
                  : "Uncategorized"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Select New Category
              </label>
              <ProjectCategoryCombobox
                value={singleCategoryId}
                onChange={(val) => setSingleCategoryId(val)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowSingleCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSingleCategoryChange}
                style={{ backgroundColor: accentColorValue }}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Update Category
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Search Warning Modal */}
      <ConfirmationModal
        isOpen={showSearchWarningModal}
        onClose={() => setShowSearchWarningModal(false)}
        onConfirm={handleConfirmSearchClear}
        title="Clear Selection?"
        message={`${selectedIds.size} ${selectedIds.size === 1 ? "item" : "items"
          } will be unselected. Do you want to proceed?`}
        confirmText="Proceed"
        variant="default"
      />

      {/* Hide All Columns Warning */}
      <ConfirmationModal
        isOpen={showHideAllWarning}
        onClose={() => setShowHideAllWarning(false)}
        onConfirm={confirmHideAll}
        title="Hide All Columns?"
        message="Are you sure you want to hide all columns? The table will display no data."
        confirmText="Hide All"
        variant="default"
      />

      {/* Share Modal */}
      {showShareModal && (
        <ProjectShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          particularCode={particularId}
          particularFullName={getParticularFullName(particularId)}
        />
      )}

      {/* Print Preview Modal with Category Support */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        budgetItems={printData.flatItems as any}
        totals={printTotals}
        columns={printColumns}
        hiddenColumns={hiddenColumns}
        filterState={{
          searchQuery,
          statusFilter,
          yearFilter: [],
          sortField: sortField as string | null,
          sortDirection: sortDirection as string | null,
        }}
        year={budgetItemYear || new Date().getFullYear()}
        particular={getParticularFullName(particularId)}
        rowMarkers={printData.rowMarkers}
      />
    </>
  );
}