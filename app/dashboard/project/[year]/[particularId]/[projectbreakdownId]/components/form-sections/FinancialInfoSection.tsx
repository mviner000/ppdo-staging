// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/FinancialInfoSection.tsx

"use client";

import { Control, UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { BudgetAllocationStatus, BudgetWarning, BreakdownFormValues } from "../../types/form.types";
import { BudgetOverviewCard } from "./BudgetOverviewCard";
import { BudgetWarningAlert } from "./BudgetWarningAlert";
import { CurrencyInput } from "./CurrencyInput";
import { BudgetStatusBar } from "./BudgetStatusBar";
import { formatCurrency } from "../../utils/form.utils";

interface FinancialInfoSectionProps {
  control: Control<BreakdownFormValues>;
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
  control,
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
          className="text-xs h-8 text-zinc-600 dark:text-zinc-400"
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

      {/* Allocated Budget Field */}
      <CurrencyInput
        control={control}
        form={form}
        name="allocatedBudget"
        label="Allocated Budget"
        displayValue={displayAllocated}
        setDisplayValue={setDisplayAllocated}
        showWarning={budgetAllocationStatus.isExceeded}
        tooltipContent={
          !budgetAllocationStatus.isLoading && !budgetAllocationStatus.noProjectId ? (
            <p className="text-xs">
              Parent project budget: {formatCurrency(budgetAllocationStatus.parentTotal)}<br />
              Sibling allocations: {formatCurrency(budgetAllocationStatus.siblingTotal)}<br />
              Available: {formatCurrency(budgetAllocationStatus.available)}<br />
              {budgetAllocationStatus.siblingCount} sibling breakdown(s)
            </p>
          ) : null
        }
        statusBar={
          !budgetAllocationStatus.isLoading && budgetAllocationStatus.parentTotal > 0 && (
            <BudgetStatusBar
              budgetAllocationStatus={budgetAllocationStatus}
              currentAllocated={currentAllocated}
            />
          )
        }
      />

      {/* Obligated and Utilized Budget Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput
          control={control}
          form={form}
          name="obligatedBudget"
          label="Obligated Budget"
          displayValue={displayObligated}
          setDisplayValue={setDisplayObligated}
          warningMessage={
            currentObligated > budgetAllocationStatus.parentTotal && 
            budgetAllocationStatus.parentTotal > 0
              ? "Warning: Obligated budget exceeds parent project total allocated budget."
              : undefined
          }
        />

        <CurrencyInput
          control={control}
          form={form}
          name="budgetUtilized"
          label="Budget Utilized"
          displayValue={displayUtilized}
          setDisplayValue={setDisplayUtilized}
          showWarning={isOverSelfUtilized}
          warningDetails={
            isOverSelfUtilized ? {
              title: "Utilization Warning",
              message: `Utilized (${formatCurrency(currentUtilized)}) exceeds allocated budget (${formatCurrency(currentAllocated)}) by ${formatCurrency(currentUtilized - currentAllocated)}`
            } : undefined
          }
          criticalWarning={
            currentUtilized > budgetAllocationStatus.parentTotal && 
            budgetAllocationStatus.parentTotal > 0
              ? "Critical Warning: Utilized budget exceeds parent project total allocated budget."
              : undefined
          }
        />
      </div>
    </div>
  );
}