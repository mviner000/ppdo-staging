"use client";

import { useState } from "react";
import { Expand } from "lucide-react";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { BudgetPageHeader, ExpandModal, LoadingState, useBudgetAccess, useBudgetData, useBudgetMutations } from "./components";
import { BudgetTrackingTable } from "./components/BudgetTrackingTable";
import { TrashBinModal } from "../../components/TrashBinModal";
import BudgetStatistics from "./components/BudgetStatistics";


export default function BudgetTrackingPage() {
  const { accessCheck, isLoading: isLoadingAccess, canAccess } = useBudgetAccess();
  const { budgetItems, statistics, isLoading: isLoadingData } = useBudgetData();
  const { handleAdd, handleEdit, handleDelete } = useBudgetMutations();
  
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);

  if (isLoadingAccess) {
    return <LoadingState message="Checking access permissions..." />;
  }

  if (!canAccess) {
    return (
      <AccessDeniedPage
        userName={accessCheck?.user?.name || ""}
        userEmail={accessCheck?.user?.email || ""}
        departmentName={accessCheck?.department?.name || "Not Assigned"}
        pageRequested="Budget Tracking"
      />
    );
  }

  if (isLoadingData) {
    return <LoadingState />;
  }

  return (
    <>
      <BudgetPageHeader />

      {statistics && (
        <BudgetStatistics
          totalAllocated={statistics.totalAllocated}
          totalUtilized={statistics.totalUtilized}
          averageUtilizationRate={statistics.averageUtilizationRate}
          totalProjects={statistics.totalProjects}
        />
      )}

      <div className="mb-6">
        <BudgetTrackingTable
          budgetItems={budgetItems}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenTrash={() => setShowTrashModal(true)}
          expandButton={
            <button
              onClick={() => setIsExpandModalOpen(true)}
              className="cursor-pointer items-center justify-center px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Expand className="w-4 h-4" />
            </button>
          }
        />
      </div>

      <TrashBinModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        type="budget"
      />

      <ExpandModal
        isOpen={isExpandModalOpen}
        onClose={() => setIsExpandModalOpen(false)}
      />
    </>
  );
}