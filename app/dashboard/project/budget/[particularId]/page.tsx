"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectsTable } from "./components/ProjectsTable";
import { ParticularPageHeader } from "./components/ParticularPageHeader";
import { StatusInfoCard } from "./components/StatusInfoCard";
import { ProjectSummaryStats } from "./components/ProjectSummaryStats";
import { ProjectLoadingState } from "./components/ProjectLoadingState";
import { TrashBinModal } from "../../../../../components/TrashBinModal";
import { useParticularData } from "./components/useParticularData";
import { useProjectMutations } from "./components/useProjectMutations";
import { getParticularFullName, calculateProjectStats } from "./utils";

export default function ParticularProjectsPage() {
  const params = useParams();
  const particular = decodeURIComponent(params.particularId as string);

  const [showDetails, setShowDetails] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showBudgetDetails");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showBudgetDetails", JSON.stringify(showDetails));
    }
  }, [showDetails]);

  const [showTrashModal, setShowTrashModal] = useState(false);
  const [newlyAddedProjectId, setNewlyAddedProjectId] = useState<string | null>(null);

  const { budgetItem, breakdownStats, projects, isLoading } = useParticularData(particular);
  const { handleAddProject, handleEditProject, handleDeleteProject, handleRecalculate } =
    useProjectMutations(budgetItem?._id);

  // Wrapper for handleAddProject to track newly added project
  const handleAddProjectWithTracking = async (projectData: any) => {
    const projectId = await handleAddProject(projectData);
    if (projectId) {
      setNewlyAddedProjectId(projectId);
      // Clear the highlight after 3 seconds
      setTimeout(() => setNewlyAddedProjectId(null), 3000);
    }
  };

  const particularFullName = getParticularFullName(particular);
  const stats = calculateProjectStats(projects);

  return (
    <>
      <ParticularPageHeader
        particularFullName={particularFullName}
        budgetItemId={budgetItem?._id}
        budgetItemParticulars={budgetItem?.particulars}
        budgetItemStatus={budgetItem?.status}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        onRecalculate={handleRecalculate}
      />

      {showDetails && budgetItem && (
        <StatusInfoCard
          budgetStatus={budgetItem.status}
          totalProjects={projects.length}
          projectCompleted={budgetItem.projectCompleted}
          projectDelayed={budgetItem.projectDelayed}
          projectsOnTrack={budgetItem.projectsOnTrack}
          totalBreakdowns={breakdownStats?.totalBreakdowns || 0}
        />
      )}

      {showDetails && (
        <ProjectSummaryStats
          totalAllocated={stats.totalAllocated}
          totalUtilized={stats.totalUtilized}
          avgUtilizationRate={stats.avgUtilizationRate}
          totalProjects={projects.length}
        />
      )}

      <div className="mb-6">
        {isLoading ? (
          <ProjectLoadingState />
        ) : (
          <ProjectsTable
            projects={projects}
            particularId={particular}
            budgetItemId={budgetItem!._id}
            budgetItemYear={budgetItem?.year}
            onAdd={handleAddProjectWithTracking}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onOpenTrash={() => setShowTrashModal(true)}
            newlyAddedProjectId={newlyAddedProjectId}
          />
        )}
      </div>

      <TrashBinModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        type="project"
      />
    </>
  );
}
