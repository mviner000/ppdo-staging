// app/dashboard/project/[year]/components/ExpandModal.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spreadsheet } from "@/components/spreadsheet";
import { BUDGET_SPREADSHEET_CONFIG } from "../config/budgetSpreadsheetConfig";

interface ExpandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpandModal({ isOpen, onClose }: ExpandModalProps) {
  const searchParams = useSearchParams();
  
  if (!isOpen) return null;

  // Get year from URL params if exists
  const yearParam = searchParams.get("year");
  const filters = yearParam ? { year: parseInt(yearParam) } : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-4 bg-white dark:bg-zinc-900 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Budget Spreadsheet View
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Spreadsheet Container */}
        <div className="flex-1 overflow-hidden">
          <Spreadsheet 
            config={BUDGET_SPREADSHEET_CONFIG} 
            filters={filters}
          />
        </div>
      </div>
    </div>
  );
}