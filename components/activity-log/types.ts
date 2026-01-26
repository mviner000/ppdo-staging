// components/ActivityLogSheet/types.ts

import { Id } from "@/convex/_generated/dataModel";

/**
 * Unified activity log structure
 * Consolidates all activity log types into a single interface
 */
export interface UnifiedActivityLog {
  _id: Id<
    | "projectActivities"
    | "budgetItemActivities"
    | "govtProjectBreakdownActivities"
    | "trustFundActivities"
    | "specialEducationFundActivities"
    | "specialEducationFundBreakdownActivities"
    | "specialHealthFundActivities"
    | "specialHealthFundBreakdownActivities"
  >;
  action: string;
  timestamp: number;
  performedByName: string;
  performedByEmail?: string;
  performedByRole?: string;
  reason?: string;
  changedFields?: string;
  changeSummary?: any;
  previousValues?: string;
  newValues?: string;

  // Project-specific fields
  particulars?: string;
  implementingOffice?: string;

  // Breakdown-specific fields
  projectName?: string;
  municipality?: string;
  barangay?: string;
  district?: string;

  // Trust Fund-specific fields
  projectTitle?: string;
  officeInCharge?: string;
}

/**
 * Props for ActivityLogSheet component
 */
export interface ActivityLogSheetProps {
  type: ActivityLogType;
  entityId?: string;
  budgetItemId?: string;
  projectName?: string;
  implementingOffice?: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
}

/**
 * Activity log type discriminator
 */
export type ActivityLogType = "project" | "budgetItem" | "breakdown" | "trustFund" | "specialEducationFund" | "specialEducationFundBreakdown" | "specialHealthFund" | "specialHealthFundBreakdown";

/**
 * Action filter options
 */
export type ActionFilterType =
  | "all"
  | "created"
  | "updated"
  | "deleted"
  | "restored"
  | "bulk_created"
  | "bulk_updated"
  | "bulk_deleted";