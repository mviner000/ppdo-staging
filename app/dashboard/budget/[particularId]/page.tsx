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
    "20% DF": "20% Development Fund",
  };
  return mapping[particular] || particular;
};

export default function ParticularProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const { accentColorValue } = useAccentColor();
  const particular = decodeURIComponent(params.particularId as string);
  
  // Get budget item by particular name using the existing function name
  const budgetItems = useQuery(api.budgetItems.list);
  const budgetItem = budgetItems?.find(item => item.particulars === particular);
  
  // Get all departments for the dropdown
  const departments = useQuery(api.departments.list, { includeInactive: false });
  
  // Get projects for this budget item
  const projects = useQuery(
    api.projects.getProjectsByBudgetItem,
    budgetItem ? { budgetItemId: budgetItem._id } : "skip"
  );

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);

  const particularFullName = getParticularFullName(particular);

  const handleAddProject = async (projectData: any) => {
    try {
      // Find the department by name (implementing office)
      const department = departments?.find(
        d => d.name === projectData.implementingOffice || d.code === projectData.implementingOffice
      );
      
      if (!department) {
        alert("Please select a valid department/implementing office.");
        return;
      }

      // Convert date strings to timestamps
      const dateStarted = new Date(projectData.dateStarted).getTime();
      const completionDate = projectData.completionDate 
        ? new Date(projectData.completionDate).getTime() 
        : undefined;
      const expectedCompletionDate = projectData.expectedCompletionDate
        ? new Date(projectData.expectedCompletionDate).getTime()
        : undefined;

      await createProject({
        projectName: projectData.projectName,
        departmentId: department._id as Id<"departments">,
        allocatedBudget: projectData.allocatedBudget,
        revisedBudget: projectData.revisedBudget || undefined,
        totalBudgetUtilized: projectData.totalBudgetUtilized || 0,
        dateStarted,
        completionDate,
        expectedCompletionDate,
        projectAccomplishment: projectData.projectAccomplishment || 0,
        status: projectData.status || "on_track",
        remarks: projectData.remarks || undefined,
        budgetItemId: budgetItem?._id,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const handleEditProject = async (id: string, projectData: any) => {
    try {
      // Find the department by name (implementing office)
      const department = departments?.find(
        d => d.name === projectData.implementingOffice || d.code === projectData.implementingOffice
      );
      
      if (!department) {
        alert("Please select a valid department/implementing office.");
        return;
      }

      // Convert date strings to timestamps
      const dateStarted = new Date(projectData.dateStarted).getTime();
      const completionDate = projectData.completionDate 
        ? new Date(projectData.completionDate).getTime() 
        : undefined;
      const expectedCompletionDate = projectData.expectedCompletionDate
        ? new Date(projectData.expectedCompletionDate).getTime()
        : undefined;

      await updateProject({
        id: id as Id<"projects">,
        projectName: projectData.projectName,
        departmentId: department._id as Id<"departments">,
        allocatedBudget: projectData.allocatedBudget,
        revisedBudget: projectData.revisedBudget || undefined,
        totalBudgetUtilized: projectData.totalBudgetUtilized || 0,
        dateStarted,
        completionDate,
        expectedCompletionDate,
        projectAccomplishment: projectData.projectAccomplishment || 0,
        status: projectData.status || "on_track",
        remarks: projectData.remarks || undefined,
        budgetItemId: budgetItem?._id,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject({ id: id as Id<"projects"> });
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  // Transform Convex projects to match component interface
  const transformedProjects = projects?.map(project => ({
    id: project._id,
    projectName: project.projectName,
    implementingOffice: project.departmentName || project.departmentCode || "Unknown",
    allocatedBudget: project.allocatedBudget,
    revisedBudget: project.revisedBudget ?? project.allocatedBudget,
    totalBudgetUtilized: project.totalBudgetUtilized,
    utilizationRate: project.utilizationRate,
    balance: project.balance,
    dateStarted: new Date(project.dateStarted).toISOString().split('T')[0],
    completionDate: project.completionDate 
      ? new Date(project.completionDate).toISOString().split('T')[0] 
      : "",
    expectedCompletionDate: project.expectedCompletionDate
      ? new Date(project.expectedCompletionDate).toISOString().split('T')[0]
      : "",
    projectAccomplishment: project.projectAccomplishment,
    status: project.status,
    remarks: project.remarks ?? "",
  })) ?? [];

  // Calculate summary statistics
  const totalAllocatedBudget = transformedProjects.reduce(
    (sum, project) => sum + project.allocatedBudget,
    0
  );
  const totalRevisedBudget = transformedProjects.reduce(
    (sum, project) => sum + project.revisedBudget,
    0
  );
  const avgUtilizationRate = transformedProjects.length > 0
    ? transformedProjects.reduce((sum, project) => sum + project.utilizationRate, 0) / transformedProjects.length
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

        <h1
          className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          {particularFullName}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Detailed project tracking and budget utilization
        </p>
      </div>

      {/* Summary Cards */}
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
            Total Revised Budget
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalRevisedBudget)}
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

      {/* Projects Table */}
      <div className="mb-6">
        {projects === undefined || departments === undefined ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading projects...</p>
          </div>
        ) : (
          <ProjectsTable
            projects={transformedProjects}
            particularId={particular}
            onAdd={handleAddProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        )}
      </div>
    </>
  );
}