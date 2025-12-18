// app/dashboard/budget/components/BudgetItemForm.tsx

"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAccentColor } from "../../contexts/AccentColorContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calculator, AlertCircle } from "lucide-react";

interface BudgetItem {
  id: string;
  particular: string;
  totalBudgetAllocated: number;
  obligatedBudget?: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
  year?: number;
  status?: "done" | "pending" | "ongoing";
  targetDateCompletion?: number;
}

const BUDGET_PARTICULARS = [
  "GAD",
  "LDRRMP",
  "LCCAP",
  "LCPC",
  "SCPD",
  "POPS",
  "CAIDS",
  "LNP",
  "PID",
  "ACDP",
  "LYDP",
  "20%_DF",
] as const;

const FORM_STORAGE_KEY = "budget_item_form_draft";

// Custom validation for no whitespace
const noWhitespaceString = z
  .string()
  .min(1, { message: "This field is required." })
  .refine((val) => val.trim().length > 0, {
    message: "Whitespace only is not allowed.",
  })
  .refine((val) => val === val.trim(), {
    message: "Leading or trailing whitespace is not allowed.",
  })
  .refine((val) => !/\s/.test(val), {
    message: "Whitespace is not allowed.",
  });

// Define the form schema with Zod
const budgetItemSchema = z
  .object({
    particular: noWhitespaceString,
    totalBudgetAllocated: z.number().min(0, {
      message: "Must be 0 or greater.",
    }),
    obligatedBudget: z.number().min(0, {
      message: "Must be 0 or greater.",
    }).optional().or(z.literal(0)),
    totalBudgetUtilized: z.number().min(0, {
      message: "Must be 0 or greater.",
    }),
    projectCompleted: z.number().min(0, {
      message: "Must be 0 or greater.",
    }).max(100, {
      message: "Must be 100 or less.",
    }),
    projectDelayed: z.number().int().min(0, {
      message: "Must be a whole number (0 or greater).",
    }),
    projectsOnTrack: z.number().min(0, {
      message: "Must be 0 or greater.",
    }).max(100, {
      message: "Must be 100 or less.",
    }),
    year: z.number().int().min(2000).max(2100).optional().or(z.literal(0)),
    status: z.enum(["done", "pending", "ongoing"]).optional(),
    targetDateCompletion: z.number().optional().or(z.literal(0)),
  })
  .refine(
    (data) => data.totalBudgetUtilized <= data.totalBudgetAllocated,
    {
      message: "Budget utilized cannot exceed budget allocated.",
      path: ["totalBudgetUtilized"],
    }
  )
  .refine(
    (data) => !data.obligatedBudget || data.obligatedBudget <= data.totalBudgetAllocated,
    {
      message: "Obligated budget cannot exceed budget allocated.",
      path: ["obligatedBudget"],
    }
  );

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

interface BudgetItemFormProps {
  item?: BudgetItem | null;
  onSave: (item: Omit<BudgetItem, "id" | "utilizationRate">) => void;
  onCancel: () => void;
}

