// app/dashboard/project/budget/[particularId]/components/ProjectShareModal.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import BaseShareModal from "../../../../../../components/ppdo/BaseShareModal";
import { 
  SelectedUserForAccess, 
  UserWithAccessInfo, 
  AccessRequestWithUser,
  AccessRequest,
  SimplifiedUser
} from "@/types/access.types";

interface ProjectShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  particularCode: string;
  particularFullName: string;
}

type SelectedUser = SelectedUserForAccess;

/**
 * Particular-level share modal wrapper
 * Uses BaseShareModal with particular-specific queries and mutations
 */
export function ProjectShareModal({
  isOpen,
  onClose,
  particularCode,
  particularFullName,
}: ProjectShareModalProps) {
  // Queries
  const accessRequests = useQuery(
    api.accessRequests.getParticularPendingRequests,
    isOpen ? { particularCode } : "skip"
  );
  
  const usersWithAccess = useQuery(
    api.budgetParticularAccess.getSharedUsers,
    isOpen ? { particularCode } : "skip"
  );
  
  // Mutations
  const grantAccess = useMutation(api.budgetParticularAccess.grantAccess);
  const revokeAccess = useMutation(api.budgetParticularAccess.revokeAccess);
  const approveRequest = useMutation(api.accessRequests.approveRequest);
  const rejectRequest = useMutation(api.accessRequests.rejectRequest);
  
  // State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);

  // ============================================================================
  // MUTATION HANDLERS
  // ============================================================================

  const handleGrantAccess = async (user: SelectedUser) => {
    await grantAccess({
      particularCode,
      userId: user.userId,
      accessLevel: user.accessLevel,
    });
  };

  const handleRevokeAccess = async (userId: Id<"users">) => {
    await revokeAccess({ 
      particularCode,
      userId 
    });
  };

  const handleApproveRequest = async (requestId: Id<"accessRequests">) => {
    await approveRequest({ requestId });
  };

  const handleRejectRequest = async (requestId: Id<"accessRequests">) => {
    await rejectRequest({ requestId });
  };

  // Transform usersWithAccess to match BaseShareModal's expected format
  // The query returns UserWithAccessInfo[], so we can use it directly
  const transformedUsersWithAccess: UserWithAccessInfo[] = usersWithAccess || [];

  // Transform accessRequests to match BaseShareModal's expected format
  // The backend now returns properly typed AccessRequestWithUser[]
  const transformedAccessRequests: AccessRequest[] = (accessRequests || [])
    .filter((request): request is AccessRequestWithUser & { user: SimplifiedUser } => 
      request.user !== null
    )
    .map((request) => ({
      _id: request._id,
      userName: request.user.name || "Unknown",
      userEmail: request.user.email || "",
      departmentName: request.user.departmentName || "Not Assigned",
      createdAt: request.createdAt,
      accessType: request.accessType,
      reason: request.reason,
      status: request.status,
    }));

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <BaseShareModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share "${particularFullName}"`}
      accessRequests={transformedAccessRequests}
      usersWithAccess={transformedUsersWithAccess}
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