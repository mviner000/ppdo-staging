// app/dashboard/project/page.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Calendar, Plus, TrendingUp, Package, FolderTree, ChevronDown, MoreVertical, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { LoadingState, useBudgetAccess } from "@/app/dashboard/project/[year]/components";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { FiscalYearModal } from "./components/FiscalYearModal";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export default function ProjectDashboardLanding() {
  const router = useRouter();
  const { accessCheck, isLoading: isLoadingAccess, canAccess } = useBudgetAccess();
  const { accentColorValue } = useAccentColor();
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
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Years
          </h1>
          <div className="flex items-center gap-2">
            {sortedYears.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenYear(sortedYears[0].year)}
              >
                Open Latest
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowFiscalYearModal(true)}
              className="text-white"
              style={{ backgroundColor: "#15803D" }}
            >
              <Plus className="w-4 h-4" />
              Add Year
            </Button>
          </div>
        </div>

        {sortedYears.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#15803D20" }}
            >
              <Calendar className="w-8 h-8" style={{ color: "#15803D" }} />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No fiscal years created yet.
            </p>
            <Button
              onClick={() => setShowFiscalYearModal(true)}
              className="text-white"
              style={{ backgroundColor: "#15803D" }}
            >
              <Plus className="w-4 h-4" />
              Create First Fiscal Year
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedYears.map((fiscalYear, index) => {
              const isExpanded = expandedCards.has(fiscalYear._id);
              
              return (
                <div
                  key={fiscalYear._id}
                  className="relative"
                  style={{
                    animation: `fadeInSlide 300ms ease-out ${index * 50}ms both`,
                  }}
                >
                  <Card 
                    className="group relative transition-all hover:shadow-md overflow-hidden bg-white dark:bg-zinc-950 cursor-pointer"
                    onClick={() => handleOpenYear(fiscalYear.year)}
                  >
                    {/* Main Card Header Content */}
                    <div className="flex items-start gap-4 p-5">
                      
                      {/* Left: Icon and Basic Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="p-3 rounded-lg shrink-0"
                          style={{
                            backgroundColor: fiscalYear.isCurrent
                              ? "#15803D30"
                              : "#fef3c7",
                            color: fiscalYear.isCurrent ? "#15803D" : "#b45309",
                          }}
                        >
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                            </div>
                            {fiscalYear.isCurrent && (
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: "#15803D20",
                                  color: "#15803D",
                                }}
                              >
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-3">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                              {fiscalYear.year}
                            </div>
                          </div>
                          {fiscalYear.description && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
                              {fiscalYear.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Stats & Buttons Wrapper */}
                      <div className="flex items-start gap-4 shrink-0">
                        {/* Stats Columns - Hidden on small screens */}
                        <div className="hidden sm:flex gap-6 mr-2">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                              {fiscalYear.stats.budgetItemCount}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Budget Items
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                              {fiscalYear.stats.projectCount}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Projects
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                              {fiscalYear.stats.breakdownCount}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Breakdowns
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Column */}
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenYear(fiscalYear.year);
                              }}
                              className="text-white flex-1"
                              style={{ backgroundColor: "#15803D" }}
                            >
                              Open Budget
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="px-2"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => handleDeleteClick(e, fiscalYear._id, fiscalYear.year)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(fiscalYear._id);
                            }}
                            className={cn(
                              "cursor-grab w-full flex items-center justify-between py-2 px-3 text-xs border rounded-md transition-colors",
                              "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                              "text-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            <span>DETAILS</span>
                            <ChevronDown 
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats for small screens - Show below main content */}
                    <div className="sm:hidden px-5 pb-3">
                      <div className="flex gap-4 justify-around">
                        <div className="text-center">
                          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {fiscalYear.stats.budgetItemCount}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Budget Items
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {fiscalYear.stats.projectCount}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Projects
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {fiscalYear.stats.breakdownCount}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Breakdowns
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content with Fixed Container */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 space-y-4">
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

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
                      </div>
                    )}
                  
                    {/* Decorative bottom border on hover */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: "linear-gradient(to right, #15803D40, #15803D80)",
                      }}
                    />
                  </Card>
                </div>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fiscal Year {yearToDelete?.year}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to delete this fiscal year?</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <strong>Note:</strong> Deleting this fiscal year will not affect or delete the budget items, projects, or breakdowns associated with year {yearToDelete?.year}. You can recreate the same fiscal year later to view these items again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}