// app/dashboard/budget/[particularId]/[projectId]/components/tabs/OverviewContent.tsx

"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StatCard } from "../StatCard";
import { TransactionCard } from "../TransactionCard";

interface OverviewContentProps {
  projectId: Id<"projects">;
}

export const OverviewContent: React.FC<OverviewContentProps> = ({ projectId }) => {
  // Fetch project data
  const project = useQuery(api.projects.get, { id: projectId });
  
  // Fetch recent obligations (last 4)
  const recentObligations = useQuery(api.obligations.getRecentByProject, {
    projectId,
    limit: 4,
  });

  if (!project) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // UPDATED: Use new field names from schema
  const totalAppropriation = project.totalBudgetAllocated;
  const totalObligation = project.totalBudgetUtilized;
  
  // UPDATED: Calculate remaining balance (allocated - utilized)
  const remainingBalance = project.totalBudgetAllocated - project.totalBudgetUtilized;

  // Prepare stats data
  const stats = [
    { label: "Total Appropriation", amount: totalAppropriation },
    { label: "Total Obligation", amount: totalObligation },
    { label: "Remaining Balance", amount: remainingBalance },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Financial Snapshot */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Financial Snapshot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} amount={stat.amount} />
          ))}
        </div>
      </div>

      {/* Recent Obligations */}
      {recentObligations && recentObligations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Obligations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentObligations.map((obligation) => (
              <TransactionCard
                key={obligation._id}
                amount={obligation.amount}
                name={obligation.name}
                email={obligation.email}
                type={obligation.type}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show message if no obligations */}
      {recentObligations && recentObligations.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent obligations found for this project.</p>
        </div>
      )}
    </div>
  );
};