// app/dashboard/project/[year]/components/form/BudgetItemForm.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { BudgetItem } from "@/types/types";

// Subcomponents
import { ParticularField } from "./ParticularField";
import { YearField } from "./YearField";
import { AllocatedBudgetField } from "./AllocatedBudgetField";
import { AutoCalculateSwitch } from "./AutoCalculateSwitch";
import { ManualInputSection } from "./ManualInputSection";
import { ViolationAlerts } from "./ViolationAlerts";
import { InfoBanner } from "./InfoBanner";
import { FormActions } from "./FormActions";

// Utils
import { budgetItemSchema, BudgetItemFormValues } from "./utils/formValidation";
import { formatNumberForDisplay } from "./utils/formHelpers";
import { getSavedDraft, saveDraft, clearDraft } from "./utils/formStorage";

interface BudgetItemFormProps {
  item?: BudgetItem | null;
  onSave: (item: Omit<BudgetItem, "id" | "utilizationRate" | "projectCompleted" | "projectDelayed" | "projectsOnTrack" | "status"> & { autoCalculateBudgetUtilized?: boolean }) => void;
  onCancel: () => void;
}

export function BudgetItemForm({
  item,
  onSave,
  onCancel,
}: BudgetItemFormProps) {
  const pathname = usePathname();

  // Extract year from URL pathname
  const urlYear = (() => {
    const segments = pathname.split('/');
    const projectIndex = segments.findIndex(seg => seg === 'project');
    
    if (projectIndex !== -1 && segments[projectIndex + 1]) {
      const yearSegment = segments[projectIndex + 1];
      const parsed = parseInt(yearSegment);
      
      if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
        return parsed;
      }
    }
    
    return undefined;
  })();

  const isYearAutoFilled = !item && urlYear !== undefined;

  const [showManualInput, setShowManualInput] = useState(false);
  const [displayAllocated, setDisplayAllocated] = useState("");
  const [displayObligated, setDisplayObligated] = useState("");
  const [displayUtilized, setDisplayUtilized] = useState("");

  const savedDraft = item ? null : getSavedDraft();

  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: savedDraft || {
      particular: item?.particular || "",
      totalBudgetAllocated: item?.totalBudgetAllocated || 0,
      obligatedBudget: item?.obligatedBudget || undefined,
      totalBudgetUtilized: item?.totalBudgetUtilized || 0,
      year: item?.year || urlYear || undefined,
      autoCalculateBudgetUtilized: (item as any)?.autoCalculateBudgetUtilized !== undefined 
        ? (item as any).autoCalculateBudgetUtilized 
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
    if (urlYear && !item) {
      form.setValue("year", urlYear);
    }
  }, [urlYear, form, item]);

  // Auto-save draft
  useEffect(() => {
    if (!item) {
      const timer = setTimeout(() => {
        saveDraft(formValues);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formValues, item]);

  const totalBudgetAllocated = form.watch("totalBudgetAllocated") ?? 0;
  const obligatedBudget = form.watch("obligatedBudget") ?? 0;
  const totalBudgetUtilized = form.watch("totalBudgetUtilized") ?? 0;

  const isBudgetExceeded = totalBudgetUtilized > totalBudgetAllocated;
  const isObligatedExceeded = obligatedBudget > 0 && obligatedBudget > totalBudgetAllocated;

  function onSubmit(values: BudgetItemFormValues) {
    const cleanedValues = {
      ...values,
      obligatedBudget: values.obligatedBudget && values.obligatedBudget > 0 ? values.obligatedBudget : undefined,
      totalBudgetUtilized: values.totalBudgetUtilized || 0,
      year: values.year && values.year > 0 ? values.year : undefined,
      autoCalculateBudgetUtilized: values.autoCalculateBudgetUtilized,
    };

    if (!item) {
      clearDraft();
    }
    onSave(cleanedValues as any);
  }

  const handleCancel = () => {
    if (!item) {
      clearDraft();
    }
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ParticularField form={form} isEditMode={!!item} />
        
        <YearField 
          form={form} 
          isYearAutoFilled={isYearAutoFilled} 
        />
        
        <AllocatedBudgetField
          form={form}
          displayValue={displayAllocated}
          setDisplayValue={setDisplayAllocated}
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
        
        <ViolationAlerts
          isObligatedExceeded={isObligatedExceeded}
          isBudgetExceeded={isBudgetExceeded}
          totalBudgetAllocated={totalBudgetAllocated}
          obligatedBudget={obligatedBudget}
          totalBudgetUtilized={totalBudgetUtilized}
        />
        
        <InfoBanner autoCalculate={autoCalculate} />
        
        <FormActions
          isEditMode={!!item}
          onCancel={handleCancel}
        />
      </form>
    </Form>
  );
}