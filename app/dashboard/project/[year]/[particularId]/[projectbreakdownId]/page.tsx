// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";

// API & Models
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Contexts
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

// Centralized Breakdown Components
import {
  BreakdownHeader,
  EntityOverviewCards,
  BreakdownStatsAccordion,
  BreakdownHistoryTable,
  BreakdownForm,
  Breakdown,
} from "@/components/ppdo/breakdown";

// Local Components (Project-specific)
import { StatusChainCard } from "./components/StatusChainCard";

// Shared Components
import { TrashBinModal } from "@/components/TrashBinModal";
import { Modal } from "@/app/dashboard/project/[year]/components/BudgetModal";
import { ConfirmationModal } from "@/app/dashboard/project/[year]/components/BudgetConfirmationModal";

// Shared Hooks
import { useEntityStats, useEntityMetadata } from "@/lib/hooks/useEntityStats";

// Utils
import { extractProjectId, getParticularFullName, getStatusColor, extractCleanName } from "./utils/page-helpers";

export default function ProjectBreakdownPage() {
  const params = useParams();
  const { setCustomBreadcrumbs } = useBreadcrumb();

  // Extract Params
  const year = params.year as string;
  const particularId = decodeURIComponent(params.particularId as string);
  const slugWithId = params.projectbreakdownId as string;
  const projectId = extractProjectId(slugWithId);

  // Local State
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Queries
  const project = useQuery(
    api.projects.get,
    projectId ? { id: projectId as Id<"projects"> } : "skip"
  );

  const parentBudgetItem = useQuery(
    api.budgetItems.get,
    project?.budgetItemId ? { id: project.budgetItemId } : "skip"
  );

  const breakdownHistory = useQuery(
    api.govtProjects.getProjectBreakdowns,
    project ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const departments = useQuery(api.departments.list, { includeInactive: false });

  // Hooks - Using shared hooks for statistics
  const stats = useEntityStats(breakdownHistory as Breakdown[] | undefined);
  const metadata = useEntityMetadata(breakdownHistory as Breakdown[] | undefined);
  const particularFullName = getParticularFullName(particularId);

  // Effects
  useEffect(() => {
    if (project) {
      const cleanProjectName = extractCleanName(slugWithId);
      setCustomBreadcrumbs([
        { label: "Home", href: "/dashboard" },
        { label: "Project", href: "/dashboard/project" },
        { label: `${year}`, href: `/dashboard/project/${year}` },
        { label: particularFullName, href: `/dashboard/project/${year}/${encodeURIComponent(particularId)}` },
        { label: cleanProjectName },
      ]);
    }
    return () => setCustomBreadcrumbs(null);
  }, [project, particularFullName, particularId, year, slugWithId, setCustomBreadcrumbs]);

  // Mutations
  const createBreakdown = useMutation(api.govtProjects.createProjectBreakdown);
  const updateBreakdown = useMutation(api.govtProjects.updateProjectBreakdown);
  const deleteBreakdown = useMutation(api.govtProjects.moveToTrash);
  const recalculateProject = useMutation(api.govtProjects.recalculateProject);

  // Handlers
  const handleRecalculate = async () => {
    if (!project) return;
    setIsRecalculating(true);
    try {
      const result = await recalculateProject({ projectId: projectId as Id<"projects"> });
      toast.success("Status recalculated successfully!", {
        description: `Project status: ${result.status}, Breakdowns: ${result.breakdownsCount}`,
      });
    } catch (error) {
      console.error("Recalculation error:", error);
      toast.error("Failed to recalculate status");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handlePrint = () => window.print();

  const handleAdd = async (breakdownData: Omit<Breakdown, "_id">) => {
    try {
      if (!project) {
        toast.error("Project not found");
        return;
      }
      await createBreakdown({
        ...breakdownData,
        projectId: projectId as Id<"projects">,
        reportDate: breakdownData.reportDate || Date.now(),
        reason: "Created via dashboard form",
      } as any); // Cast to any to satisfy specific Convex args if types slightly mismatch

      toast.success("Breakdown record created successfully!");
      setShowAddModal(false);
    } catch (error: any) {
      toast.error("Failed to create breakdown record", { description: error.message });
    }
  };

  const handleUpdate = async (breakdownData: Omit<Breakdown, "_id">) => {
    try {
      if (!selectedBreakdown) {
        toast.error("No breakdown selected");
        return;
      }
      // Remove client-only / audit fields not accepted by the server validator
      // (e.g. `batchId` is present on records created by bulk imports)
      const { batchId, ...validData } = breakdownData as any;

      await updateBreakdown({
        breakdownId: selectedBreakdown._id as Id<"govtProjectBreakdowns">,
        ...validData,
        projectId: projectId as Id<"projects">,
        reason: "Updated via dashboard edit form",
      } as any);

      toast.success("Breakdown record updated successfully!");
      setShowEditModal(false);
      setSelectedBreakdown(null);
    } catch (error: any) {
      toast.error("Failed to update breakdown record", { description: error.message });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedBreakdown) return;
      await deleteBreakdown({
        breakdownId: selectedBreakdown._id as Id<"govtProjectBreakdowns">,
        reason: "Moved to trash via dashboard confirmation",
      });
      toast.success("Breakdown record moved to trash!");
      setShowDeleteModal(false);
      setSelectedBreakdown(null);
    } catch (error) {
      toast.error("Failed to move breakdown record to trash");
    }
  };

  const handleEdit = (breakdown: Breakdown) => {
    setSelectedBreakdown(breakdown);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    const breakdown = breakdownHistory?.find((b) => b._id === id);
    if (breakdown) {
      setSelectedBreakdown(breakdown);
      setShowDeleteModal(true);
    }
  };

  return (
    <>
      {/* Shared Header Component with recalculate button for Projects */}
      <BreakdownHeader
        backUrl={`/dashboard/project/${year}/${encodeURIComponent(particularId)}`}
        backLabel="Back to Projects"
        entityName={project?.particulars}
        entityType="project"
        implementingOffice={project?.implementingOffice}
        year={year}
        subtitle={`Historical breakdown and progress tracking for ${year}`}
        showHeader={showHeader}
        setShowHeader={setShowHeader}
        showRecalculateButton={true}
        isRecalculating={isRecalculating}
        onRecalculate={handleRecalculate}
        showActivityLog={true}
      />

      {showHeader && project && parentBudgetItem && (
        <StatusChainCard
          breakdownCount={breakdownHistory?.length || 0}
          stats={stats}
          projectStatus={project.status}
          parentStatus={parentBudgetItem.status}
        />
      )}

      {/* Shared Entity Overview Cards */}
      {showHeader && project && (
        <EntityOverviewCards
          entityType="project"
          implementingOffice={project.implementingOffice}
          totalBudget={project.totalBudgetAllocated}
          statusText={project.status}
          statusColor={getStatusColor(project.status)}
          year={year}
          remarks={project.remarks}
          breakdownCounts={
            stats
              ? {
                completed: stats.statusCounts.completed,
                delayed: stats.statusCounts.delayed,
                ongoing: stats.statusCounts.ongoing,
              }
              : undefined
          }
        />
      )}

      {/* Shared Statistics Accordion */}
      {showHeader && stats && (
        <BreakdownStatsAccordion
          stats={stats}
          entityType="project"
          uniqueOffices={metadata.uniqueOffices}
          uniqueLocations={metadata.uniqueLocations}
          getStatusColor={getStatusColor}
        />
      )}

      <div className="mb-6">
        {breakdownHistory === undefined ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading breakdown history...</p>
          </div>
        ) : (
          <BreakdownHistoryTable
            breakdowns={breakdownHistory as Breakdown[]}
            onPrint={handlePrint}
            onAdd={() => setShowAddModal(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenTrash={() => setShowTrashModal(true)}
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && project && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Breakdown Record" size="xl">
          <BreakdownForm
            defaultProjectName={project.particulars}
            defaultImplementingOffice={project.implementingOffice}
            projectId={projectId}
            onSave={handleAdd}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {showEditModal && selectedBreakdown && (
        <Modal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedBreakdown(null); }}
          title="Edit Breakdown Record"
          size="xl"
        >
          <BreakdownForm
            breakdown={selectedBreakdown}
            projectId={projectId}
            onSave={handleUpdate}
            onCancel={() => { setShowEditModal(false); setSelectedBreakdown(null); }}
          />
        </Modal>
      )}

      {showDeleteModal && selectedBreakdown && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedBreakdown(null); }}
          onConfirm={handleConfirmDelete}
          title="Move to Trash"
          message={`Are you sure you want to move this breakdown record for ${selectedBreakdown.implementingOffice} to trash?`}
          confirmText="Move to Trash"
          variant="danger"
        />
      )}

      <TrashBinModal isOpen={showTrashModal} onClose={() => setShowTrashModal(false)} type="breakdown" />
    </>
  );
}