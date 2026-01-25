// app/dashboard/trust-funds/[year]/[trustfundbreakdownId]/page.tsx

/**
 * Trust Fund Breakdown Page (Container Component)
 *
 * Implements the "Container/Presenter" architecture where:
 * - This container handles data fetching and mutations
 * - Shared UI components handle presentation
 * - No recalculate status button (Trust Fund status is managed manually on parent page)
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";

// API & Models
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Contexts
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

// Shared Breakdown Components
import { BreakdownHeader } from "@/components/ppdo/breakdown/shared/BreakdownHeader";
import { EntityOverviewCards } from "@/components/ppdo/breakdown/shared/EntityOverviewCards";
import { BreakdownStatsAccordion } from "@/components/ppdo/breakdown/shared/BreakdownStatsAccordion";

// Reusable Project Components (Table & Form work with IBaseBreakdown)
import { BreakdownHistoryTable } from "@/app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/BreakdownHistoryTable";
import { BreakdownForm } from "@/app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/BreakdownForm";

// Shared Components
import { TrashBinModal } from "@/components/TrashBinModal";
import { Modal } from "@/app/dashboard/project/[year]/components/BudgetModal";
import { ConfirmationModal } from "@/app/dashboard/project/[year]/components/BudgetConfirmationModal";

// Shared Hooks
import { useEntityStats, useEntityMetadata } from "@/lib/hooks/useEntityStats";

// Types
import { Breakdown } from "@/app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/types/breakdown.types";

// Utility function to extract Trust Fund ID from slug
function extractTrustFundId(slug: string): string {
  const parts = slug.split("-");
  return parts[parts.length - 1];
}

// Utility function to get status color
function getStatusColor(status?: string): string {
  if (!status) return "";
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-700 dark:text-green-300";
    case "delayed":
      return "text-red-700 dark:text-red-300";
    case "ongoing":
      return "text-blue-700 dark:text-blue-300";
    default:
      return "";
  }
}

export default function TrustFundBreakdownPage() {
  const params = useParams();
  const { setCustomBreadcrumbs } = useBreadcrumb();

  // Extract Params
  const year = params.year as string;
  const slugWithId = params.trustfundbreakdownId as string;
  const trustFundId = extractTrustFundId(slugWithId);

  // Local State
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null);
  const [showHeader, setShowHeader] = useState(false);

  // Queries
  const trustFund = useQuery(
    api.trustFunds.get,
    trustFundId ? { id: trustFundId as Id<"trustFunds"> } : "skip"
  );

  const breakdownHistory = useQuery(
    api.trustFundBreakdowns.getBreakdowns,
    trustFund ? { trustFundId: trustFundId as Id<"trustFunds"> } : "skip"
  );

  const departments = useQuery(api.departments.list, { includeInactive: false });

  // Hooks - Using shared hooks for statistics
  const stats = useEntityStats(breakdownHistory as Breakdown[] | undefined);
  const metadata = useEntityMetadata(breakdownHistory as Breakdown[] | undefined);

  // Effects - Breadcrumbs
  useEffect(() => {
    if (trustFund) {
      setCustomBreadcrumbs([
        { label: "Home", href: "/dashboard" },
        { label: "Trust Funds", href: "/dashboard/trust-funds" },
        { label: `${year}`, href: `/dashboard/trust-funds/${year}` },
        { label: trustFund.projectTitle || "Loading..." },
      ]);
    }
    return () => setCustomBreadcrumbs(null);
  }, [trustFund, year, setCustomBreadcrumbs]);

  // Mutations
  const createBreakdown = useMutation(api.trustFundBreakdowns.createBreakdown);
  const updateBreakdown = useMutation(api.trustFundBreakdowns.updateBreakdown);
  const deleteBreakdown = useMutation(api.trustFundBreakdowns.moveToTrash);

  // Handlers
  const handlePrint = () => window.print();

  const handleAdd = async (breakdownData: Omit<Breakdown, "_id">) => {
    try {
      if (!trustFund) {
        toast.error("Trust Fund not found");
        return;
      }
      await createBreakdown({
        ...breakdownData,
        trustFundId: trustFundId as Id<"trustFunds">,
        reportDate: breakdownData.reportDate || Date.now(),
        reason: "Created via dashboard form",
      } as any);

      toast.success("Breakdown record created successfully!");
      setShowAddModal(false);
    } catch (error: any) {
      toast.error("Failed to create breakdown record", {
        description: error.message,
      });
    }
  };

  const handleUpdate = async (breakdownData: Omit<Breakdown, "_id">) => {
    try {
      if (!selectedBreakdown) {
        toast.error("No breakdown selected");
        return;
      }
      await updateBreakdown({
        id: selectedBreakdown._id as Id<"trustFundBreakdowns">,
        ...breakdownData,
      } as any);

      toast.success("Breakdown record updated successfully!");
      setShowEditModal(false);
      setSelectedBreakdown(null);
    } catch (error: any) {
      toast.error("Failed to update breakdown record", {
        description: error.message,
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedBreakdown) return;
      await deleteBreakdown({
        id: selectedBreakdown._id as Id<"trustFundBreakdowns">,
        reason: "Moved to trash via dashboard confirmation",
      });
      toast.success("Breakdown record moved to trash!");
      setShowDeleteModal(false);
      setSelectedBreakdown(null);
    } catch (error) {
      toast.error("Failed to move breakdown record to trash");
    }
  };

  const handleEdit = (breakdown: Breakdown) => {
    setSelectedBreakdown(breakdown);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    const breakdown = breakdownHistory?.find((b) => b._id === id);
    if (breakdown) {
      setSelectedBreakdown(breakdown as Breakdown);
      setShowDeleteModal(true);
    }
  };

  return (
    <>
      {/* Shared Header Component - NO recalculate button for Trust Funds */}
      <BreakdownHeader
        backUrl={`/dashboard/trust-funds/${year}`}
        backLabel="Back to Trust Funds"
        entityName={trustFund?.projectTitle}
        entityType="trustfund"
        implementingOffice={trustFund?.officeInCharge}
        year={year}
        subtitle={`Historical breakdown and progress tracking for ${year}`}
        showHeader={showHeader}
        setShowHeader={setShowHeader}
        showRecalculateButton={false} // Key difference from Projects
        showActivityLog={true}
      />

      {/* Shared Entity Overview Cards */}
      {showHeader && trustFund && (
        <EntityOverviewCards
          entityType="trustfund"
          implementingOffice={trustFund.officeInCharge}
          totalBudget={trustFund.received}
          statusText={trustFund.status}
          statusColor={getStatusColor(trustFund.status)}
          year={year}
          remarks={trustFund.remarks}
          breakdownCounts={
            stats
              ? {
                  completed: stats.statusCounts.completed,
                  delayed: stats.statusCounts.delayed,
                  ongoing: stats.statusCounts.ongoing,
                }
              : undefined
          }
        />
      )}

      {/* Shared Statistics Accordion */}
      {showHeader && stats && (
        <BreakdownStatsAccordion
          stats={stats}
          entityType="trustfund"
          uniqueOffices={metadata.uniqueOffices}
          uniqueLocations={metadata.uniqueLocations}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Breakdown Table - Reused from Project */}
      <div className="mb-6">
        {breakdownHistory === undefined ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent"></div>
            <p className="mt-4 text-sm text-sm text-zinc-600 dark:text-zinc-400">
              Loading breakdown history...
            </p>
          </div>
        ) : (
          <BreakdownHistoryTable
            breakdowns={breakdownHistory as Breakdown[]}
            onPrint={handlePrint}
            onAdd={() => setShowAddModal(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenTrash={() => setShowTrashModal(true)}
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && trustFund && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Breakdown Record"
          size="xl"
        >
          <BreakdownForm
            defaultProjectName={trustFund.projectTitle}
            defaultImplementingOffice={trustFund.officeInCharge}
            projectId={trustFundId} // Using same prop name for compatibility
            onSave={handleAdd}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {showEditModal && selectedBreakdown && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBreakdown(null);
          }}
          title="Edit Breakdown Record"
          size="xl"
        >
          <BreakdownForm
            breakdown={selectedBreakdown}
            projectId={trustFundId}
            onSave={handleUpdate}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedBreakdown(null);
            }}
          />
        </Modal>
      )}

      {showDeleteModal && selectedBreakdown && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBreakdown(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Move to Trash"
          message={`Are you sure you want to move this breakdown record for ${selectedBreakdown.implementingOffice} to trash?`}
          confirmText="Move to Trash"
          variant="danger"
        />
      )}

      <TrashBinModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        type="breakdown"
      />
    </>
  );
}
