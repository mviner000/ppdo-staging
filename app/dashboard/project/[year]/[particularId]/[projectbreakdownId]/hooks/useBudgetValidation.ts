// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/hooks/useBudgetValidation.ts

import { useMemo, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BudgetAllocationStatus, BudgetWarning, BreakdownFormData } from "../types/form.types";
import { formatCurrency } from "../utils/form.utils";

interface UseBudgetValidationProps {
  effectiveProjectId: string | undefined;
  currentAllocated: number;
  currentUtilized: number;
  currentObligated: number;
  breakdown?: BreakdownFormData | null;
}

export function useBudgetValidation({
  effectiveProjectId,
  currentAllocated,
  currentUtilized,
  currentObligated,
  breakdown,
}: UseBudgetValidationProps) {
  const [budgetWarning, setBudgetWarning] = useState<BudgetWarning | null>(null);

  // Fetch project data for validation
  const projectData = useQuery(
    api.projects.getForValidation,
    effectiveProjectId ? { id: effectiveProjectId as Id<"projects"> } : "skip"
  );

  // Fetch sibling breakdowns
  const siblings = useQuery(
    api.govtProjects.getProjectBreakdowns,
    effectiveProjectId ? { projectId: effectiveProjectId as Id<"projects"> } : "skip"
  );

  /**
   * Calculate budget allocation status
   */
  const budgetAllocationStatus = useMemo<BudgetAllocationStatus>(() => {
    if (!effectiveProjectId) {
      return {
        available: 0,
        isExceeded: false,
        difference: 0,
        parentTotal: 0,
        siblingTotal: 0,
        allocatedTotal: 0,
        siblingCount: 0,
        siblings: [],
        isLoading: false,
        noProjectId: true,
      };
    }

    if (projectData === undefined || siblings === undefined) {
      return {
        available: 0,
        isExceeded: false,
        difference: 0,
        parentTotal: 0,
        siblingTotal: 0,
        allocatedTotal: 0,
        siblingCount: 0,
        siblings: [],
        isLoading: true,
        noProjectId: false,
      };
    }

    const parentTotal = projectData?.totalBudgetAllocated || 0;

    // Exclude current breakdown from siblings
    const otherSiblings = breakdown
      ? siblings.filter(s => s._id !== breakdown._id)
      : siblings;

    const siblingUsed = otherSiblings.reduce((sum, s) => sum + (s.allocatedBudget || 0), 0);
    const available = parentTotal - siblingUsed;
    const isExceeded = currentAllocated > available;
    const difference = currentAllocated - available;
    const allocatedTotal = siblingUsed + currentAllocated;

    return {
      available,
      isExceeded,
      difference,
      parentTotal,
      siblingTotal: siblingUsed,
      allocatedTotal,
      siblingCount: otherSiblings.length,
      siblings: otherSiblings,
      isLoading: false,
      noProjectId: false,
    };
  }, [effectiveProjectId, projectData, siblings, breakdown, currentAllocated]);

  /**
   * Update budget warning when allocation changes
   */
  useEffect(() => {
    if (!budgetAllocationStatus.isLoading && !budgetAllocationStatus.noProjectId && currentAllocated > 0) {
      if (budgetAllocationStatus.isExceeded) {
        setBudgetWarning({
          show: true,
          message: `Warning: Total allocated budget (${formatCurrency(budgetAllocationStatus.allocatedTotal)}) exceeds parent project budget of ${formatCurrency(budgetAllocationStatus.parentTotal)} by ${formatCurrency(budgetAllocationStatus.difference)}`,
          allocatedTotal: budgetAllocationStatus.allocatedTotal,
          parentBudget: budgetAllocationStatus.parentTotal,
          difference: budgetAllocationStatus.difference
        });
      } else {
        setBudgetWarning(null);
      }
    } else {
      setBudgetWarning(null);
    }
  }, [budgetAllocationStatus, currentAllocated]);

  /**
   * Check if utilization exceeds self allocation
   */
  const isOverSelfUtilized = currentUtilized > currentAllocated;

  /**
   * Check if obligated exceeds parent total
   */
  const isObligatedOverParent = currentObligated > budgetAllocationStatus.parentTotal;

  /**
   * Check if utilized exceeds parent total
   */
  const isUtilizedOverParent = currentUtilized > budgetAllocationStatus.parentTotal;

  /**
   * Check if there are any violations
   */
  const hasViolations = 
    budgetAllocationStatus.isExceeded || 
    isOverSelfUtilized || 
    isObligatedOverParent || 
    isUtilizedOverParent;

  return {
    budgetAllocationStatus,
    budgetWarning,
    isOverSelfUtilized,
    isObligatedOverParent,
    isUtilizedOverParent,
    hasViolations,
  };
}