// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/AdditionalInfoSection.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import { ChevronDown, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BreakdownFormValues } from "./utils/formValidation";
import { LocationFields } from "./LocationFields";
import { DateFields } from "./DateFields";
import { RemarksField } from "./RemarksField";

interface AdditionalInfoSectionProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function AdditionalInfoSection({ form }: AdditionalInfoSectionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="additional-info" className="border border-zinc-200 dark:border-zinc-800 rounded-lg px-4">
        <AccordionTrigger className="py-4 hover:no-underline">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Additional Information
            </span>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-3 w-3" /> Location & Dates
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="pb-4 space-y-6">
          {/* Date Fields */}
          <DateFields form={form} />

          {/* Location Fields */}
          <LocationFields form={form} />

          {/* Remarks */}
          <RemarksField form={form} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}