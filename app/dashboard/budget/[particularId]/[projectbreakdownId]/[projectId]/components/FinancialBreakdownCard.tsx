// app/dashboard/budget/[particularId]/[projectId]/components/FinancialBreakdownCard.tsx

"use client";

import { useState } from "react";
import { TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface FinancialBreakdownCardProps {
  projectId: Id<"projects">;
}

export function FinancialBreakdownCard({ projectId }: FinancialBreakdownCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch project data from backend
  const project = useQuery(api.projects.get, { id: projectId });

  if (!project) {
    return (
      <Card className="group relative overflow-hidden border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="space-y-4 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // UPDATED: Use new field names from schema
  const appropriation = project.totalBudgetAllocated;
  const obligation = project.totalBudgetUtilized;
  
  // UPDATED: Calculate balance (allocated - utilized)
  const balance = project.totalBudgetAllocated - project.totalBudgetUtilized;
  
  const description = project.projectName;

  // Get utilization rate from project (already calculated)
  const utilizationRate = project.utilizationRate.toFixed(2);
  
  // Calculate percentages
  const obligatedPercentage = ((obligation / appropriation) * 100).toFixed(1);
  const remainingPercentage = ((balance / appropriation) * 100).toFixed(1);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm bg-white dark:bg-gray-900">
      <CardContent className="space-y-4 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {description}
        </p>

        {/* Financial Details */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Appropriation
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₱{appropriation.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Obligation
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₱{obligation.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Balance
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₱{balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Utilization Rate
            </p>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {utilizationRate}%
              </p>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(Number(utilizationRate), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Obligated: {obligatedPercentage}%</span>
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>Remaining: {remainingPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}