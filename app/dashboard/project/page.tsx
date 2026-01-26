"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Package, FolderTree } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { LoadingState, useBudgetAccess } from "@/app/dashboard/project/[year]/components";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { FiscalYearModal } from "@/components/ppdo/fiscal-years";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { FiscalYearHeader } from "@/components/ppdo/fiscal-years/FiscalYearHeader";
import { FiscalYearEmptyState } from "@/components/ppdo/fiscal-years/FiscalYearEmptyState";
import { FiscalYearCard } from "@/components/ppdo/fiscal-years/FiscalYearCard";
import { FiscalYearDeleteDialog } from "@/components/ppdo/fiscal-years/FiscalYearDeleteDialog";

export default function ProjectDashboardLanding() {
  const router = useRouter();
  const { accessCheck, isLoading: isLoadingAccess, canAccess } = useBudgetAccess();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accentColorValue } = useAccentColor(); // Keep usage if needed later or remove if strict
  const [showFiscalYearModal, setShowFiscalYearModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<{ id: Id<"fiscalYears">, year: number } | null>(null);

  // Fetch fiscal years
  const fiscalYears = useQuery(api.fiscalYears.list, { includeInactive: false });

  // ✅ Fixed: Pass empty object {} to satisfy the required args parameter
  const allBudgetItems = useQuery(api.budgetItems.list, {});
  const allProjects = useQuery(api.projects.list, {});
  const allBreakdowns = useQuery(api.govtProjects.getProjectBreakdowns, {});

  // Delete mutation
  const deleteFiscalYear = useMutation(api.fiscalYears.remove);

  const isLoadingYears = fiscalYears === undefined;
  const isLoadingData = allBudgetItems === undefined || allProjects === undefined || allBreakdowns === undefined;

  // Calculate statistics
  const yearsWithStats = useMemo(() => {
    if (!fiscalYears || !allBudgetItems || !allProjects || !allBreakdowns) return [];

    return fiscalYears.map((fiscalYear) => {
      const yearBudgetItems = allBudgetItems.filter(item => item.year === fiscalYear.year);
      const yearProjects = allProjects.filter(project => project.year === fiscalYear.year);
      const yearBreakdowns = allBreakdowns.filter(breakdown => {
        const parentProject = allProjects.find(p => p._id === breakdown.projectId);
        return parentProject?.year === fiscalYear.year;
      });

      const totalAllocated = yearBudgetItems.reduce((sum, item) => sum + item.totalBudgetAllocated, 0);
      const totalUtilized = yearBudgetItems.reduce((sum, item) => sum + item.totalBudgetUtilized, 0);
      const utilizationRate = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

      return {
        ...fiscalYear,
        stats: {
          budgetItemCount: yearBudgetItems.length,
          projectCount: yearProjects.length,
          breakdownCount: yearBreakdowns.length,
          totalAllocated,
          totalUtilized,
          utilizationRate,
          completedProjects: yearProjects.filter(p => p.status === "completed").length,
          ongoingProjects: yearProjects.filter(p => p.status === "ongoing").length,
          delayedProjects: yearProjects.filter(p => p.status === "delayed").length,
          projectCountVal: yearProjects.length,
        },
      };
    });
  }, [fiscalYears, allBudgetItems, allProjects, allBreakdowns]);

  const sortedYears = useMemo(() => {
    return [...yearsWithStats].sort((a, b) => b.year - a.year);
  }, [yearsWithStats]);

  const handleOpenYear = (year: number) => {
    router.push(`/dashboard/project/${year}`);
  };

  const handleYearCreated = () => {
    // Refresh logic handled by Convex automatically
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: Id<"fiscalYears">, year: number) => {
    e.stopPropagation();
    setYearToDelete({ id, year });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!yearToDelete) return;

    try {
      await deleteFiscalYear({ id: yearToDelete.id });
      toast.success(`Fiscal Year ${yearToDelete.year} deleted successfully`);
      setDeleteDialogOpen(false);
      setYearToDelete(null);
    } catch (error) {
      toast.error("Failed to delete fiscal year");
      console.error(error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoadingAccess || isLoadingYears || isLoadingData) {
    return <LoadingState message="Loading years..." />;
  }

  if (!canAccess) {
    return (
      <AccessDeniedPage
        userName={accessCheck?.user?.name || ""}
        userEmail={accessCheck?.user?.email || ""}
        departmentName={accessCheck?.department?.name || "Not Assigned"}
        pageRequested="Project Budget"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <FiscalYearHeader
          title="Years"
          onAddYear={() => setShowFiscalYearModal(true)}
          onOpenLatest={() => sortedYears.length > 0 && handleOpenYear(sortedYears[0].year)}
          hasYears={sortedYears.length > 0}
          accentColor="#15803D"
        />

        {sortedYears.length === 0 ? (
          <FiscalYearEmptyState
            onCreateFirst={() => setShowFiscalYearModal(true)}
            accentColor="#15803D"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedYears.map((fiscalYear, index) => {
              const isExpanded = expandedCards.has(fiscalYear._id);

              return (
                <FiscalYearCard
                  key={fiscalYear._id}
                  index={index}
                  fiscalYear={fiscalYear}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleCard(fiscalYear._id)}
                  onOpen={() => handleOpenYear(fiscalYear.year)}
                  onDelete={(e) => handleDeleteClick(e, fiscalYear._id, fiscalYear.year)}
                  accentColor="#15803D"
                  statsContent={
                    <>
                      <div className="text-center min-w-[70px]">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {fiscalYear.stats.budgetItemCount}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-400">
                          Items
                        </div>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {fiscalYear.stats.projectCount}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-400">
                          Projects
                        </div>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {fiscalYear.stats.breakdownCount}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-400">
                          Breakdowns
                        </div>
                      </div>
                    </>
                  }
                  expandedContent={
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Total Allocated
                            </span>
                          </div>
                          <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(fiscalYear.stats.totalAllocated)}
                          </div>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Total Utilized
                            </span>
                          </div>
                          <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(fiscalYear.stats.totalUtilized)}
                          </div>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 mb-1">
                            <FolderTree className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Utilization Rate
                            </span>
                          </div>
                          <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {fiscalYear.stats.utilizationRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                          Project Status Distribution
                        </h4>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600 dark:text-green-500">
                              {fiscalYear.stats.completedProjects}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: "#15803D" }}>
                              {fiscalYear.stats.ongoingProjects}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Ongoing</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-red-600 dark:text-red-500">
                              {fiscalYear.stats.delayedProjects}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Delayed</div>
                          </div>
                        </div>

                        {fiscalYear.stats.projectCountVal > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                              <span>Overall Progress</span>
                              <span>
                                {fiscalYear.stats.completedProjects} of {fiscalYear.stats.projectCountVal} completed
                              </span>
                            </div>
                            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(fiscalYear.stats.completedProjects / fiscalYear.stats.projectCountVal) * 100}%`,
                                  backgroundColor: "#15803D"
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <FiscalYearModal
        isOpen={showFiscalYearModal}
        onClose={() => setShowFiscalYearModal(false)}
        onSuccess={handleYearCreated}
      />

      <FiscalYearDeleteDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        yearToDelete={yearToDelete}
        onConfirm={handleConfirmDelete}
        itemTypeLabel="budget items, projects, or breakdowns"
      />

      <style jsx global>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}