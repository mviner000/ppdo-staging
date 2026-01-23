// app/dashboard/project/[year]/components/hooks/useBudgetTableActions.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { withMutationHandling } from "@/services";
import { BudgetItem, BudgetContextMenuState } from "@/app/dashboard/project/[year]/types";
import { UseBudgetTableActionsReturn } from "../../types";

/**
 * Manages all table actions (CRUD, context menu, bulk operations)
 * Handles pin, edit, delete, auto-calculate toggle, and bulk actions
 */
export function useBudgetTableActions(
  selectedIds: Set<string>,
  setSelectedIds: (ids: Set<string>) => void,
  setSelectedItem: (item: BudgetItem | null) => void,
  setShowEditModal: (show: boolean) => void,
  setShowDeleteModal: (show: boolean) => void,
  setShowBulkToggleDialog: (show: boolean) => void
): UseBudgetTableActionsReturn {
  const router = useRouter();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Mutations
  const togglePinBudgetItem = useMutation(api.budgetItems.togglePin);
  const toggleAutoCalculate = useMutation(api.budgetItems.toggleAutoCalculate);
  const bulkToggleAutoCalculate = useMutation(api.budgetItems.bulkToggleAutoCalculate);
  const bulkMoveToTrash = useMutation(api.budgetItems.bulkMoveToTrash);

  // State
  const [contextMenu, setContextMenu] = useState<BudgetContextMenuState | null>(null);
  const [isTogglingAutoCalculate, setIsTogglingAutoCalculate] = useState(false);
  const [isBulkToggling, setIsBulkToggling] = useState(false);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close context menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      setContextMenu(null);
    };

    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, []);

  /**
   * Handle row click - navigate to detail page
   */
  const handleRowClick = useCallback((item: BudgetItem, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    
    // Get current year from URL params
    const pathSegments = window.location.pathname.split('/');
    const yearIndex = pathSegments.findIndex(seg => seg === 'project') + 1;
    const currentYear = pathSegments[yearIndex];
    
    router.push(
      `/dashboard/project/${currentYear}/${encodeURIComponent(item.particular)}`
    );
  }, [router]);

  /**
   * Handle context menu open
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, item: BudgetItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      entity: item,
    });
  }, []);

  /**
   * Handle edit action
   */
  const handleEdit = useCallback((item: BudgetItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
    setContextMenu(null);
  }, [setSelectedItem, setShowEditModal]);

  /**
   * Handle delete action
   */
  const handleDelete = useCallback((item: BudgetItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
    setContextMenu(null);
  }, [setSelectedItem, setShowDeleteModal]);

  /**
   * Handle pin/unpin action
   */
  const handlePin = useCallback(async (item: BudgetItem) => {
    try {
      await togglePinBudgetItem({ id: item.id as Id<"budgetItems"> });
      toast.success(
        item.isPinned ? "Budget item unpinned" : "Budget item pinned to top"
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to pin/unpin item");
    }
    setContextMenu(null);
  }, [togglePinBudgetItem]);

  /**
   * Handle auto-calculate toggle
   */
  const handleToggleAutoCalculate = useCallback(async (item: BudgetItem, newValue: boolean) => {
    setIsTogglingAutoCalculate(true);
    setContextMenu(null);
    
    try {
      const toastId = toast.loading("Updating auto-calculate mode...");
      
      await toggleAutoCalculate({
        id: item.id as Id<"budgetItems">,
        autoCalculate: newValue,
      });
      
      toast.dismiss(toastId);
      toast.success(`Switched to ${newValue ? 'auto-calculate' : 'manual'} mode`, {
        description: newValue 
          ? "Budget utilized will be calculated from children" 
          : "You can now enter budget utilized manually"
      });
    } catch (error) {
      console.error("Error toggling auto-calculate:", error);
      toast.error("Failed to toggle auto-calculate", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsTogglingAutoCalculate(false);
    }
  }, [toggleAutoCalculate]);

  /**
   * Handle bulk trash
   */
  const handleBulkTrash = useCallback(async () => {
    if (selectedIds.size === 0) {
      toast.error("No items selected");
      return;
    }
    
    await withMutationHandling(
      () =>
        bulkMoveToTrash({
          ids: Array.from(selectedIds) as Id<"budgetItems">[],
        }),
      {
        loadingMessage: `Moving ${selectedIds.size} item(s) to trash...`,
        successMessage: `Successfully moved ${selectedIds.size} item(s) to trash`,
        errorMessage: "Failed to move items to trash",
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      }
    );
  }, [selectedIds, bulkMoveToTrash, setSelectedIds]);

  /**
   * Open bulk auto-calculate toggle dialog
   */
  const handleOpenBulkToggleDialog = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("No items selected");
      return;
    }
    setShowBulkToggleDialog(true);
  }, [selectedIds, setShowBulkToggleDialog]);

  /**
   * Handle bulk auto-calculate toggle
   */
  const handleBulkToggleAutoCalculate = useCallback(async (autoCalculate: boolean, reason?: string) => {
    setIsBulkToggling(true);
    
    try {
      const result = await bulkToggleAutoCalculate({
        ids: Array.from(selectedIds) as Id<"budgetItems">[],
        autoCalculate,
        reason,
      });
      
      const count = (result as any).count || selectedIds.size;
      
      toast.success(`Updated ${count} budget item(s)`, {
        description: `All items switched to ${autoCalculate ? 'auto-calculate' : 'manual'} mode`
      });
      
      setSelectedIds(new Set());
      setShowBulkToggleDialog(false);
    } catch (error) {
      console.error("Error bulk toggling auto-calculate:", error);
      toast.error("Failed to update items", {
        description: error instanceof Error ? error.message : "Some items could not be updated"
      });
    } finally {
      setIsBulkToggling(false);
    }
  }, [selectedIds, bulkToggleAutoCalculate, setSelectedIds, setShowBulkToggleDialog]);

  return {
    contextMenu,
    setContextMenu,
    isTogglingAutoCalculate,
    handleRowClick,
    handleContextMenu,
    handleEdit,
    handleDelete,
    handlePin,
    handleToggleAutoCalculate,
    handleBulkTrash,
    handleOpenBulkToggleDialog,
    handleBulkToggleAutoCalculate,
    isBulkToggling,
  };
}