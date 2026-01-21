// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form-sections/AdditionalInfoSection.tsx

"use client";

import { Control } from "react-hook-form";
import { ChevronDown, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BreakdownFormValues } from "../../types/form.types";
import { timestampToDate, dateToTimestamp } from "../../utils/form.utils";

interface AdditionalInfoSectionProps {
  control: Control<BreakdownFormValues>;
}

export function AdditionalInfoSection({ control }: AdditionalInfoSectionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="additional-info" className="border rounded-lg px-4">
        <AccordionTrigger className="py-4 hover:no-underline">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Additional Information
            </span>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <MapPin className="h-3 w-3" /> Location & Dates
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="pb-4 space-y-6">
          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="dateStarted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Date Started</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={timestampToDate(field.value)}
                      onChange={(e) => field.onChange(dateToTimestamp(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Target Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={timestampToDate(field.value)}
                      onChange={(e) => field.onChange(dateToTimestamp(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="completionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Completion Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={timestampToDate(field.value)}
                      onChange={(e) => field.onChange(dateToTimestamp(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">District</FormLabel>
                  <Input {...field} value={field.value || ""} />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Municipality</FormLabel>
                  <Input {...field} value={field.value || ""} />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="barangay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Barangay</FormLabel>
                  <Input {...field} value={field.value || ""} />
                </FormItem>
              )}
            />
          </div>

          {/* Remarks */}
          <FormField
            control={control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Remarks</FormLabel>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  className="resize-none"
                  rows={2}
                />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}