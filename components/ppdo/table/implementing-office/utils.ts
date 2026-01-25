// components/ppdo/table/implementing-office/utils.ts

import { Agency, Department, NormalizedOfficeItem, SelectionMode } from "./types";
import { AGENCY_CODE_PATTERN, DEPARTMENT_CODE_PATTERN } from "./constants";

/**
 * Normalizes department data to match office item structure
 */
export function normalizeDepartment(dept: Department): NormalizedOfficeItem {
  return {
    _id: dept._id,
    code: dept.code,
    fullName: dept.name,
    type: "department",
    category: "Department",
    isActive: dept.isActive,
    usageCount: dept.usageCount,
  };
}

/**
 * Filters office items based on search query
 */
export function filterOfficeItems(
  items: NormalizedOfficeItem[],
  searchQuery: string
): NormalizedOfficeItem[] {
  if (!searchQuery) return items;

  const query = searchQuery.toLowerCase();
  return items.filter(
    (item) =>
      item.code.toLowerCase().includes(query) ||
      item.fullName.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query))
  );
}

/**
 * Validates if a code format is valid for the given selection mode
 */
export function isValidCodeFormat(code: string, mode: SelectionMode): boolean {
  if (!code || !mode) return false;

  const upperCode = code.toUpperCase();
  
  if (mode === "agency") {
    return AGENCY_CODE_PATTERN.test(upperCode);
  } else {
    return DEPARTMENT_CODE_PATTERN.test(upperCode);
  }
}

/**
 * Checks if a code already exists in the given list
 */
export function codeExists(
  code: string,
  items: Array<{ code: string }> | undefined
): boolean {
  if (!items) return false;
  const upperCode = code.toUpperCase();
  return items.some((item) => item.code.toUpperCase() === upperCode);
}

/**
 * Validates if a new code can be created
 */
export function canCreateNewCode(
  searchQuery: string,
  mode: SelectionMode,
  agencies: Agency[] | undefined,
  departments: Department[] | undefined
): boolean {
  if (!searchQuery || searchQuery.length === 0 || !mode) return false;

  const upperSearch = searchQuery.toUpperCase();

  if (mode === "agency") {
    if (!AGENCY_CODE_PATTERN.test(upperSearch)) return false;
    return !codeExists(searchQuery, agencies);
  } else {
    if (!DEPARTMENT_CODE_PATTERN.test(upperSearch)) return false;
    return !codeExists(searchQuery, departments);
  }
}

/**
 * Gets validation error message for invalid code format
 */
export function getCodeValidationError(
  searchQuery: string,
  mode: SelectionMode,
  agencies: Agency[] | undefined,
  departments: Department[] | undefined
): { title: string; message: string } | null {
  if (!searchQuery || !mode) return null;

  const upperSearch = searchQuery.toUpperCase();

  if (mode === "agency") {
    if (!AGENCY_CODE_PATTERN.test(upperSearch)) {
      return {
        title: "Invalid format",
        message: "Code must contain only uppercase letters, numbers, spaces, and underscores",
      };
    }
    if (codeExists(searchQuery, agencies)) {
      return {
        title: "Already exists",
        message: "This agency is already in the list above",
      };
    }
  } else {
    if (!DEPARTMENT_CODE_PATTERN.test(upperSearch)) {
      return {
        title: "Invalid format",
        message: "Code must contain only uppercase letters, numbers, and underscores (no spaces)",
      };
    }
    if (codeExists(searchQuery, departments)) {
      return {
        title: "Already exists",
        message: "This department is already in the list above",
      };
    }
  }

  return null;
}