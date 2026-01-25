// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/FinancialInfoSection.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreakdownFormValues } from "./utils/formValidation";
import { BudgetAllocationStatus, BudgetWarning } from "./utils/budgetCalculations";
import { BudgetOverviewCard } from "./BudgetOverviewCard";
import { BudgetWarningAlert } from "./BudgetWarningAlert";
import { BudgetStatusBar } from "./BudgetStatusBar";
import { AllocatedBudgetField } from "./AllocatedBudgetField";
import { ObligatedBudgetField } from "./ObligatedBudgetField";
import { UtilizedBudgetField } from "./UtilizedBudgetField";

interface FinancialInfoSectionProps {
  form: UseFormReturn<BreakdownFormValues>;
  accentColor: string;
  showBudgetOverview: boolean;
  setShowBudgetOverview: (show: boolean) => void;
  budgetAllocationStatus: BudgetAllocationStatus;
  budgetWarning: BudgetWarning | null;
  displayAllocated: string;
  setDisplayAllocated: (value: string) => void;
  displayObligated: string;
  setDisplayObligated: (value: string) => void;
  displayUtilized: string;
  setDisplayUtilized: (value: string) => void;
  currentAllocated: number;
  currentUtilized: number;
  currentObligated: number;
  isOverSelfUtilized: boolean;
}

export function FinancialInfoSection({
  form,
  accentColor,
  showBudgetOverview,
  setShowBudgetOverview,
  budgetAllocationStatus,
  budgetWarning,
  displayAllocated,
  setDisplayAllocated,
  displayObligated,
  setDisplayObligated,
  displayUtilized,
  setDisplayUtilized,
  currentAllocated,
  currentUtilized,
  currentObligated,
  isOverSelfUtilized,
}: FinancialInfoSectionProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Financial Information
          </h3>
        </div>
        
        {/* Toggle Budget Overview */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => setShowBudgetOverview(!showBudgetOverview)}
        >
          {showBudgetOverview ? (
            <>
              <EyeOff className="w-3.5 h-3.5 mr-2" /> Hide Budget Context
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 mr-2" /> View Budget Context
            </>
          )}
        </Button>
      </div>

      {/* Budget Overview Card */}
      {showBudgetOverview && !budgetAllocationStatus.isLoading && (
        <BudgetOverviewCard
          budgetAllocationStatus={budgetAllocationStatus}
          currentAllocated={currentAllocated}
        />
      )}

      {/* Budget Warning Alert */}
      {budgetWarning && <BudgetWarningAlert warning={budgetWarning} />}

      {/* Allocated Budget with Status Bar */}
      <div className="space-y-0">
        <AllocatedBudgetField
          form={form}
          displayValue={displayAllocated}
          setDisplayValue={setDisplayAllocated}
          budgetAllocationStatus={budgetAllocationStatus}
        />
        {!budgetAllocationStatus.isLoading && budgetAllocationStatus.parentTotal > 0 && (
          <BudgetStatusBar
            budgetAllocationStatus={budgetAllocationStatus}
            currentAllocated={currentAllocated}
          />
        )}
      </div>

      {/* Obligated and Utilized Budget Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ObligatedBudgetField
          form={form}
          displayValue={displayObligated}
          setDisplayValue={setDisplayObligated}
          currentObligated={currentObligated}
          budgetAllocationStatus={budgetAllocationStatus}
        />

        <UtilizedBudgetField
          form={form}
          displayValue={displayUtilized}
          setDisplayValue={setDisplayUtilized}
          currentAllocated={currentAllocated}
          currentUtilized={currentUtilized}
          budgetAllocationStatus={budgetAllocationStatus}
          isOverSelfUtilized={isOverSelfUtilized}
        />
      </div>
    </div>
  );
}