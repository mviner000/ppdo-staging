"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Package, FolderTree } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { FiscalYearModal } from "@/components/ppdo/fiscal-years";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { FiscalYearHeader } from "@/components/ppdo/fiscal-years/FiscalYearHeader";
import { FiscalYearEmptyState } from "@/components/ppdo/fiscal-years/FiscalYearEmptyState";
import { FiscalYearCard } from "@/components/ppdo/fiscal-years/FiscalYearCard";
import { FiscalYearDeleteDialog } from "@/components/ppdo/fiscal-years/FiscalYearDeleteDialog";

export default function TrustFundsLanding() {
  const router = useRouter();
  const { accentColorValue } = useAccentColor();
  const [showFiscalYearModal, setShowFiscalYearModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<{ id: Id<"fiscalYears">, year: number } | null>(null);

  // Fetch fiscal years
  const fiscalYears = useQuery(api.fiscalYears.list, { includeInactive: false });

  // Fetch all trust funds
  const allTrustFunds = useQuery(api.trustFunds.list);

  // Delete mutation
  const deleteFiscalYear = useMutation(api.fiscalYears.remove);

  const isLoadingYears = fiscalYears === undefined;
  const isLoadingData = allTrustFunds === undefined;

  // Calculate statistics per year
  const yearsWithStats = useMemo(() => {
    if (!fiscalYears || !allTrustFunds) return [];

    return fiscalYears.map((fiscalYear) => {
      const yearTrustFunds = allTrustFunds.filter(tf => tf.year === fiscalYear.year);

      const totalReceived = yearTrustFunds.reduce((sum, tf) => sum + tf.received, 0);
      const totalUtilized = yearTrustFunds.reduce((sum, tf) => sum + tf.utilized, 0);
      const totalBalance = yearTrustFunds.reduce((sum, tf) => sum + tf.balance, 0);
      const avgUtilizationRate = yearTrustFunds.length > 0
        ? yearTrustFunds.reduce((sum, tf) => sum + (tf.utilizationRate || 0), 0) / yearTrustFunds.length
        : 0;

      return {
        ...fiscalYear,
        stats: {
          trustFundCount: yearTrustFunds.length,
          totalReceived,
          totalUtilized,
          totalBalance,
          avgUtilizationRate,
        },
      };
    });
  }, [fiscalYears, allTrustFunds]);

  const sortedYears = useMemo(() => {
    return [...yearsWithStats].sort((a, b) => b.year - a.year);
  }, [yearsWithStats]);

  const handleOpenYear = (year: number) => {
    router.push(`/dashboard/trust-funds/${year}`);
  };

  const handleYearCreated = () => {
    // Refresh handled by Convex automatically
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

  if (isLoadingYears || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent mb-4"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading years...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <FiscalYearHeader
          title="Trust Funds"
          subtitle="Select a year to manage trust funds"
          onAddYear={() => setShowFiscalYearModal(true)}
          onOpenLatest={() => sortedYears.length > 0 && handleOpenYear(sortedYears[0].year)}
          hasYears={sortedYears.length > 0}
          accentColor={accentColorValue}
        />

        {sortedYears.length === 0 ? (
          <FiscalYearEmptyState
            onCreateFirst={() => setShowFiscalYearModal(true)}
            accentColor={accentColorValue}
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
                  accentColor={accentColorValue}
                  openButtonLabel="Open Funds"
                  statsContent={
                    <div className="text-center">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {fiscalYear.stats.trustFundCount}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Trust Funds
                      </div>
                    </div>
                  }
                  expandedContent={
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Total Received
                            </span>
                          </div>
                          <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(fiscalYear.stats.totalReceived)}
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
                              Avg Utilization
                            </span>
                          </div>
                          <div className="text-xl font-bold text-zinc-900 dark:text-white">
                            {fiscalYear.stats.avgUtilizationRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                          Balance Overview
                        </h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: accentColorValue }}>
                            {formatCurrency(fiscalYear.stats.totalBalance)}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Available Balance
                          </div>
                        </div>
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
        itemTypeLabel="trust funds"
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