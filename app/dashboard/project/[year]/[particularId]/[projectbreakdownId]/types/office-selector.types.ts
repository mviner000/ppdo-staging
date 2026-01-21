// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/types/office-selector.types.ts

import { Id } from "@/convex/_generated/dataModel";

export type SelectionMode = "agency" | "department" | null;

export interface ImplementingOfficeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export interface Agency {
  _id: Id<"implementingAgencies">;
  code: string;
  fullName: string;
  type: string;
  category?: string;
  isActive: boolean;
  usageCount?: number;
}

export interface Department {
  _id: Id<"departments">;
  code: string;
  name: string;
  isActive: boolean;
  usageCount?: number;
}

export interface NormalizedOfficeItem {
  _id: string;
  code: string;
  fullName: string;
  type?: string;
  category?: string;
  isActive: boolean;
  usageCount?: number;
}

export interface SelectedOfficeItem extends NormalizedOfficeItem {
  sourceType: "agency" | "department";
}

export interface CreateDialogState {
  open: boolean;
  type: "agency" | "department" | null;
  code: string;
  fullName: string;
  isCreating: boolean;
}