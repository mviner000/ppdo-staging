// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/constants/office-selector.constants.ts

export const ITEMS_PER_PAGE = 20;

export const AGENCY_CODE_PATTERN = /^[A-Z0-9_ ]+$/;
export const DEPARTMENT_CODE_PATTERN = /^[A-Z0-9_]+$/;

export const SELECTION_MODES = {
  AGENCY: {
    value: "agency" as const,
    label: "Implementing Agency/Office",
    description: "External agencies, contractors, or custom offices",
    icon: "Users",
    color: "text-green-500",
  },
  DEPARTMENT: {
    value: "department" as const,
    label: "Department",
    description: "Internal departments and organizational units",
    icon: "Building2",
    color: "text-blue-500",
  },
} as const;