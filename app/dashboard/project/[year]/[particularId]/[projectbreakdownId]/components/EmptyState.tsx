// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/EmptyState.tsx

"use client";

import { FileX } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ 
  message = "No breakdown records found" 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 dark:text-zinc-400">
      <FileX className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-600" />
      <p className="text-sm">{message}</p>
    </div>
  );
}