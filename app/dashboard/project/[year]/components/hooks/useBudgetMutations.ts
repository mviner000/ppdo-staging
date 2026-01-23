// app/dashboard/project/[year]/components/hooks/useBudgetMutations.ts

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { BudgetItem } from "@/types/types";

// Type guard for MutationResponse
type MutationResponse =
  | {
      success: true;
      data?: any;
      message?: string;
    }
  | {
      success: false;
      error: {
        message: string;
        code?: string;
      };
      message?: string;
    };

function isMutationResponse(value: unknown): value is MutationResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as any).success === "boolean"
  );
}

export function useBudgetMutations() {
  const createBudgetItem = useMutation(api.budgetItems.create);
  const updateBudgetItem = useMutation(api.budgetItems.update);
  const moveToTrash = useMutation(api.budgetItems.moveToTrash);

  const handleAdd = async (
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => {
    try {
      const toastId = toast.loading("Creating budget item...");

      const response = await createBudgetItem({
        particulars: item.particular,
        totalBudgetAllocated: item.totalBudgetAllocated,
        obligatedBudget: item.obligatedBudget,
        totalBudgetUtilized: item.totalBudgetUtilized,
        year: item.year,
      });

      toast.dismiss(toastId);

      // Handle response based on structure
      if (isMutationResponse(response)) {
        if (response.success) {
          toast.success("Budget item created successfully");
          return response.data?.budgetItemId || response.data?.id || null;
        } else {
          toast.error(
            response.error.message || "Failed to create budget item"
          );
          throw new Error(response.error.message);
        }
      } else {
        // Direct ID return or other format
        toast.success("Budget item created successfully");
        return response;
      }
    } catch (error) {
      console.error("Error creating budget item:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create budget item";
      toast.error(message);
      throw error;
    }
  };

  const handleEdit = async (
    id: string,
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => {
    try {
      const toastId = toast.loading("Updating budget item...");

      const response = await updateBudgetItem({
        id: id as Id<"budgetItems">,
        particulars: item.particular,
        totalBudgetAllocated: item.totalBudgetAllocated,
        obligatedBudget: item.obligatedBudget,
        totalBudgetUtilized: item.totalBudgetUtilized,
        year: item.year,
      });

      toast.dismiss(toastId);

      // Handle response based on structure
      if (isMutationResponse(response)) {
        if (response.success) {
          toast.success("Budget item updated successfully");
          return true;
        } else {
          toast.error(
            response.error.message || "Failed to update budget item"
          );
          throw new Error(response.error.message);
        }
      } else {
        // Direct success
        toast.success("Budget item updated successfully");
        return true;
      }
    } catch (error) {
      console.error("Error updating budget item:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update budget item";
      toast.error(message);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const toastId = toast.loading("Moving to trash...");

      const response = await moveToTrash({
        id: id as Id<"budgetItems">,
        reason: "Moved to trash via dashboard",
      });

      toast.dismiss(toastId);

      // Handle response based on structure
      if (isMutationResponse(response)) {
        if (response.success) {
          toast.success("Item moved to trash");
          return true;
        } else {
          toast.error(
            response.error.message || "Failed to move item to trash"
          );
          throw new Error(response.error.message);
        }
      } else {
        // Direct success
        toast.success("Item moved to trash");
        return true;
      }
    } catch (error) {
      console.error("Error deleting budget item:", error);
      toast.error("Failed to move item to trash");
      throw error;
    }
  };

  return {
    handleAdd,
    handleEdit,
    handleDelete,
  };
}