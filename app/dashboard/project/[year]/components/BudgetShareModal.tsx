// app/dashboard/project/[year]/components/BudgetShareModal.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import BaseShareModal from "./BaseShareModal";
import { SelectedUserForAccess } from "@/types/access.types";

interface BudgetShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SelectedUser = SelectedUserForAccess;

/**
 * Budget-level share modal wrapper
 * Uses BaseShareModal with budget-specific queries and mutations
 */
export default function BudgetShareModal({
  isOpen,
  onClose,
}: BudgetShareModalProps) {
  // Queries
  const allAccessRequests = useQuery(api.accessRequests.list);
  const usersWithAccess = useQuery(api.budgetSharedAccess.listUsersWithAccess);
  
  // Filter to only show budget-level requests (not particular-specific)
  // Particular requests have accessType === "particular"
  const accessRequests = allAccessRequests?.filter(
    (req) => req.accessType !== "particular"
  );
  
  // Mutations
  const updateRequestStatus = useMutation(api.accessRequests.updateStatus);
  const grantAccess = useMutation(api.budgetSharedAccess.grantAccess);
  const revokeAccess = useMutation(api.budgetSharedAccess.revokeAccess);
  
  // State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);

  // ============================================================================
  // MUTATION HANDLERS
  // ============================================================================

  const handleGrantAccess = async (user: SelectedUser) => {
    await grantAccess({
      userId: user.userId,
      accessLevel: user.accessLevel,
      notes: `Access granted via share dialog`,
    });
  };

  const handleRevokeAccess = async (userId: Id<"users">) => {
    await revokeAccess({ userId });
  };

  const handleApproveRequest = async (requestId: Id<"accessRequests">) => {
    await updateRequestStatus({
      requestId,
      status: "approved",
      adminNotes: undefined,
    });
  };

  const handleRejectRequest = async (requestId: Id<"accessRequests">) => {
    await updateRequestStatus({
      requestId,
      status: "rejected",
      adminNotes: undefined,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <BaseShareModal
      isOpen={isOpen}
      onClose={onClose}
      title='Share "Budget Tracking"'
      accessRequests={accessRequests}
      usersWithAccess={usersWithAccess}
      onGrantAccess={handleGrantAccess}
      onRevokeAccess={handleRevokeAccess}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      savingAccess={savingAccess}
      setSavingAccess={setSavingAccess}
      processingId={processingId}
      setProcessingId={setProcessingId}
    />
  );
}