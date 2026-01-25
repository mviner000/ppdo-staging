// app/dashboard/project/[year]/[particularId]/components/form/FormActions.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useAccentColor } from "@/contexts/AccentColorContext";

interface FormActionsProps {
  isEditMode: boolean;
  onCancel: () => void;
}

export function FormActions({ isEditMode, onCancel }: FormActionsProps) {
  const { accentColorValue } = useAccentColor();

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <Button
        type="button"
        onClick={onCancel}
        variant="ghost"
        className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="text-white"
        style={{ backgroundColor: accentColorValue }}
      >
        {isEditMode ? "Update" : "Create"}
      </Button>
    </div>
  );
}