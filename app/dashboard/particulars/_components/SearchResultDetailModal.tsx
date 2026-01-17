// app/dashboard/particulars/_components/SearchResultDetailModal.tsx

"use client";

import { ParticularDetailModal } from "./ParticularDetailModal";

type NodeType = "budget" | "project" | "breakdown";

interface SearchResultDetailModalProps {
  type: NodeType;
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (type: NodeType, item: any) => void;
  onDelete?: (type: NodeType, item: any) => void;
}

/**
 * Wrapper component for backward compatibility
 * This component now just uses the new ParticularDetailModal
 * which uses the reusable ParticularDetailView component
 */
export function SearchResultDetailModal(props: SearchResultDetailModalProps) {
  return <ParticularDetailModal {...props} />;
}