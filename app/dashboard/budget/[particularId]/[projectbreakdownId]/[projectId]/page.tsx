// app/dashboard/budget/[particularId]/[projectId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FinancialBreakdownCard } from "./components/FinancialBreakdownCard";
import { FinancialBreakdownTabs } from "./components/FinancialBreakdownTabs";
import { ChevronLeft } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Get the raw string from params
  const projectIdParam = params.projectId as string;
  const particularIdParam = params.particularId as string;

  // Validate and cast to Id<"projects">
  // This is safe because Convex IDs are just strings with a specific format
  const projectId = projectIdParam as Id<"projects">;

  // Fetch project data
  const project = useQuery(api.projects.get, { id: projectId });

  // Helper function to navigate back correctly
  const handleBack = () => {
    // Navigate back to the particular budget page
    router.push(`/dashboard/budget/${particularIdParam}`);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="lg:col-span-3 h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Budget Overview</span>
        </button>

        {/* Header */}
        <div className="space-y-2">
          <h1
            className="text-4xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {project.projectName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed project tracking and budget utilization
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Card - Financial Stats */}
          <div className="lg:col-span-1">
            <FinancialBreakdownCard projectId={projectId} />
          </div>

          {/* Right Side - Tabs (Overview, Analytics, etc.) */}
          <div className="lg:col-span-3">
            <FinancialBreakdownTabs projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}