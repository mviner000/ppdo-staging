// app/dashboard/budget/[particularId]/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ProjectsTable } from "./components/ProjectsTable";
import { useAccentColor } from "../../contexts/AccentColorContext";
import { toast } from "sonner";
import { getStatusDisplayText, getStatusColorClass, ApiResponse } from "../types"; // Import generic type
import { ActivityLogSheet } from "../../components/ActivityLogSheet";
import { Button } from "@/components/ui/button";
import { History, RefreshCw, Eye, EyeOff } from "lucide-react";
import { TrashBinModal } from "../../components/TrashBinModal";

// Helper function to get full name from particular ID
const getParticularFullName = (particular: string): string => {
  const mapping: { [key: string]: string } = {
    GAD: "Gender and Development (GAD)",
    LDRRMP: "Local Disaster Risk Reduction and Management Plan",
    LCCAP: "Local Climate Change Action Plan",
    LCPC: "Local Council for the Protection of Children",
    SCPD: "Sectoral Committee for Persons with Disabilities",
    POPS: "Provincial Operations",
    CAIDS: "Community Affairs and Information Development Services",
    LNP: "Local Nutrition Program",
    PID: "Provincial Information Department",
    ACDP: "Agricultural Competitiveness Development Program",
    LYDP: "Local Youth Development Program",
    "20%_DF": "20% Development Fund",
  };
  return mapping[particular] || particular;
};

