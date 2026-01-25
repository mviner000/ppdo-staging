// app/dashboard/project/[year]/[particularId]/components/form/AutoCalculateSwitch.tsx

"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProjectFormValues } from "./utils/formValidation";

interface AutoCalculateSwitchProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function AutoCalculateSwitch({ form }: AutoCalculateSwitchProps) {
  return (
    <FormField
      name="autoCalculateBudgetUtilized"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900/50">
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none flex-1">
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              Auto-Calculate Budget Utilization
              <Badge variant={field.value ? "default" : "secondary"} className="text-xs">
                {field.value ? "Auto" : "Manual"}
              </Badge>
            </FormLabel>
            <FormDescription className="text-xs">
              {field.value 
                ? "Budget utilized is automatically calculated from breakdowns. Manual input is disabled." 
                : "Budget utilized can be manually entered. Automatic calculation from breakdowns is disabled."}
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}