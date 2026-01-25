// components/ppdo/table/implementing-office/ImplementingOfficeSelector.tsx

"use client";

import * as React from "react";
import { ChevronsUpDown, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImplementingOfficeSelectorProps } from "./types";
import { useOfficeSelector } from "./hooks/useOfficeSelector";
import { ModeSelector } from "./components/ModeSelector";
import { OfficeItemList } from "./components/OfficeItemList";
import { CreateNewSection } from "./components/CreateNewSection";
import { CreateOfficeDialog } from "./components/CreateOfficeDialog";
import { SelectedOfficeInfo } from "./components/SelectedOfficeInfo";

export function ImplementingOfficeSelector({
  value,
  onChange,
  disabled,
  error,
}: ImplementingOfficeSelectorProps) {
  const {
    open,
    selectionMode,
    searchQuery,
    displayedCount,
    createDialog,
    selectedItem,
    displayedItems,
    filteredList,
    hasMore,
    canCreate,
    validationError,
    isLoading,
    setOpen,
    setSelectionMode,
    setSearchQuery,
    handleSelect,
    loadMore,
    handleOpenCreateDialog,
    handleCreateNew,
    setCreateDialog,
  } = useOfficeSelector({ value, onChange });

  return (
    <>
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100",
                !value && "text-zinc-500 dark:text-zinc-400",
                error && "border-red-500 dark:border-red-500"
              )}
            >
              {value ? (
                <span className="flex items-center gap-2">
                  {selectedItem?.sourceType === "department" ? (
                    <Building2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Users className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {value}
                  </span>
                  {selectedItem && (
                    <span className="text-sm truncate">{selectedItem.fullName}</span>
                  )}
                </span>
              ) : (
                "Select implementing office..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-full p-0" align="start">
            {!selectionMode ? (
              <ModeSelector onSelectMode={setSelectionMode} />
            ) : (
              <Command shouldFilter={false}>
                <div className="flex items-center border-b px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectionMode(null);
                      setSearchQuery("");
                    }}
                    className="mr-2"
                  >
                    ← Back
                  </Button>
                  <div className="flex items-center gap-2 flex-1">
                    {selectionMode === "department" ? (
                      <Building2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Users className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium">
                      {selectionMode === "department" ? "Departments" : "Agencies"}
                    </span>
                  </div>
                </div>
                
                <CommandInput
                  placeholder={`Search ${selectionMode === "department" ? "departments" : "agencies"}...`}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                
                <CommandList>
                  <OfficeItemList
                    items={displayedItems}
                    selectedValue={value}
                    selectionMode={selectionMode}
                    displayedCount={displayedCount}
                    totalCount={filteredList.length}
                    isLoading={isLoading}
                    onSelect={handleSelect}
                    onLoadMore={loadMore}
                  />

                  <CreateNewSection
                    searchQuery={searchQuery}
                    selectionMode={selectionMode}
                    canCreate={canCreate}
                    validationError={validationError}
                    onCreateClick={() => handleOpenCreateDialog(selectionMode!)}
                  />
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>

        <SelectedOfficeInfo selectedItem={selectedItem} />

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <CreateOfficeDialog
        open={createDialog.open}
        type={createDialog.type}
        code={createDialog.code}
        fullName={createDialog.fullName}
        isCreating={createDialog.isCreating}
        onOpenChange={(open) => setCreateDialog((prev) => ({ ...prev, open }))}
        onCodeChange={(code) => setCreateDialog((prev) => ({ ...prev, code }))}
        onFullNameChange={(fullName) => setCreateDialog((prev) => ({ ...prev, fullName }))}
        onCreate={handleCreateNew}
      />
    </>
  );
}