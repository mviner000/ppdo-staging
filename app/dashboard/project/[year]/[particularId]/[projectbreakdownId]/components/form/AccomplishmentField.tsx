// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/form/AccomplishmentField.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BreakdownFormValues } from "./utils/formValidation";

interface AccomplishmentFieldProps {
  form: UseFormReturn<BreakdownFormValues>;
}

export function AccomplishmentField({ form }: AccomplishmentFieldProps) {
  return (
    <FormField
      control={form.control}
      name="projectAccomplishment"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Accomplishment (%)
          </FormLabel>
          <div className="flex items-center gap-4">
            {/* Slider Section */}
            <FormControl>
              <div className="flex-1 space-y-2">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[field.value || 0]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                  }}
                  className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#4FBA76] [&_[role=slider]]:shadow-md [&_.relative]:bg-zinc-200 [&_.relative]:dark:bg-zinc-700 [&_[role=slider]~span]:bg-[#4FBA76]"
                />
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 px-0.5">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </FormControl>

            {/* Number Input on Right */}
            <FormControl>
              <div className="relative w-21">
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="1"
                  className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 pr-7 text-center font-semibold text-zinc-900 dark:text-zinc-100"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    const numValue = value ? parseFloat(value) : 0;
                    const clampedValue = Math.min(Math.max(numValue, 0), 100);
                    field.onChange(clampedValue);
                  }}
                  value={field.value ?? ""}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 text-sm pointer-events-none">
                  %
                </span>
              </div>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}