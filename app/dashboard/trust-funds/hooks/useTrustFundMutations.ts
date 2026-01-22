// app/dashboard/trust-funds/components/hooks/useTrustFundMutations.tsx

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { TrustFundFormData } from "@/types/trustFund.types";

export function useTrustFundMutations() {
  const createTrustFund = useMutation(api.trustFunds.create);
  const updateTrustFund = useMutation(api.trustFunds.update);
  const moveToTrash = useMutation(api.trustFunds.moveToTrash);

  const handleAdd = async (data: TrustFundFormData) => {
    try {
      const toastId = toast.loading("Creating trust fund...");
      
      const status = data.status || "not_yet_started";
      
      await createTrustFund({
        projectTitle: data.projectTitle,
        officeInCharge: data.officeInCharge,
        dateReceived: data.dateReceived,
        received: data.received,
        obligatedPR: data.obligatedPR,
        utilized: data.utilized,
        status: status,
        remarks: data.remarks,
        year: data.year,
        fiscalYear: data.fiscalYear,
      });
      
      toast.dismiss(toastId);
      toast.success("Trust fund created successfully");
    } catch (error) {
      console.error("Error creating trust fund:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create trust fund");
      throw error;
    }
  };

  const handleEdit = async (id: string, data: TrustFundFormData) => {
    try {
      const toastId = toast.loading("Updating trust fund...");
      
      const status = data.status || "not_yet_started";
      
      await updateTrustFund({
        id: id as Id<"trustFunds">,
        projectTitle: data.projectTitle,
        officeInCharge: data.officeInCharge,
        dateReceived: data.dateReceived,
        received: data.received,
        obligatedPR: data.obligatedPR,
        utilized: data.utilized,
        status: status,
        remarks: data.remarks,
        year: data.year,
        fiscalYear: data.fiscalYear,
        reason: "User edit via form",
      });
      
      toast.dismiss(toastId);
      toast.success("Trust fund updated successfully");
    } catch (error) {
      console.error("Error updating trust fund:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update trust fund");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const toastId = toast.loading("Moving to trash...");
      
      await moveToTrash({
        id: id as Id<"trustFunds">,
        reason: "User deleted via UI",
      });
      
      toast.dismiss(toastId);
      toast.success("Trust fund moved to trash");
    } catch (error) {
      console.error("Error deleting trust fund:", error);
      toast.error(error instanceof Error ? error.message : "Failed to move to trash");
      throw error;
    }
  };

  return {
    handleAdd,
    handleEdit,
    handleDelete,
  };
}