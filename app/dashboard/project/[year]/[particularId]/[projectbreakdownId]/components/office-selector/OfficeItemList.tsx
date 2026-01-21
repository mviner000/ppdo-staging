// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/office-selector/OfficeItemList.tsx

"use client";

import { Check, Users, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { NormalizedOfficeItem, SelectionMode } from "../../types/office-selector.types";

interface OfficeItemListProps {
  items: NormalizedOfficeItem[];
  selectedValue: string;
  selectionMode: SelectionMode;
  displayedCount: number;
  totalCount: number;
  isLoading: boolean;
  onSelect: (code: string) => void;
  onLoadMore: () => void;
}

export function OfficeItemList({
  items,
  selectedValue,
  selectionMode,
  displayedCount,
  totalCount,
  isLoading,
  onSelect,
  onLoadMore,
}: OfficeItemListProps) {
  const hasMore = displayedCount < totalCount;
  const isDepartment = selectionMode === "department";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
        <span className="ml-2 text-sm text-zinc-500">Loading...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <CommandEmpty>
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <AlertCircle className="h-8 w-8 text-zinc-400 mb-2" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No {isDepartment ? "departments" : "agencies"} found
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Try a different search term or create a new one
          </p>
        </div>
      </CommandEmpty>
    );
  }

  return (
    <>
      <CommandGroup>
        {items.map((item) => (
          <CommandItem
            key={item._id}
            value={item.code}
            onSelect={() => onSelect(item.code)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedValue === item.code ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isDepartment ? (
                <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
              ) : (
                <Users className="h-4 w-4 text-green-500 shrink-0" />
              )}
              <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                {item.code}
              </span>
              <span className="text-sm truncate flex-1">{item.fullName}</span>
              {item.usageCount !== undefined && item.usageCount > 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  ({item.usageCount})
                </span>
              )}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>

      {hasMore && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={onLoadMore}
          >
            Load more ({totalCount - displayedCount} remaining)
          </Button>
        </div>
      )}
    </>
  );
}