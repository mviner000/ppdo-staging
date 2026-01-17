// app/dashboard/particulars/_components/ParticularDetailView.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  FileText,
  TrendingUp,
} from "lucide-react";

type NodeType = "budget" | "project" | "breakdown";

interface ParticularDetailViewProps {
  type: NodeType;
  item: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "delayed":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "ongoing":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

export function ParticularDetailView({ type, item }: ParticularDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Budget Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={<DollarSign className="h-5 w-5" />}
          title="Total Budget Allocated"
          value={formatCurrency(
            type === "breakdown"
              ? item.allocatedBudget || 0
              : item.totalBudgetAllocated || 0
          )}
          subtitle={
            item.obligatedBudget
              ? `Obligated: ${formatCurrency(item.obligatedBudget)}`
              : undefined
          }
        />

        <InfoCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Budget Utilized"
          value={formatCurrency(
            type === "breakdown"
              ? item.budgetUtilized || 0
              : item.totalBudgetUtilized || 0
          )}
          subtitle={
            item.utilizationRate !== undefined
              ? `${item.utilizationRate.toFixed(1)}% utilization rate`
              : undefined
          }
        />

        {type !== "budget" && (
          <InfoCard
            icon={<Building2 className="h-5 w-5" />}
            title="Implementing Office"
            value={item.implementingOffice || "N/A"}
          />
        )}

        {item.year && (
          <InfoCard
            icon={<Calendar className="h-5 w-5" />}
            title="Year"
            value={item.year.toString()}
          />
        )}
      </div>

      {/* Location Information (for breakdowns) */}
      {type === "breakdown" && (item.municipality || item.barangay || item.district) && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {item.district && (
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{item.district}</p>
                </div>
              )}
              {item.municipality && (
                <div>
                  <p className="text-sm text-gray-500">Municipality</p>
                  <p className="font-medium">{item.municipality}</p>
                </div>
              )}
              {item.barangay && (
                <div>
                  <p className="text-sm text-gray-500">Barangay</p>
                  <p className="font-medium">{item.barangay}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Project Status (for budget particulars) */}
      {type === "budget" && (item.projectCompleted || item.projectsOnTrack || item.projectDelayed) && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4">Project Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {item.projectCompleted || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {item.projectsOnTrack || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">On Track</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {item.projectDelayed || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delayed</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dates */}
      {(item.dateStarted || item.targetDate || item.completionDate) && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {item.dateStarted && (
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(item.dateStarted)}</p>
                </div>
              )}
              {item.targetDate && (
                <div>
                  <p className="text-sm text-gray-500">Target Date</p>
                  <p className="font-medium">{formatDate(item.targetDate)}</p>
                </div>
              )}
              {item.completionDate && (
                <div>
                  <p className="text-sm text-gray-500">Completion Date</p>
                  <p className="font-medium">{formatDate(item.completionDate)}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Additional Information */}
      {(item.description || item.remarks || item.notes || item.projectTitle) && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Information
            </h3>
            <div className="space-y-3">
              {item.projectTitle && (
                <div>
                  <p className="text-sm text-gray-500">Project Title</p>
                  <p className="text-sm">{item.projectTitle}</p>
                </div>
              )}
              {item.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{item.description}</p>
                </div>
              )}
              {item.remarks && (
                <div>
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p className="text-sm">{item.remarks}</p>
                </div>
              )}
              {item.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* System Information */}
      <Separator />
      <div>
        <h3 className="text-sm font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {item._creationTime && (
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium">
                {formatDate(item._creationTime)}
              </p>
            </div>
          )}
          {item.updatedAt && (
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium">{formatDate(item.updatedAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for info cards
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}

function InfoCard({ icon, title, value, subtitle }: InfoCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}