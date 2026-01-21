// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/office-selector/SelectedOfficeInfo.tsx

"use client";

import { SelectedOfficeItem } from "../../types/office-selector.types";

interface SelectedOfficeInfoProps {
  selectedItem: SelectedOfficeItem | null;
}

export function SelectedOfficeInfo({ selectedItem }: SelectedOfficeInfoProps) {
  if (!selectedItem) return null;

  const isDepartment = selectedItem.sourceType === "department";

  return (
    <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
      <span className="font-medium">Type:</span>
      <span>{isDepartment ? "Department" : "Implementing Agency"}</span>
      
      {selectedItem.category && !isDepartment && (
        <>
          <span className="mx-1">•</span>
          <span>{selectedItem.category}</span>
        </>
      )}
      
      {selectedItem.usageCount !== undefined && selectedItem.usageCount > 0 && (
        <>
          <span className="mx-1">•</span>
          <span>Used in {selectedItem.usageCount} project(s)</span>
        </>
      )}
    </div>
  );
}