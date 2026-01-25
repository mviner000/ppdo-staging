// app/dashboard/project/[year]/[particularId]/components/form/UtilizationDisplay.tsx

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calculator } from "lucide-react";
import { formatNumberForDisplay, getUtilizationColor } from "./utils/formHelpers";

interface UtilizationDisplayProps {
  totalBudgetAllocated: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
}

export function UtilizationDisplay({
  totalBudgetAllocated,
  totalBudgetUtilized,
  utilizationRate,
}: UtilizationDisplayProps) {
  if (totalBudgetAllocated <= 0) {
    return null;
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Utilization Rate:
        </span>
        <span className={`text-sm font-semibold ${getUtilizationColor(utilizationRate)}`}>
          {utilizationRate.toFixed(2)}%
        </span>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="formula" className="border-none">
          <AccordionTrigger className="px-4 pb-3 pt-0 hover:no-underline">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculation details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="bg-white dark:bg-zinc-900 rounded p-2.5 font-mono text-xs border">
              (₱{formatNumberForDisplay(totalBudgetUtilized)} ÷ ₱{formatNumberForDisplay(totalBudgetAllocated)}) × 100 = {utilizationRate.toFixed(2)}%
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}