// app/dashboard/project/[year]/[particularId]/components/ProjectForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Form } from "@/components/ui/form";
import { Project } from "../types";
import { BudgetViolationModal } from "@/app/dashboard/project/[year]/components/BudgetViolationModal";

// Subcomponents
import {
  ParticularField,
  CategoryField,
  ImplementingOfficeField,
  YearField,
  AllocatedBudgetField,
  AutoCalculateSwitch,
  ManualInputSection,
  RemarksField,
  UtilizationDisplay,
  FormActions,
} from "./form";

// Utils
import {
  projectSchema,
  ProjectFormValues,
  getSavedDraft,
  saveDraft,
  clearDraft,
  formatNumberForDisplay,
  calculateBudgetAvailability,
} from "./form";

interface ProjectFormProps {
  project?: Project | null;
  budgetItemId?: string;
  budgetItemYear?: number;
  onSave: (project: Omit<Project, "id" | "utilizationRate" | "projectCompleted" | "projectDelayed" | "projectsOngoing" | "status"> & { categoryId?: string; autoCalculateBudgetUtilized?: boolean }) => void;
  onCancel: () => void;
}

export function ProjectForm({ 
  project, 
  budgetItemId, 
  budgetItemYear, 
  onSave, 
  onCancel 
}: ProjectFormProps) {
  const searchParams = useSearchParams();

  // Get year from URL query params
  const urlYear = (() => {
    const yearParam = searchParams.get("year");
    return yearParam ? parseInt(yearParam) : undefined;
  })();

  const shouldFetchParent = budgetItemId !== undefined && budgetItemId !== null && budgetItemId !== "";

  const parentBudgetItem = useQuery(
    api.budgetItems.get,
    shouldFetchParent ? { id: budgetItemId as any } : "skip"
  );

  const siblingProjects = useQuery(
    api.projects.list,
    shouldFetchParent ? { budgetItemId: budgetItemId as any } : "skip"
  );

  const [showViolationModal, setShowViolationModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<ProjectFormValues | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const [displayAllocated, setDisplayAllocated] = useState("");
  const [displayObligated, setDisplayObligated] = useState("");
  const [displayUtilized, setDisplayUtilized] = useState("");

  const savedDraft = project ? null : getSavedDraft();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: savedDraft || {
      particulars: project?.particulars || "",
      implementingOffice: project?.implementingOffice || "",
      categoryId: project?.categoryId || undefined,
      totalBudgetAllocated: project?.totalBudgetAllocated || 0,
      obligatedBudget: project?.obligatedBudget || undefined,
      totalBudgetUtilized: project?.totalBudgetUtilized || 0,
      remarks: project?.remarks || "",
      year: project?.year || urlYear || budgetItemYear || undefined,
      autoCalculateBudgetUtilized: project?.autoCalculateBudgetUtilized !== undefined 
        ? project.autoCalculateBudgetUtilized 
        : true,
    },
  });

  const formValues = form.watch();
  const autoCalculate = form.watch("autoCalculateBudgetUtilized") ?? true;

  // Initialize display values
  useEffect(() => {
    const allocated = form.getValues("totalBudgetAllocated");
    const obligated = form.getValues("obligatedBudget");
    const utilized = form.getValues("totalBudgetUtilized");

    if (allocated > 0) setDisplayAllocated(formatNumberForDisplay(allocated));
    if (obligated && obligated > 0) setDisplayObligated(formatNumberForDisplay(obligated));
    if (utilized && utilized > 0) setDisplayUtilized(formatNumberForDisplay(utilized));
  }, []);

  // Set year from URL
  useEffect(() => {
    if (urlYear && !project) {
      form.setValue("year", urlYear);
    }
  }, [urlYear, form, project]);

  // Auto-save draft
  useEffect(() => {
    if (!project) {
      const timer = setTimeout(() => {
        saveDraft(formValues);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formValues, project]);

  const totalBudgetAllocated = form.watch("totalBudgetAllocated") ?? 0;
  const totalBudgetUtilized = form.watch("totalBudgetUtilized") ?? 0;
  const obligatedBudget = form.watch("obligatedBudget") ?? 0;

  const utilizationRate =
    totalBudgetAllocated > 0
      ? (totalBudgetUtilized / totalBudgetAllocated) * 100
      : 0;

  const isBudgetExceeded = totalBudgetUtilized > totalBudgetAllocated;
  const isObligatedExceeded = obligatedBudget > 0 && obligatedBudget > totalBudgetAllocated;

  // Calculate budget availability from parent
  const budgetAvailability = calculateBudgetAvailability(
    shouldFetchParent,
    parentBudgetItem,
    siblingProjects,
    project,
    totalBudgetAllocated
  );

  function onSubmit(values: ProjectFormValues) {
    const isOverParent = budgetAvailability.isOverBudget;
    const isOverSelf = values.totalBudgetUtilized > values.totalBudgetAllocated;

    if (isOverParent || isOverSelf) {
      setPendingValues(values);
      setShowViolationModal(true);
      return;
    }

    proceedWithSave(values);
  }

  const proceedWithSave = (values: ProjectFormValues) => {
    const projectData = {
      ...values,
      remarks: values.remarks || "",
      categoryId: values.categoryId || undefined,
      autoCalculateBudgetUtilized: values.autoCalculateBudgetUtilized,
    };

    if (!project) {
      clearDraft();
    }
    onSave(projectData);
  };

  const handleCancel = () => {
    if (!project) {
      clearDraft();
    }
    onCancel();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ParticularField 
            form={form} 
            isEditMode={!!project} 
          />
          
          <CategoryField form={form} />
          
          <ImplementingOfficeField form={form} />
          
          <YearField 
            form={form} 
            urlYear={urlYear} 
          />
          
          <AllocatedBudgetField
            form={form}
            displayValue={displayAllocated}
            setDisplayValue={setDisplayAllocated}
            budgetAvailability={budgetAvailability}
            parentBudgetItem={parentBudgetItem}
          />
          
          <AutoCalculateSwitch form={form} />
          
          <ManualInputSection
            form={form}
            showManualInput={showManualInput}
            setShowManualInput={setShowManualInput}
            autoCalculate={autoCalculate}
            displayObligated={displayObligated}
            setDisplayObligated={setDisplayObligated}
            displayUtilized={displayUtilized}
            setDisplayUtilized={setDisplayUtilized}
            isObligatedExceeded={isObligatedExceeded}
            isBudgetExceeded={isBudgetExceeded}
          />
          
          <RemarksField form={form} />
          
          <UtilizationDisplay
            totalBudgetAllocated={totalBudgetAllocated}
            totalBudgetUtilized={totalBudgetUtilized}
            utilizationRate={utilizationRate}
          />
          
          <FormActions
            isEditMode={!!project}
            onCancel={handleCancel}
          />
        </form>
      </Form>

      <BudgetViolationModal
        isOpen={showViolationModal}
        onClose={() => {
          setShowViolationModal(false);
          setPendingValues(null);
        }}
        onConfirm={() => {
          if (pendingValues) proceedWithSave(pendingValues);
          setShowViolationModal(false);
          setPendingValues(null);
        }}
        allocationViolation={{
          hasViolation: budgetAvailability.isOverBudget,
          message: "The budget you are allocating for this project exceeds the available budget from the parent budget item.",
          details: [{
            label: "Parent Available",
            amount: pendingValues?.totalBudgetAllocated || 0,
            limit: budgetAvailability.available,
            diff: budgetAvailability.overBudgetAmount
          }]
        }}
        utilizationViolation={{
          hasViolation: (pendingValues?.totalBudgetUtilized || 0) > (pendingValues?.totalBudgetAllocated || 0),
          message: "The utilized budget amount exceeds the allocated budget you have set for this project.",
          details: [{
            label: "Self Allocation",
            amount: pendingValues?.totalBudgetUtilized || 0,
            limit: pendingValues?.totalBudgetAllocated || 0,
            diff: (pendingValues?.totalBudgetUtilized || 0) - (pendingValues?.totalBudgetAllocated || 0)
          }]
        }}
      />
    </>
  );
}