// components/ppdo/breakdown/form/utils/budgetValidation.ts

/**
 * Budget Validation Hook for Breakdown Form
 *
 * Used by both Project and Trust Fund breakdown forms.
 */

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
  /** Entity type to determine which API to call */
  entityType?: "project" | "trustfund" | "specialeducationfund" | "specialhealthfund";
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
 * Works for both Project and Trust Fund breakdowns
 */
export const useBudgetValidation = ({
  effectiveProjectId,
  currentAllocated,
  currentUtilized,
  currentObligated,
  breakdown,
  entityType = "project",
}: UseBudgetValidationProps): UseBudgetValidationResult => {
  // Query parent project/trust fund data
  const parentProject = useQuery(
    api.projects.get,
    effectiveProjectId && entityType === "project"
      ? { id: effectiveProjectId as Id<"projects"> }
      : "skip"
  );

  const parentTrustFund = useQuery(
    api.trustFunds.get,
    effectiveProjectId && entityType === "trustfund"
      ? { id: effectiveProjectId as Id<"trustFunds"> }
      : "skip"
  );

  const parentSpecialEducationFund = useQuery(
    api.specialEducationFunds.get,
    effectiveProjectId && entityType === "specialeducationfund"
      ? { id: effectiveProjectId as Id<"specialEducationFunds"> }
      : "skip"
  );

  const parentSpecialHealthFund = useQuery(
    api.specialHealthFunds.get,
    effectiveProjectId && entityType === "specialhealthfund"
      ? { id: effectiveProjectId as Id<"specialHealthFunds"> }
      : "skip"
  );

  // Query sibling breakdowns based on entity type
  const siblingProjectBreakdowns = useQuery(
    api.govtProjects.getProjectBreakdowns,
    effectiveProjectId && entityType === "project"
      ? { projectId: effectiveProjectId as Id<"projects"> }
      : "skip"
  );

  const siblingTrustFundBreakdowns = useQuery(
    api.trustFundBreakdowns.getBreakdowns,
    effectiveProjectId && entityType === "trustfund"
      ? { trustFundId: effectiveProjectId as Id<"trustFunds"> }
      : "skip"
  );

  const siblingSpecialEducationFundBreakdowns = useQuery(
    api.specialEducationFundBreakdowns.getBreakdowns,
    effectiveProjectId && entityType === "specialeducationfund"
      ? { specialEducationFundId: effectiveProjectId as Id<"specialEducationFunds"> }
      : "skip"
  );

  const siblingSpecialHealthFundBreakdowns = useQuery(
    api.specialHealthFundBreakdowns.getBreakdowns,
    effectiveProjectId && entityType === "specialhealthfund"
      ? { specialHealthFundId: effectiveProjectId as Id<"specialHealthFunds"> }
      : "skip"
  );

  // Select the appropriate parent and siblings based on entity type
  const parentEntity =
    entityType === "trustfund" ? parentTrustFund :
      entityType === "specialeducationfund" ? parentSpecialEducationFund :
        entityType === "specialhealthfund" ? parentSpecialHealthFund :
          parentProject;

  const siblingBreakdowns =
    entityType === "trustfund" ? siblingTrustFundBreakdowns :
      entityType === "specialeducationfund" ? siblingSpecialEducationFundBreakdowns :
        entityType === "specialhealthfund" ? siblingSpecialHealthFundBreakdowns :
          siblingProjectBreakdowns;

  // Calculate budget allocation status
  const budgetAllocationStatus = useMemo(
    () =>
      calculateBudgetAvailability(
        effectiveProjectId,
        parentEntity,
        siblingBreakdowns,
        breakdown,
        currentAllocated
      ),
    [effectiveProjectId, parentEntity, siblingBreakdowns, breakdown, currentAllocated]
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
