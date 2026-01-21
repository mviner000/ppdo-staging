// types/trustFund.types.ts

import { Id } from "@/convex/_generated/dataModel";

export type TrustFundStatus = "not_available" | "not_yet_started" | "ongoing" | "completed" | "active";

export interface TrustFund {
  id: string;
  projectTitle: string;
  officeInCharge: string;
  departmentId?: string;
  dateReceived?: number;
  received: number;
  obligatedPR?: number;
  utilized: number;
  balance: number;
  utilizationRate?: number;
  status?: TrustFundStatus;
  remarks?: string;
  year?: number;
  fiscalYear?: number;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: string;
  isDeleted?: boolean;
  deletedAt?: number;
  deletedBy?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
  notes?: string;
}

export interface TrustFundFromDB {
  _id: Id<"trustFunds">;
  _creationTime: number;
  projectTitle: string;
  officeInCharge: string;
  departmentId?: Id<"departments">;
  dateReceived?: number;
  received: number;
  obligatedPR?: number;
  utilized: number;
  balance: number;
  utilizationRate?: number;
  status?: TrustFundStatus;
  remarks?: string;
  year?: number;
  fiscalYear?: number;
  isPinned?: boolean;
  pinnedAt?: number;
  pinnedBy?: Id<"users">;
  isDeleted?: boolean;
  deletedAt?: number;
  deletedBy?: Id<"users">;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
  updatedBy?: Id<"users">;
  notes?: string;
}

export interface TrustFundFormData {
  projectTitle: string;
  officeInCharge: string;
  dateReceived?: number;
  received: number;
  obligatedPR?: number;
  utilized: number;
  status?: TrustFundStatus;
  remarks?: string;
  year?: number;
  fiscalYear?: number;
}

export interface TrustFundStatistics {
  totalReceived: number;
  totalUtilized: number;
  totalBalance: number;
  totalProjects: number;
  averageUtilizationRate: number;
}

export type TrustFundSortField =
  | "projectTitle"
  | "officeInCharge"
  | "status"
  | "dateReceived"
  | "received"
  | "obligatedPR"
  | "utilized"
  | "balance"
  | "utilizationRate"
  | "year";

export type SortDirection = "asc" | "desc" | null;

export interface TrustFundContextMenuState {
  x: number;
  y: number;
  entity: TrustFund;
}

export function convertTrustFundFromDB(dbFund: TrustFundFromDB): TrustFund {
  return {
    id: dbFund._id,
    projectTitle: dbFund.projectTitle,
    officeInCharge: dbFund.officeInCharge,
    departmentId: dbFund.departmentId,
    dateReceived: dbFund.dateReceived,
    received: dbFund.received,
    obligatedPR: dbFund.obligatedPR,
    utilized: dbFund.utilized,
    balance: dbFund.balance,
    utilizationRate: dbFund.utilizationRate,
    status: dbFund.status,
    remarks: dbFund.remarks,
    year: dbFund.year,
    fiscalYear: dbFund.fiscalYear,
    isPinned: dbFund.isPinned,
    pinnedAt: dbFund.pinnedAt,
    pinnedBy: dbFund.pinnedBy as string,
    isDeleted: dbFund.isDeleted,
    deletedAt: dbFund.deletedAt,
    deletedBy: dbFund.deletedBy as string,
    createdBy: dbFund.createdBy as string,
    createdAt: dbFund.createdAt,
    updatedAt: dbFund.updatedAt,
    updatedBy: dbFund.updatedBy as string,
    notes: dbFund.notes,
  };
}