// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/ProjectOverviewCards.tsx

"use client";

import { getStatusColor } from "../utils/page-helpers";
import { formatCurrency } from "@/lib/shared/utils/form-helpers";

interface ProjectOverviewCardsProps {
  project: any;
}

export function ProjectOverviewCards({ project }: ProjectOverviewCardsProps) {
  if (!project) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6 no-print animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card title="Implementing Office" value={project.implementingOffice || "N/A"} />
      <Card title="Current Budget" value={formatCurrency(project.totalBudgetAllocated)} />
      <Card 
        title="Breakdown Counts" 
        value={`${project.projectCompleted}C • ${project.projectDelayed}D • ${project.projectsOnTrack}O`} 
      />
      <Card 
        title="Project Status" 
        value={project.status?.toUpperCase() || "ONGOING"} 
        valueClassName={getStatusColor(project.status)}
      />
      {project.year && <Card title="Year" value={project.year} />}
      {project.remarks && <Card title="Remarks" value={project.remarks} truncate />}
    </div>
  );
}

function Card({ title, value, valueClassName, truncate }: { title: string, value: string | number, valueClassName?: string, truncate?: boolean }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">{title}</p>
      <p className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 ${valueClassName || ""} ${truncate ? "truncate" : ""}`}>
        {value}
      </p>
    </div>
  );
}