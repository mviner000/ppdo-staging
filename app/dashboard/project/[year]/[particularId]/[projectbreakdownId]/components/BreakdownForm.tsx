// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/BreakdownForm.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccentColor } from "../../../../../../../contexts/AccentColorContext";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BudgetViolationModal } from "@/app/dashboard/project/[year]/components/BudgetViolationModal";

// Import types
import {
  breakdownSchema,
  BreakdownFormValues,
  BreakdownFormProps,
  BreakdownFormData,
} from "../types/form.types";

// Import hooks
import { useBudgetValidation } from "../hooks/useBudgetValidation";
import { useFormDisplayValues } from "../hooks/useFormDisplayValues";

// Import utilities
import { calculateUtilizationRate } from "../utils/form.utils";

// Import components
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { FinancialInfoSection } from "./form-sections/FinancialInfoSection";
import { StatusProgressSection } from "./form-sections/StatusProgressSection";
import { AdditionalInfoSection } from "./form-sections/AdditionalInfoSection";

/* =======================
   MAIN COMPONENT
======================= */

export function BreakdownForm({
  breakdown,
  onSave,
  onCancel,
  defaultProjectName,
  defaultImplementingOffice,
  projectId,
}: BreakdownFormProps) {
  const { accentColorValue } = useAccentColor();
  const searchParams = useSearchParams();

  // State
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showBudgetOverview, setShowBudgetOverview] = useState(false);
  const [pendingValues, setPendingValues] = useState<BreakdownFormValues | null>(null);

  /**
   * Determine effective project ID
   */
  const effectiveProjectId = useMemo(() => {
    if (projectId) return projectId;
    if (breakdown?.projectId) return breakdown.projectId;
    return undefined;
  }, [projectId, breakdown?.projectId]);

  /**
   * Initialize form with react-hook-form
   */
  const form = useForm<BreakdownFormValues>({
    resolver: zodResolver(breakdownSchema),
    defaultValues: {
      projectName: breakdown?.projectName || defaultProjectName || "",
      implementingOffice: breakdown?.implementingOffice || defaultImplementingOffice || "",
      projectTitle: breakdown?.projectTitle || "",
      allocatedBudget: breakdown?.allocatedBudget || undefined,
      obligatedBudget: breakdown?.obligatedBudget || undefined,
      budgetUtilized: breakdown?.budgetUtilized || undefined,
      utilizationRate: breakdown?.utilizationRate || undefined,
      balance: breakdown?.balance || undefined,
      dateStarted: breakdown?.dateStarted || undefined,
      targetDate: breakdown?.targetDate || undefined,
      completionDate: breakdown?.completionDate || undefined,
      projectAccomplishment: breakdown?.projectAccomplishment || undefined,
      status: breakdown?.status || undefined,
      remarks: breakdown?.remarks || "",
      district: breakdown?.district || "",
      municipality: breakdown?.municipality || "",
      barangay: breakdown?.barangay || "",
      reportDate: breakdown?.reportDate || Date.now(),
      batchId: breakdown?.batchId || "",
      fundSource: breakdown?.fundSource || "",
    },
  });

  /**
   * Custom hook for display values
   */
  const {
    displayAllocated,
    setDisplayAllocated,
    displayObligated,
    setDisplayObligated,
    displayUtilized,
    setDisplayUtilized,
  } = useFormDisplayValues(form);

  /**
   * Watch fields for real-time validation
   */
  const currentAllocated = form.watch("allocatedBudget") || 0;
  const currentUtilized = form.watch("budgetUtilized") || 0;
  const currentObligated = form.watch("obligatedBudget") || 0;

  /**
   * Custom hook for budget validation
   */
  const {
    budgetAllocationStatus,
    budgetWarning,
    isOverSelfUtilized,
    isObligatedOverParent,
    isUtilizedOverParent,
    hasViolations,
  } = useBudgetValidation({
    effectiveProjectId,
    currentAllocated,
    currentUtilized,
    currentObligated,
    breakdown: breakdown as BreakdownFormData | undefined,
  });

  /**
   * Auto-calculate utilization rate
   */
  useEffect(() => {
    if (currentAllocated > 0) {
      const rate = calculateUtilizationRate(currentUtilized, currentAllocated);
      const currentRate = form.getValues("utilizationRate") || 0;
      if (Math.abs(rate - currentRate) > 0.01) {
        form.setValue("utilizationRate", rate);
      }
    } else if (currentUtilized === 0) {
      form.setValue("utilizationRate", 0);
    }
  }, [currentAllocated, currentUtilized, form]);

  /**
   * Form submission handler
   */
  function onSubmit(values: BreakdownFormValues) {
    // Check for violations
    if (hasViolations) {
      setPendingValues(values);
      setShowViolationModal(true);
      return;
    }

    // If clean, proceed to save
    onSave(values as any);
  }

  /**
   * Handle violation modal confirmation
   */
  const handleViolationConfirm = () => {
    if (pendingValues) {
      onSave(pendingValues as any);
    }
    setShowViolationModal(false);
    setPendingValues(null);
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <>
      <Form {...form}>
        <div className="space-y-6">
          {/* Basic Information */}
          <BasicInfoSection
            control={form.control}
            accentColor={accentColorValue}
          />

          {/* Financial Information */}
          <FinancialInfoSection
            control={form.control}
            form={form}
            accentColor={accentColorValue}
            showBudgetOverview={showBudgetOverview}
            setShowBudgetOverview={setShowBudgetOverview}
            budgetAllocationStatus={budgetAllocationStatus}
            budgetWarning={budgetWarning}
            displayAllocated={displayAllocated}
            setDisplayAllocated={setDisplayAllocated}
            displayObligated={displayObligated}
            setDisplayObligated={setDisplayObligated}
            displayUtilized={displayUtilized}
            setDisplayUtilized={setDisplayUtilized}
            currentAllocated={currentAllocated}
            currentUtilized={currentUtilized}
            currentObligated={currentObligated}
            isOverSelfUtilized={isOverSelfUtilized}
          />

          {/* Status & Progress */}
          <StatusProgressSection
            control={form.control}
            accentColor={accentColorValue}
          />

          {/* Additional Information */}
          <AdditionalInfoSection control={form.control} />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              className="text-white"
              style={{ backgroundColor: accentColorValue }}
            >
              {breakdown ? "Update Breakdown" : "Create Breakdown"}
            </Button>
          </div>
        </div>
      </Form>

      {/* Budget Violation Modal */}
      <BudgetViolationModal
        isOpen={showViolationModal}
        onClose={() => {
          setShowViolationModal(false);
          setPendingValues(null);
        }}
        onConfirm={handleViolationConfirm}
        allocationViolation={{
          hasViolation: budgetAllocationStatus.isExceeded,
          message: "Project Breakdown allocated budget exceeds Parent Project budget availability.",
          details: [{
            label: "Parent Project Available",
            amount: pendingValues?.allocatedBudget || 0,
            limit: budgetAllocationStatus.available,
            diff: budgetAllocationStatus.difference
          }]
        }}
        utilizationViolation={{
          hasViolation: isOverSelfUtilized || isUtilizedOverParent || isObligatedOverParent,
          message: "The budget amounts exceed the allocated budget limits (either self or parent project limits).",
          details: [{
            label: "Violation Details",
            amount: pendingValues?.budgetUtilized || 0,
            limit: pendingValues?.allocatedBudget || 0,
            diff: (pendingValues?.budgetUtilized || 0) - (pendingValues?.allocatedBudget || 0)
          }]
        }}
      />
    </>
  );
}