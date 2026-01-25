// app/dashboard/project/[year]/components/form/InfoBanner.tsx

"use client";

import { Info } from "lucide-react";

interface InfoBannerProps {
  autoCalculate: boolean;
}

export function InfoBanner({ autoCalculate }: InfoBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium">Automatic Project Metrics & Status</p>
        <p className="mt-1 opacity-90">
          {autoCalculate 
            ? "Project counts, status, and budget utilized are automatically calculated from individual projects." 
            : "Project counts and status are automatically calculated. Budget utilized is manually entered."}
        </p>
      </div>
    </div>
  );
}