export default function ParticularProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const { accentColorValue } = useAccentColor();
  const particular = decodeURIComponent(params.particularId as string);
  
  // State for showing/hiding details - Load from localStorage
  const [showDetails, setShowDetails] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showBudgetDetails");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Save to localStorage whenever showDetails changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showBudgetDetails", JSON.stringify(showDetails));
    }
  }, [showDetails]);

  // Get budget item by particular name to get its ID
  const budgetItem = useQuery(api.budgetItems.getByParticulars, {
    particulars: particular,
  });

  // Get breakdown statistics for this budget item
  const breakdownStats = useQuery(api.govtProjects.getBreakdownStats, {
    budgetItemId: budgetItem?._id,
  });

  // Get projects filtered by budgetItemId
  const projects = useQuery(
    api.projects.list,
    budgetItem ? { budgetItemId: budgetItem._id } : "skip"
  );

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.moveToTrash); // Soft delete
  
  const [showTrashModal, setShowTrashModal] = useState(false);
  const recalculateBudgetItem = useMutation(api.budgetItems.recalculateSingleBudgetItem);

  const particularFullName = getParticularFullName(particular);

  // Transform Convex projects to match component interface
  const transformedProjects =
    projects?.map((project) => ({
      id: project._id,
      particulars: project.particulars,
      implementingOffice: project.implementingOffice,
      totalBudgetAllocated: project.totalBudgetAllocated,
      obligatedBudget: project.obligatedBudget,
      totalBudgetUtilized: project.totalBudgetUtilized,
      utilizationRate: project.utilizationRate,
      projectCompleted: project.projectCompleted,
      projectDelayed: project.projectDelayed,
      projectsOngoing: project.projectsOnTrack,
      remarks: project.remarks ?? "",
      year: project.year,
      status: project.status,
      targetDateCompletion: project.targetDateCompletion,
      isPinned: project.isPinned,
      pinnedAt: project.pinnedAt,
      pinnedBy: project.pinnedBy,
      budgetItemId: project.budgetItemId,
      categoryId: project.categoryId,
    })) ?? [];

  // ✅ UPDATED: Handle Standardized Response for Create
  const handleAddProject = async (projectData: any) => {
    if (!budgetItem) {
      toast.error("Budget item not found. Cannot create project.");
      return;
    }

    try {
      // The mutation now returns ApiResponse<object>
      const response: any = await createProject({
        particulars: projectData.particulars,
        budgetItemId: budgetItem._id,
        categoryId: projectData.categoryId || undefined,
        implementingOffice: projectData.implementingOffice,
        totalBudgetAllocated: projectData.totalBudgetAllocated,
        obligatedBudget: projectData.obligatedBudget || undefined,
        totalBudgetUtilized: projectData.totalBudgetUtilized || 0,
        remarks: projectData.remarks || undefined,
        year: projectData.year || undefined,
        targetDateCompletion: projectData.targetDateCompletion || undefined,
        projectManagerId: projectData.projectManagerId || undefined,
      });

      // Check success flag from backend
      if (response.success) {
        toast.success(response.message || "Project created successfully!", {
          description: `"${projectData.particulars}" has been added.`,
        });
      } else {
        // Handle structured error
        toast.error(response.error?.message || "Failed to create project");
        if (response.error?.code === "VALIDATION_ERROR") {
           console.error("Validation details:", response.error.details);
        }
      }
    } catch (error) {
      console.error("Error creating project:", error);
      // Fallback for unexpected network/system errors
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  // ✅ UPDATED: Handle Standardized Response for Edit
  const handleEditProject = async (id: string, projectData: any) => {
    if (!budgetItem) return;
    try {
      const response: any = await updateProject({
        id: id as Id<"projects">,
        particulars: projectData.particulars,
        budgetItemId: budgetItem._id,
        categoryId: projectData.categoryId || undefined,
        implementingOffice: projectData.implementingOffice,
        totalBudgetAllocated: projectData.totalBudgetAllocated,
        obligatedBudget: projectData.obligatedBudget || undefined,
        totalBudgetUtilized: projectData.totalBudgetUtilized || 0,
        remarks: projectData.remarks || undefined,
        year: projectData.year || undefined,
        targetDateCompletion: projectData.targetDateCompletion || undefined,
        projectManagerId: projectData.projectManagerId || undefined,
        reason: "Updated via dashboard UI" // Explicit logging reason
      });

      if (response.success) {
        toast.success(response.message || "Project updated successfully!");
      } else {
        toast.error(response.error?.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  // ✅ UPDATED: Handle Standardized Response for Delete
  const handleDeleteProject = async (id: string) => {
    try {
      const response: any = await deleteProject({ 
        id: id as Id<"projects">,
        reason: "Moved to trash via project dashboard" 
      });

      if (response.success) {
        toast.success(response.message || "Project moved to trash successfully!");
      } else {
        toast.error(response.error?.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Handle manual recalculation
  const handleRecalculateBudgetItem = async () => {
    if (!budgetItem) return;
    try {
      // Note: Recalculations might return a different structure based on backend code
      // Assuming it returns standard structure or direct object
      const result: any = await recalculateBudgetItem({
        budgetItemId: budgetItem._id,
      });
      
      // If it follows new standard
      if (result.success) {
         toast.success("Budget item recalculated successfully!");
      } else if (result.status) {
         // Fallback if older backend logic returns raw object
         toast.success("Budget item recalculated successfully!", {
            description: `Status: ${result.status}, Projects: ${result.projectsCount}`,
         });
      }
    } catch (error) {
      console.error("Recalculation error:", error);
      toast.error("Failed to recalculate budget item");
    }
  };

  // Calculate summary statistics
  const totalAllocatedBudget = transformedProjects.reduce(
    (sum, project) => sum + project.totalBudgetAllocated,
    0
  );
  const totalUtilizedBudget = transformedProjects.reduce(
    (sum, project) => sum + project.totalBudgetUtilized,
    0
  );
  const avgUtilizationRate =
    transformedProjects.length > 0
      ?
        transformedProjects.reduce(
          (sum, project) => sum + project.utilizationRate,
          0
        ) / transformedProjects.length
      : 0;

  return (
    <>
      {/* Back Button and Page Header */}
      <div className="mb-6 no-print">
        <Link
          href="/dashboard/budget"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Budget Tracking
        </Link>

        <div className="flex items-center justify-between gap-4 mb-1">
          {/* LEFT: PARTICULAR FULL NAME */}
          <h1
            className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {particularFullName}
          </h1>

          {/* RIGHT: ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {/* Show/Hide Details Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Hide Details</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Show Details</span>
                </>
              )}
            </Button>

            {/* Recalculate Button */}
            {budgetItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculateBudgetItem}
                className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Recalculate</span>
              </Button>
            )}

            {/* Activity Log Button */}
            {budgetItem && (
              <ActivityLogSheet
                type="project"
                budgetItemId={budgetItem._id}
                title={`Project Activities: ${budgetItem.particulars}`}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">Project Log</span>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400">
          Detailed project tracking and budget utilization
          {budgetItem?.status && (
            <span className={`ml-2 font-medium ${getStatusColorClass(budgetItem.status)}`}>
              • Status: {getStatusDisplayText(budgetItem.status)}
            </span>
          )}
        </p>
      </div>

      {/* Status Information Card - Conditionally Rendered */}
      {showDetails && budgetItem && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 no-print">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Status Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Budget Status
              </div>
              <div className={`text-2xl font-bold ${getStatusColorClass(budgetItem.status || "ongoing")}`}>
                {budgetItem.status?.toUpperCase() || "ONGOING"}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Auto-calculated from projects
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Total Projects
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {transformedProjects.length}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                {budgetItem.projectCompleted}C • {budgetItem.projectDelayed}D • {budgetItem.projectsOnTrack}O
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Total Breakdowns
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {breakdownStats?.totalBreakdowns || 0}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Across all projects
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Status Rule
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                {budgetItem.projectsOnTrack > 0 
                  ? "Ongoing (has ongoing projects)"
                  : budgetItem.projectDelayed > 0
                  ? "Delayed (has delayed projects)"
                  : "Completed (all projects completed)"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards - Conditionally Rendered */}
      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Total Allocated Budget
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalAllocatedBudget)}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Total Utilized Budget
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalUtilizedBudget)}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Average Utilization Rate
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {avgUtilizationRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Total Projects
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {transformedProjects.length}
            </p>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="mb-6">
        {projects === undefined || budgetItem === undefined ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Loading projects...
            </p>
          </div>
        ) : (
          <ProjectsTable
            projects={transformedProjects}
            particularId={particular}
            budgetItemId={budgetItem._id}
            onAdd={handleAddProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onOpenTrash={() => setShowTrashModal(true)} 
          />
        )}
      </div>

      {/* Trash Modal for Projects */}
      <TrashBinModal 
        isOpen={showTrashModal} 
        onClose={() => setShowTrashModal(false)} 
        type="project" 
      />
    </>
  );
}