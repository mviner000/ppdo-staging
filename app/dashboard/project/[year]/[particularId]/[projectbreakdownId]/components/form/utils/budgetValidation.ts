// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/utils/budgetValidation.ts

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  BudgetAllocationStatus,
  BudgetWarning,
  calculateBudgetAvailability,
  getBudgetWarning,
} from "./budgetCalculations";

/**
 * Props for useBudgetValidation hook
 */
interface UseBudgetValidationProps {
  effectiveProjectId: string | undefined;
  currentAllocated: number;
  currentUtilized: number;
  currentObligated: number;
  breakdown: any | undefined;
}

/**
 * Return type for useBudgetValidation hook
 */
interface UseBudgetValidationResult {
  budgetAllocationStatus: BudgetAllocationStatus;
  budgetWarning: BudgetWarning | null;
  isOverSelfUtilized: boolean;
  isObligatedOverParent: boolean;
  isUtilizedOverParent: boolean;
  hasViolations: boolean;
}

/**
 * Custom hook for budget validation logic
 * Consolidates all budget validation concerns in one place
 */
export const useBudgetValidation = ({
  effectiveProjectId,
  currentAllocated,
  currentUtilized,
  currentObligated,
  breakdown,
}: UseBudgetValidationProps): UseBudgetValidationResult => {
  // Query parent project data
  const parentProject = useQuery(
    api.projects.get,
    effectiveProjectId ? { id: effectiveProjectId as Id<"projects"> } : "skip"
  );

  // Query sibling breakdowns - FIXED: Use the correct API path
  const siblingBreakdowns = useQuery(
    api.govtProjects.getProjectBreakdowns,
    effectiveProjectId ? { projectId: effectiveProjectId as Id<"projects"> } : "skip"
  );

  // Calculate budget allocation status
  const budgetAllocationStatus = useMemo(
    () =>
      calculateBudgetAvailability(
        effectiveProjectId,
        parentProject,
        siblingBreakdowns,
        breakdown,
        currentAllocated
      ),
    [effectiveProjectId, parentProject, siblingBreakdowns, breakdown, currentAllocated]
  );

  // Get budget warning
  const budgetWarning = useMemo(
    () => getBudgetWarning(budgetAllocationStatus, currentAllocated),
    [budgetAllocationStatus, currentAllocated]
  );

  // Validation flags
  const isOverSelfUtilized = currentUtilized > currentAllocated;
  
  const isObligatedOverParent =
    currentObligated > budgetAllocationStatus.parentTotal &&
    budgetAllocationStatus.parentTotal > 0;
  
  const isUtilizedOverParent =
    currentUtilized > budgetAllocationStatus.parentTotal &&
    budgetAllocationStatus.parentTotal > 0;

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
};