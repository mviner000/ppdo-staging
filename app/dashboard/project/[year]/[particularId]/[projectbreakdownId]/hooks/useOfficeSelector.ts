// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/hooks/useOfficeSelector.ts

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { 
  SelectionMode, 
  CreateDialogState, 
  SelectedOfficeItem,
  NormalizedOfficeItem 
} from "../types/office-selector.types";
import { 
  normalizeDepartment, 
  filterOfficeItems, 
  canCreateNewCode, 
  getCodeValidationError 
} from "../utils/office-selector.utils";
import { ITEMS_PER_PAGE } from "../constants/office-selector.constants";

interface UseOfficeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function useOfficeSelector({ value, onChange }: UseOfficeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  
  const [createDialog, setCreateDialog] = useState<CreateDialogState>({
    open: false,
    type: null,
    code: "",
    fullName: "",
    isCreating: false,
  });

  // Fetch data
  const allAgencies = useQuery(api.implementingAgencies.list, {
    includeInactive: false,
  });

  const allDepartments = useQuery(api.departments.list, {
    includeInactive: false,
  });

  // Mutations
  const createAgency = useMutation(api.implementingAgencies.create);
  const createDepartment = useMutation(api.departments.create);

  // Get current list based on mode
  const currentList = useMemo((): NormalizedOfficeItem[] => {
    if (!selectionMode) return [];
    
    if (selectionMode === "agency") {
      return allAgencies || [];
    } else {
      return (allDepartments?.map(normalizeDepartment) || []);
    }
  }, [selectionMode, allAgencies, allDepartments]);

  // Filter and paginate
  const filteredList = useMemo(() => {
    return filterOfficeItems(currentList, searchQuery);
  }, [currentList, searchQuery]);

  const displayedItems = filteredList.slice(0, displayedCount);
  const hasMore = displayedCount < filteredList.length;

  // Get selected item
  const selectedItem = useMemo((): SelectedOfficeItem | null => {
    const agency = allAgencies?.find((a) => a.code === value);
    if (agency) return { ...agency, sourceType: "agency" };

    const dept = allDepartments?.find((d) => d.code === value);
    if (dept) {
      return {
        ...normalizeDepartment(dept),
        sourceType: "department",
      };
    }

    return null;
  }, [allAgencies, allDepartments, value]);

  // Validation
  const canCreate = useMemo(() => {
    return canCreateNewCode(searchQuery, selectionMode, allAgencies, allDepartments);
  }, [searchQuery, selectionMode, allAgencies, allDepartments]);

  const validationError = useMemo(() => {
    if (canCreate) return null;
    return getCodeValidationError(searchQuery, selectionMode, allAgencies, allDepartments);
  }, [searchQuery, selectionMode, allAgencies, allDepartments, canCreate]);

  // Handlers
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectionMode(null);
      setSearchQuery("");
      setDisplayedCount(ITEMS_PER_PAGE);
    }
  }, []);

  const handleSelect = useCallback((currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
    setSearchQuery("");
    setSelectionMode(null);
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [value, onChange]);

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const handleOpenCreateDialog = useCallback((type: "agency" | "department") => {
    setCreateDialog({
      open: true,
      type,
      code: searchQuery.toUpperCase(),
      fullName: "",
      isCreating: false,
    });
  }, [searchQuery]);

  const handleCreateNew = useCallback(async () => {
    if (!createDialog.type || !createDialog.code || !createDialog.fullName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreateDialog((prev) => ({ ...prev, isCreating: true }));
    
    try {
      if (createDialog.type === "agency") {
        await createAgency({
          code: createDialog.code,
          fullName: createDialog.fullName,
          type: "external",
          description: `Custom implementing agency: ${createDialog.code}`,
          category: "Custom",
        });

        toast.success("Implementing agency created!", {
          description: `"${createDialog.code}" has been added. You can edit details in Settings.`,
        });
      } else {
        await createDepartment({
          name: createDialog.fullName,
          code: createDialog.code,
          description: `Custom department: ${createDialog.code}`,
          isActive: true,
        });

        toast.success("Department created!", {
          description: `"${createDialog.code}" has been added. You can edit details in Settings.`,
        });
      }

      onChange(createDialog.code);
      setSearchQuery("");
      setSelectionMode(null);
      setCreateDialog({
        open: false,
        type: null,
        code: "",
        fullName: "",
        isCreating: false,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(`Failed to create ${createDialog.type}`, {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setCreateDialog((prev) => ({ ...prev, isCreating: false }));
    }
  }, [createDialog, createAgency, createDepartment, onChange]);

  return {
    // State
    open,
    selectionMode,
    searchQuery,
    displayedCount,
    createDialog,
    
    // Data
    allAgencies,
    allDepartments,
    currentList,
    filteredList,
    displayedItems,
    hasMore,
    selectedItem,
    
    // Validation
    canCreate,
    validationError,
    isLoading: allAgencies === undefined || allDepartments === undefined,
    
    // Handlers
    setOpen: handleOpenChange,
    setSelectionMode,
    setSearchQuery,
    handleSelect,
    loadMore,
    handleOpenCreateDialog,
    handleCreateNew,
    setCreateDialog,
  };
}