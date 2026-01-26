// components/ppdo/breakdown/utils/navigation.utils.ts

/**
 * Centralized Navigation Utilities for Breakdown Components
 *
 * These utilities handle navigation for both Project and Trust Fund breakdown pages.
 */

import { Breakdown, NavigationParams } from "../types/breakdown.types";
import { createBreakdownSlug } from "./helpers";

/**
 * Builds the URL path for viewing breakdown details
 * Supports both project and trust fund breakdowns
 */
export function buildBreakdownDetailPath(
  breakdown: Breakdown,
  params: NavigationParams,
  entityType: "project" | "trustfund" | "specialeducationfund" | "specialhealthfund" = "project"
): string {
  const breakdownSlug = createBreakdownSlug(breakdown);

  if (entityType === "trustfund") {
    const { year, slug } = params;
    return `/dashboard/trust-funds/${year}/${slug}/${breakdownSlug}`;
  }

  if (entityType === "specialeducationfund") {
    const { year, slug } = params;
    return `/dashboard/special-education-funds/${year}/${slug}/${breakdownSlug}`;
  }

  if (entityType === "specialhealthfund") {
    const { year, slug } = params;
    return `/dashboard/special-health-funds/${year}/${slug}/${breakdownSlug}`;
  }

  // Default: project breakdown
  const { particularId, projectbreakdownId } = params;
  return `/dashboard/project/budget/${particularId}/${projectbreakdownId}/${breakdownSlug}`;
}

/**
 * Logs breakdown navigation for debugging
 */
export function logBreakdownNavigation(breakdown: Breakdown): void {
  console.log('Breakdown clicked:', {
    _id: breakdown._id,
    projectId: breakdown.projectId,
    trustFundId: breakdown.trustFundId,
    projectTitle: breakdown.projectTitle,
    allKeys: Object.keys(breakdown)
  });
}