export function BudgetItemForm({
  item,
  onSave,
  onCancel,
}: BudgetItemFormProps) {
  const { accentColorValue } = useAccentColor();

  // Load saved draft from localStorage (only for new items)
  const getSavedDraft = () => {
    if (item) return null;

    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading form draft:", error);
    }
    return null;
  };

  const savedDraft = getSavedDraft();

  // Define the form
  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: savedDraft || {
      particular: item?.particular || "",
      totalBudgetAllocated: item?.totalBudgetAllocated || 0,
      obligatedBudget: item?.obligatedBudget || undefined,
      totalBudgetUtilized: item?.totalBudgetUtilized || 0,
      projectCompleted: item?.projectCompleted || 0,
      projectDelayed: item?.projectDelayed || 0,
      projectsOnTrack: item?.projectsOnTrack || 0,
      year: item?.year || undefined,
      status: item?.status || undefined,
      targetDateCompletion: item?.targetDateCompletion || undefined,
    },
  });

  // Watch all form values for auto-save
  const formValues = form.watch();

  // Auto-save draft to localStorage (only for new items)
  useEffect(() => {
    if (!item) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues));
        } catch (error) {
          console.error("Error saving form draft:", error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formValues, item]);

  // Watch values for utilization rate calculation
  const totalBudgetAllocated = form.watch("totalBudgetAllocated");
  const obligatedBudget = form.watch("obligatedBudget");
  const totalBudgetUtilized = form.watch("totalBudgetUtilized");

  // Calculate utilization rate for preview
  const utilizationRate =
    totalBudgetAllocated > 0
      ? (totalBudgetUtilized / totalBudgetAllocated) * 100
      : 0;

  // Check if budget is exceeded
  const isBudgetExceeded = totalBudgetUtilized > totalBudgetAllocated;
  const isObligatedExceeded = obligatedBudget && obligatedBudget > totalBudgetAllocated;

  // Get color based on utilization rate
  const getUtilizationColor = () => {
    if (utilizationRate > 100) return "text-red-600 dark:text-red-400 font-bold";
    if (utilizationRate >= 80) return "text-red-600 dark:text-red-400";
    if (utilizationRate >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  // Define submit handler
  function onSubmit(values: BudgetItemFormValues) {
    // Clean up optional fields - convert 0 to undefined
    const cleanedValues = {
      ...values,
      obligatedBudget: values.obligatedBudget && values.obligatedBudget > 0 ? values.obligatedBudget : undefined,
      year: values.year && values.year > 0 ? values.year : undefined,
      targetDateCompletion: values.targetDateCompletion && values.targetDateCompletion > 0 ? values.targetDateCompletion : undefined,
    };

    // Clear draft on successful submit
    if (!item) {
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form draft:", error);
      }
    }
    onSave(cleanedValues);
  }

  // Handle cancel
  const handleCancel = () => {
    if (!item) {
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form draft:", error);
      }
    }
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Particular Field */}
        <FormField
          name="particular"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Particular
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!item}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <SelectValue placeholder="Select Particular" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BUDGET_PARTICULARS.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {item && (
                <FormDescription className="text-zinc-500 dark:text-zinc-400">
                  Particular cannot be changed after creation
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional Fields Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Year (Optional) */}
          <FormField
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Year <span className="text-xs text-zinc-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 2024"
                    min="2000"
                    max="2100"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(value ? parseInt(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status (Optional) */}
          <FormField
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Status <span className="text-xs text-zinc-500">(Optional)</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Date Completion (Optional) */}
          <FormField
            name="targetDateCompletion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Target Date <span className="text-xs text-zinc-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? new Date(value).getTime() : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Budget Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Budget Allocated */}
          <FormField
            name="totalBudgetAllocated"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Total Budget Allocated
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Obligated Budget (Optional) */}
          <FormField
            name="obligatedBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Obligated Budget <span className="text-xs text-zinc-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                      isObligatedExceeded
                        ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(value ? parseFloat(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total Budget Utilized */}
          <FormField
            name="totalBudgetUtilized"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Total Budget Utilized
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                      isBudgetExceeded
                        ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Obligated Budget Exceeded Warning */}
        {isObligatedExceeded && totalBudgetAllocated > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Obligated Budget Exceeded
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                Obligated budget ({obligatedBudget?.toFixed(2)}) cannot exceed allocated amount ({totalBudgetAllocated.toFixed(2)})
              </p>
            </div>
          </div>
        )}

        {/* Budget Exceeded Warning */}
        {isBudgetExceeded && totalBudgetAllocated > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Budget Exceeded
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                Budget utilized ({totalBudgetUtilized.toFixed(2)}) cannot exceed allocated amount ({totalBudgetAllocated.toFixed(2)})
              </p>
            </div>
          </div>
        )}

        {/* Utilization Rate Preview */}
        {totalBudgetAllocated > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Utilization Rate (calculated):
              </span>
              <span className={`text-sm font-semibold ${getUtilizationColor()}`}>
                {utilizationRate.toFixed(2)}%
              </span>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="formula" className="border-none">
                <AccordionTrigger className="px-4 pb-3 pt-0 hover:no-underline">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>How is this calculated?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                        The utilization rate shows how much of your budget you've used.
                      </p>
                      <div className="bg-white dark:bg-zinc-900 rounded p-2.5 font-mono text-xs border border-zinc-200 dark:border-zinc-700">
                        (Budget Utilized ÷ Budget Allocated) × 100
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
                        Your calculation:
                      </p>
                      <div className="bg-white dark:bg-zinc-900 rounded p-2.5 font-mono text-xs border border-zinc-200 dark:border-zinc-700">
                        ({totalBudgetUtilized.toFixed(2)} ÷{" "}
                        {totalBudgetAllocated.toFixed(2)}) × 100 ={" "}
                        {utilizationRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Project Status Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Project Completion (%) */}
          <FormField
            name="projectCompleted"
            render={({ field }) => {
              const value = field.value;
              const isInvalid = value < 0 || value > 100;
              
              return (
                <FormItem>
                  <FormLabel className="text-zinc-700 dark:text-zinc-300">
                    Project Completion (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                        isInvalid
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-zinc-300 dark:border-zinc-700"
                      }`}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        field.onChange(parseFloat(value) || 0);
                      }}
                    />
                  </FormControl>
                  {isInvalid && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Must be between 0 and 100
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Project Delayed (Count) */}
          <FormField
            name="projectDelayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Projects Delayed (Count)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="1"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseInt(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Projects On Track (%) */}
          <FormField
            name="projectsOnTrack"
            render={({ field }) => {
              const value = field.value;
              const isInvalid = value < 0 || value > 100;
              
              return (
                <FormItem>
                  <FormLabel className="text-zinc-700 dark:text-zinc-300">
                    Projects On Track (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                        isInvalid
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-zinc-300 dark:border-zinc-700"
                      }`}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        field.onChange(parseFloat(value) || 0);
                      }}
                    />
                  </FormControl>
                  {isInvalid && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Must be between 0 and 100
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-white"
            style={{ backgroundColor: accentColorValue }}
          >
            {item ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}