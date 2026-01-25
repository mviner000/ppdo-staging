// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/BreakdownForm.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { BudgetViolationModal } from "@/app/dashboard/project/[year]/components/BudgetViolationModal";

// Import all components and utilities
import {
  breakdownSchema,
  BreakdownFormValues,
  useBudgetValidation,
  formatNumberForDisplay,
  calculateUtilizationRate,
} from "./index";

import { ProjectTitleField } from "./ProjectTitleField";
import { ImplementingOfficeField } from "./ImplementingOfficeField";
import { AccomplishmentField } from "./AccomplishmentField";
import { StatusField } from "./StatusField";
import { FinancialInfoSection } from "./FinancialInfoSection";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { FormActions } from "./FormActions";

// Props interface matching existing
interface BreakdownFormProps {
  breakdown?: any;
  onSave: (values: any) => void;
  onCancel: () => void;
  defaultProjectName?: string;
  defaultImplementingOffice?: string;
  projectId?: string;
}

export function BreakdownForm({
  breakdown,
  onSave,
  onCancel,
  defaultProjectName,
  defaultImplementingOffice,
  projectId,
}: BreakdownFormProps) {
  // State
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showBudgetOverview, setShowBudgetOverview] = useState(false);
  const [pendingValues, setPendingValues] = useState<BreakdownFormValues | null>(null);
  const [displayAllocated, setDisplayAllocated] = useState("");
  const [displayObligated, setDisplayObligated] = useState("");
  const [displayUtilized, setDisplayUtilized] = useState("");

  // Determine effective project ID
  const effectiveProjectId = useMemo(() => {
    if (projectId) return projectId;
    if (breakdown?.projectId) return breakdown.projectId;
    return undefined;
  }, [projectId, breakdown?.projectId]);

  // Initialize form
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

  // Watch form values
  const currentAllocated = form.watch("allocatedBudget") || 0;
  const currentUtilized = form.watch("budgetUtilized") || 0;
  const currentObligated = form.watch("obligatedBudget") || 0;

  // Budget validation hook
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
    breakdown,
  });

  // Initialize display values
  useEffect(() => {
    const allocated = form.getValues("allocatedBudget");
    const obligated = form.getValues("obligatedBudget");
    const utilized = form.getValues("budgetUtilized");

    if (allocated && allocated > 0) setDisplayAllocated(formatNumberForDisplay(allocated));
    if (obligated && obligated > 0) setDisplayObligated(formatNumberForDisplay(obligated));
    if (utilized && utilized > 0) setDisplayUtilized(formatNumberForDisplay(utilized));
  }, [form]);

  // Auto-calculate utilization rate
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

  // Form submission handler
  function onSubmit(values: BreakdownFormValues) {
    // Check for violations
    if (hasViolations) {
      setPendingValues(values);
      setShowViolationModal(true);
      return;
    }

    // If clean, proceed to save
    onSave(values);
  }

  // Handle violation modal confirmation
  const handleViolationConfirm = () => {
    if (pendingValues) {
      onSave(pendingValues);
    }
    setShowViolationModal(false);
    setPendingValues(null);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div 
                className="h-8 w-1 rounded-full" 
                style={{ backgroundColor: form.formState.isSubmitting ? "#ccc" : "#4FBA76" }} 
              />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Basic Information
              </h3>
            </div>

            <ProjectTitleField form={form} />
            <ImplementingOfficeField form={form} />
          </div>

          {/* Financial Information Section */}
          <FinancialInfoSection
            form={form}
            accentColor="#4FBA76"
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

          {/* Status & Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full" style={{ backgroundColor: "#4FBA76" }} />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Status & Progress
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AccomplishmentField form={form} />
              <StatusField form={form} />
            </div>
          </div>

          {/* Additional Information Section */}
          <AdditionalInfoSection form={form} />

          {/* Form Actions */}
          <FormActions
            isEditMode={!!breakdown}
            onCancel={onCancel}
          />
        </form>
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