// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/office-selector/ModeSelector.tsx

"use client";

import { Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionMode } from "../../types/office-selector.types";

interface ModeSelectorProps {
  onSelectMode: (mode: SelectionMode) => void;
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="p-4 space-y-2">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
        Select source type:
      </p>
      
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3"
        onClick={() => onSelectMode("agency")}
      >
        <Users className="h-5 w-5 text-green-500" />
        <div className="text-left">
          <div className="font-medium">Implementing Agency/Office</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            External agencies, contractors, or custom offices
          </div>
        </div>
      </Button>
      
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3"
        onClick={() => onSelectMode("department")}
      >
        <Building2 className="h-5 w-5 text-blue-500" />
        <div className="text-left">
          <div className="font-medium">Department</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Internal departments and organizational units
          </div>
        </div>
      </Button>
    </div>
  );
}