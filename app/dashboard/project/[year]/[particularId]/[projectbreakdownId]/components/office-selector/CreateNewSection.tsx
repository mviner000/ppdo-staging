// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/office-selector/CreateNewSection.tsx

"use client";

import { Plus, AlertCircle } from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { SelectionMode } from "../../types/office-selector.types";

interface CreateNewSectionProps {
  searchQuery: string;
  selectionMode: SelectionMode;
  canCreate: boolean;
  validationError: { title: string; message: string } | null;
  onCreateClick: () => void;
}

export function CreateNewSection({
  searchQuery,
  selectionMode,
  canCreate,
  validationError,
  onCreateClick,
}: CreateNewSectionProps) {
  if (!searchQuery || searchQuery.length === 0) return null;

  return (
    <>
      <CommandSeparator />
      <CommandGroup>
        {canCreate ? (
          <CommandItem
            onSelect={onCreateClick}
            className="cursor-pointer bg-blue-50 dark:bg-blue-950/20 aria-selected:bg-blue-100 dark:aria-selected:bg-blue-950/40"
          >
            <Plus className="mr-2 h-4 w-4" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium">
                Create "{searchQuery.toUpperCase()}"
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Add as new {selectionMode === "department" ? "department" : "implementing agency"}
              </span>
            </div>
          </CommandItem>
        ) : validationError ? (
          <div className="px-2 py-3 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{validationError.title}</p>
                <p className="mt-0.5">{validationError.message}</p>
              </div>
            </div>
          </div>
        ) : null}
      </CommandGroup>
    </>
  );
}