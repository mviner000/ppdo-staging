// app/dashboard/settings/updates/page.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Bug, Lightbulb, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpdatesPage() {
  const router = useRouter();
  const bugReports = useQuery(api.bugReports.getAll);
  const suggestions = useQuery(api.suggestions.getAll);

  const bugStats = {
    total: bugReports?.length || 0,
    pending: bugReports?.filter((r) => r.status === "pending").length || 0,
    fixed: bugReports?.filter((r) => r.status === "fixed").length || 0,
  };

  const suggestionStats = {
    total: suggestions?.length || 0,
    pending: suggestions?.filter((s) => s.status === "pending").length || 0,
    acknowledged: suggestions?.filter((s) => s.status === "acknowledged").length || 0,
  };

  const isLoading = bugReports === undefined || suggestions === undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Updates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View system changes, report bugs, and send suggestions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bug Reports Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bug Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track reported issues</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {bugStats.pending}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fixed</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{bugStats.fixed}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Reports</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{bugStats.total}</span>
              </div>
            </div>
          )}

          <Button
            onClick={() => router.push("/dashboard/settings/updates/bugs-report")}
            className="w-full mt-4 bg-[#15803D] hover:bg-[#15803D]/90 text-white"
          >
            View All Bug Reports
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Suggestions Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Suggestions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share your ideas</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {suggestionStats.pending}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Acknowledged</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {suggestionStats.acknowledged}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Suggestions</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{suggestionStats.total}</span>
              </div>
            </div>
          )}

          <Button
            onClick={() => router.push("/dashboard/settings/updates/suggestions")}
            className="w-full mt-4 bg-[#15803D] hover:bg-[#15803D]/90 text-white"
          >
            View All Suggestions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-[#15803D]/5 to-[#15803D]/10 dark:from-[#15803D]/10 dark:to-[#15803D]/20 rounded-lg border border-[#15803D]/20 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Help Us Improve
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Found a bug or have an idea? We'd love to hear from you. Your feedback helps us make the system
              better for everyone.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/dashboard/settings/updates/bugs-report")}
                variant="outline"
                className="gap-2 border-[#15803D] text-[#15803D] hover:bg-[#15803D] hover:text-white"
              >
                <Bug className="w-4 h-4" />
                Report a Bug
              </Button>
              <Button
                onClick={() => router.push("/dashboard/settings/updates/suggestions")}
                variant="outline"
                className="gap-2 border-[#15803D] text-[#15803D] hover:bg-[#15803D] hover:text-white"
              >
                <Lightbulb className="w-4 h-4" />
                Submit Suggestion
              </Button>
            </div>
          </div>
          <FileText className="w-16 h-16 text-[#15803D]/20 hidden md:block" />
        </div>
      </div>
    </div>
  );
}