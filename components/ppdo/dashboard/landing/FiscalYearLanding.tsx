// components/ppdo/dashboard/landing/FiscalYearLanding.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { FolderTree, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiscalYearModal } from "@/components/ppdo/fiscal-years";
import { FiscalYearDeleteDialog } from "@/components/ppdo/fiscal-years/FiscalYearDeleteDialog";
import { FiscalYearEmptyState } from "@/components/ppdo/fiscal-years/FiscalYearEmptyState";
import { BetaBanner } from "@/components/ui/beta-banner";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { FiscalYearLandingCard } from "./FiscalYearLandingCard";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

/**
 * FiscalYearLanding Component
 *
 * Main dashboard landing page showing fiscal years as cards.
 * Users can click a fiscal year to view detailed year-specific analytics.
 *
 * Features:
 * - Grid of fiscal year cards with summary stats
 * - Create new fiscal year modal
 * - Delete fiscal year with confirmation
 * - Year-specific statistics (budgets, projects, etc.)
 * - Click to navigate to /dashboard/[year]
 * - Beta banner for new feature
 */

interface FiscalYearLandingProps {
  onBack?: () => void;
}

export function FiscalYearLanding({ onBack }: FiscalYearLandingProps) {
  const router = useRouter();
  const { accentColorValue } = useAccentColor();
  const { user } = useCurrentUser();
  const [showFiscalYearModal, setShowFiscalYearModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<{
    id: Id<"fiscalYears">;
    year: number;
  } | null>(null);

  // Fetch fiscal years and dashboard summary data
  const fiscalYears = useQuery(api.fiscalYears.list, {
    includeInactive: false,
  });

  // Use optimized dashboard query for resource conservation
  const dashboardData = useQuery(api.dashboard.getSummaryData, {
    includeInactive: false,
  });

  // Delete mutation
  const deleteFiscalYear = useMutation(api.fiscalYears.remove);

  const isLoading = fiscalYears === undefined || dashboardData === undefined;

  const yellowColor = "#EAB308"; // Tailwind yellow-500

  // Calculate statistics per year using pre-computed data
  const yearsWithStats = useMemo(() => {
    if (!fiscalYears || !dashboardData) return [];

    return fiscalYears.map((fy) => {
      const yearStats = dashboardData.yearStats[fy.year.toString()] || {
        projectCount: 0,
        ongoingCount: 0,
        completedCount: 0,
        delayedCount: 0,
        totalBudgetAllocated: 0,
        totalBudgetUtilized: 0,
        utilizationRate: 0,
        breakdownCount: 0,
      };

      return {
        ...fy,
        stats: yearStats,
      };
    }).sort((a, b) => b.year - a.year);
  }, [fiscalYears, dashboardData]);

  const handleOpenYear = (year: number) => {
    router.push(`/dashboard/${year}`);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    id: Id<"fiscalYears">,
    year: number
  ) => {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent mb-4"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading years...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="mr-1 -ml-2"
                >
                  <ArrowLeft className="w-5 h-5 text-zinc-500" />
                </Button>
              )}
              <FolderTree className="w-8 h-8" style={{ color: accentColorValue }} />
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Select a year to view detailed analytics and performance metrics
            </p>
          </div>
          <Button
            onClick={() => setShowFiscalYearModal(true)}
            className="w-full md:w-auto"
            style={{
              backgroundColor: accentColorValue,
              color: "#fff",
              fontWeight: "600"
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Year
          </Button>
        </div>

        {/* Empty State */}
        {yearsWithStats.length === 0 ? (
          <FiscalYearEmptyState
            onCreateFirst={() => setShowFiscalYearModal(true)}
            accentColor={accentColorValue}
          />
        ) : (
          /* Folder/Card Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {yearsWithStats.map((fiscalYear, index) => {
              return (
                <FiscalYearLandingCard
                  key={fiscalYear._id}
                  index={index}
                  fiscalYear={fiscalYear}
                  onOpen={() => handleOpenYear(fiscalYear.year)}
                  onDelete={(e) =>
                    handleDeleteClick(e, fiscalYear._id, fiscalYear.year)
                  }
                  accentColor={accentColorValue}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <FiscalYearModal
        isOpen={showFiscalYearModal}
        onClose={() => setShowFiscalYearModal(false)}
        onSuccess={() => {
          // Refresh handled by Convex
        }}
      />

      <FiscalYearDeleteDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        yearToDelete={yearToDelete}
        onConfirm={handleConfirmDelete}
        itemTypeLabel="all data"
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
}
