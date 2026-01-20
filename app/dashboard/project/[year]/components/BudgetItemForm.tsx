// app/dashboard/project/budget/components/BudgetItemForm.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, PlusCircle, MinusCircle, AlertTriangle, Pencil, Check, X, Loader2 } from "lucide-react";
import { BudgetParticularCombobox } from "@/app/dashboard/project/[year]/components/BudgetParticularCombobox";
import { useAccentColor } from "@/contexts/AccentColorContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

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
  status?: "completed" | "ongoing" | "delayed";
  autoCalculateBudgetUtilized?: boolean; // 🆕 NEW FIELD
}

const FORM_STORAGE_KEY = "budget_item_form_draft";

const particularCodeString = z
  .string()
  .min(1, { message: "This field is required." })
  .refine((val) => val.trim().length > 0, {
    message: "Cannot be empty or only whitespace.",
  })
  .refine((val) => /^[\p{L}0-9_%\s,\.\-@]+$/u.test(val), {
    message: "Only letters (including accents), numbers, underscores, percentage signs, spaces, commas, periods, hyphens, and @ are allowed.",
  })
  .transform((val) => val.trim());

const budgetItemSchema = z.object({
  particular: particularCodeString,
  totalBudgetAllocated: z.number().min(0, {
    message: "Must be 0 or greater.",
  }),
  obligatedBudget: z.number().min(0).optional().or(z.literal(0)),
  totalBudgetUtilized: z.number().min(0).optional().or(z.literal(0)),
  year: z.number().int().min(2000).max(2100).optional().or(z.literal(0)),
  autoCalculateBudgetUtilized: z.boolean().optional(), // 🆕 NEW FIELD
});

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

interface BudgetItemFormProps {
  item?: BudgetItem | null;
  onSave: (item: Omit<BudgetItem, "id" | "utilizationRate" | "projectCompleted" | "projectDelayed" | "projectsOnTrack" | "status"> & { autoCalculateBudgetUtilized?: boolean }) => void;
  onCancel: () => void;
}

const formatNumberWithCommas = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  return parts[0];
};

const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatNumberForDisplay = (value: number): string => {
  if (value === 0) return '';
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export function BudgetItemForm({
  item,
  onSave,
  onCancel,
}: BudgetItemFormProps) {
  const { accentColorValue } = useAccentColor();
  const pathname = usePathname();

  // Query to check if particular exists
  const allParticulars = useQuery(api.budgetParticulars.list, {
    includeInactive: false,
  });

  // Mutation to create particular if needed
  const createParticular = useMutation(api.budgetParticulars.create);

  // Inline edit state
  const [isEditingParticular, setIsEditingParticular] = useState(false);
  const [editedParticular, setEditedParticular] = useState("");
  const [isHoveringParticular, setIsHoveringParticular] = useState(false);
  const [isSavingParticular, setIsSavingParticular] = useState(false);

  // Extract year from URL pathname
  const urlYear = (() => {
    const segments = pathname.split('/');
    const projectIndex = segments.findIndex(seg => seg === 'project');
    
    if (projectIndex !== -1 && segments[projectIndex + 1]) {
      const yearSegment = segments[projectIndex + 1];
      const parsed = parseInt(yearSegment);
      
      if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
        return parsed;
      }
    }
    
    return undefined;
  })();

  const isYearAutoFilled = !item && urlYear !== undefined;

  const [showManualInput, setShowManualInput] = useState(false);
  const [displayAllocated, setDisplayAllocated] = useState("");
  const [displayObligated, setDisplayObligated] = useState("");
  const [displayUtilized, setDisplayUtilized] = useState("");

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

  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: savedDraft || {
      particular: item?.particular || "",
      totalBudgetAllocated: item?.totalBudgetAllocated || 0,
      obligatedBudget: item?.obligatedBudget || undefined,
      totalBudgetUtilized: item?.totalBudgetUtilized || 0,
      year: item?.year || urlYear || undefined,
      autoCalculateBudgetUtilized: item?.autoCalculateBudgetUtilized !== undefined 
        ? item.autoCalculateBudgetUtilized 
        : true, // 🆕 Default to TRUE
    },
  });

  const formValues = form.watch();
  
  // 🆕 Watch auto-calculate state
  const autoCalculate = form.watch("autoCalculateBudgetUtilized");

  useEffect(() => {
    const allocated = form.getValues("totalBudgetAllocated");
    const obligated = form.getValues("obligatedBudget");
    const utilized = form.getValues("totalBudgetUtilized");

    if (allocated > 0) setDisplayAllocated(formatNumberForDisplay(allocated));
    if (obligated && obligated > 0) setDisplayObligated(formatNumberForDisplay(obligated));
    if (utilized && utilized > 0) setDisplayUtilized(formatNumberForDisplay(utilized));
  }, []);

  useEffect(() => {
    if (urlYear && !item) {
      form.setValue("year", urlYear);
    }
  }, [urlYear, form, item]);

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

  const totalBudgetAllocated = form.watch("totalBudgetAllocated");
  const obligatedBudget = form.watch("obligatedBudget");
  const totalBudgetUtilized = form.watch("totalBudgetUtilized") || 0;

  const utilizationRate =
    totalBudgetAllocated > 0
      ? (totalBudgetUtilized / totalBudgetAllocated) * 100
      : 0;

  const isBudgetExceeded = totalBudgetUtilized > totalBudgetAllocated;
  const isObligatedExceeded = obligatedBudget && obligatedBudget > totalBudgetAllocated;

  const particularExists = (code: string): boolean => {
    if (!allParticulars) return false;
    return allParticulars.some(p => p.code.toUpperCase() === code.toUpperCase());
  };

  const handleStartEdit = () => {
    setEditedParticular(form.getValues("particular"));
    setIsEditingParticular(true);
  };

  const handleSaveEdit = async () => {
    const trimmed = editedParticular.trim().toUpperCase();
    
    if (trimmed.length === 0 || !/^[\p{L}0-9_%\s,\.\-@]+$/u.test(trimmed)) {
      toast.error("Invalid format", {
        description: "Code can only contain letters, numbers, underscores, percentage signs, spaces, commas, periods, hyphens, and @"
      });
      return;
    }

    if (!particularExists(trimmed)) {
      const shouldCreate = confirm(
        `Budget particular "${trimmed}" doesn't exist yet.\n\nDo you want to create it now?`
      );

      if (!shouldCreate) {
        return;
      }

      try {
        setIsSavingParticular(true);
        
        await createParticular({
          code: trimmed,
          fullName: trimmed,
          description: `Auto-created from budget item edit: ${trimmed}`,
          category: "Custom",
        });

        toast.success("Budget particular created!", {
          description: `"${trimmed}" has been added. You can edit details in Settings.`,
        });

        form.setValue("particular", trimmed, { shouldValidate: true });
        setIsEditingParticular(false);
      } catch (error) {
        console.error("Error creating particular:", error);
        toast.error("Failed to create particular", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setIsSavingParticular(false);
      }
    } else {
      form.setValue("particular", trimmed, { shouldValidate: true });
      setIsEditingParticular(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedParticular("");
    setIsEditingParticular(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  function onSubmit(values: BudgetItemFormValues) {
    const cleanedValues = {
      ...values,
      obligatedBudget: values.obligatedBudget && values.obligatedBudget > 0 ? values.obligatedBudget : undefined,
      totalBudgetUtilized: values.totalBudgetUtilized || 0,
      year: values.year && values.year > 0 ? values.year : undefined,
      autoCalculateBudgetUtilized: values.autoCalculateBudgetUtilized, // 🆕 Include flag
    };

    if (!item) {
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form draft:", error);
      }
    }
    onSave(cleanedValues as any);
  }

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
        <FormField
          name="particular"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Particular
              </FormLabel>
              <FormControl>
                {!item ? (
                  <BudgetParticularCombobox
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!!item}
                    error={form.formState.errors.particular?.message}
                  />
                ) : (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsHoveringParticular(true)}
                    onMouseLeave={() => setIsHoveringParticular(false)}
                  >
                    {isEditingParticular ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedParticular}
                          onChange={(e) => setEditedParticular(e.target.value.toUpperCase())}
                          onKeyDown={handleKeyDown}
                          className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                          autoFocus
                          disabled={isSavingParticular}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={isSavingParticular}
                          className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          {isSavingParticular ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isSavingParticular}
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700">
                        <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">
                          {field.value}
                        </span>
                        {isHoveringParticular && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleStartEdit}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </FormControl>
              {item && !isEditingParticular && (
                <FormDescription className="text-zinc-500 dark:text-zinc-400">
                  Hover and click the pencil icon to edit. If the particular doesn't exist, you'll be prompted to create it.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Year {isYearAutoFilled && <span className="text-xs text-blue-500">(Auto-filled from URL)</span>}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 2024"
                  min="2000"
                  max="2100"
                  className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  disabled={isYearAutoFilled}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    field.onChange(value ? parseInt(value) : undefined);
                  }}
                />
              </FormControl>
              {isYearAutoFilled && (
                <FormDescription className="text-zinc-500 dark:text-zinc-400">
                  Year is automatically set based on the current page URL and cannot be changed.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="totalBudgetAllocated"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Total Budget Allocated
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                    ₱
                  </span>
                  <Input
                    placeholder="0"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 pl-8"
                    value={displayAllocated}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formatted = formatNumberWithCommas(value);
                      setDisplayAllocated(formatted);
                      const numericValue = parseFormattedNumber(formatted);
                      field.onChange(numericValue);
                    }}
                    onBlur={() => {
                      const numericValue = parseFormattedNumber(displayAllocated);
                      if (numericValue > 0) {
                        setDisplayAllocated(formatNumberForDisplay(numericValue));
                      } else {
                        setDisplayAllocated("");
                      }
                      field.onChange(numericValue);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 🆕 NEW FIELD: Auto-Calculate Budget Utilization Switch */}
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
                    ? "Budget utilized is automatically calculated from linked projects. Manual input is disabled." 
                    : "Budget utilized can be manually entered. Automatic calculation from projects is disabled."}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextState = !showManualInput;
                setShowManualInput(nextState);
                if (!nextState) {
                  form.setValue("obligatedBudget", 0);
                  form.setValue("totalBudgetUtilized", 0);
                  setDisplayObligated("");
                  setDisplayUtilized("");
                }
              }}
              // 🆕 Disable manual input toggle when auto-calculate is ON
              disabled={autoCalculate === true}
              className="text-xs flex items-center gap-2 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-700 dark:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showManualInput ? (
                <><MinusCircle className="w-3 h-3" /> Hide Manual Inputs</>
              ) : (
                <><PlusCircle className="w-3 h-3" /> Input Utilized and Obligated Budget</>
              )}
            </Button>
            {autoCalculate && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Disabled: Auto-calculate is ON
              </span>
            )}
          </div>

          {showManualInput && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border border-orange-200 dark:border-orange-800/50 rounded-lg p-4 bg-orange-50/50 dark:bg-orange-950/10">
              <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-300 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  This feature is under development, the entire system auto calculation may be not true, better use the project breakdown page to input the specific obligated and utilized budget.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  name="obligatedBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700 dark:text-zinc-300">
                        Obligated Budget <span className="text-xs text-zinc-500">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                            ₱
                          </span>
                          <Input
                            placeholder="0"
                            className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${isObligatedExceeded
                              ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                              : "border-zinc-300 dark:border-zinc-700"
                              }`}
                            value={displayObligated}
                            onChange={(e) => {
                              const value = e.target.value;
                              const formatted = formatNumberWithCommas(value);
                              setDisplayObligated(formatted);
                              const numericValue = parseFormattedNumber(formatted);
                              field.onChange(numericValue > 0 ? numericValue : undefined);
                            }}
                            onBlur={() => {
                              const numericValue = parseFormattedNumber(displayObligated);
                              if (numericValue > 0) {
                                setDisplayObligated(formatNumberForDisplay(numericValue));
                              } else {
                                setDisplayObligated("");
                              }
                              field.onChange(numericValue > 0 ? numericValue : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="totalBudgetUtilized"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700 dark:text-zinc-300">
                        Total Budget Utilized
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                            ₱
                          </span>
                          <Input
                            placeholder="0"
                            // 🆕 Disable input when auto-calculate is ON
                            disabled={autoCalculate === true}
                            className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-8 ${isBudgetExceeded
                              ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                              : "border-zinc-300 dark:border-zinc-700"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            value={displayUtilized}
                            onChange={(e) => {
                              const value = e.target.value;
                              const formatted = formatNumberWithCommas(value);
                              setDisplayUtilized(formatted);
                              const numericValue = parseFormattedNumber(formatted);
                              field.onChange(numericValue);
                            }}
                            onBlur={() => {
                              const numericValue = parseFormattedNumber(displayUtilized);
                              if (numericValue > 0) {
                                setDisplayUtilized(formatNumberForDisplay(numericValue));
                              } else {
                                setDisplayUtilized("");
                              }
                              field.onChange(numericValue);
                            }}
                          />
                        </div>
                      </FormControl>
                      {autoCalculate && (
                        <FormDescription className="text-xs text-blue-600 dark:text-blue-400">
                          This field is read-only because auto-calculate is enabled
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {isObligatedExceeded && totalBudgetAllocated > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Obligated Budget Exceeded
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                Obligated budget (₱{formatNumberForDisplay(obligatedBudget || 0)}) cannot exceed allocated amount (₱{formatNumberForDisplay(totalBudgetAllocated)})
              </p>
            </div>
          </div>
        )}

        {isBudgetExceeded && totalBudgetAllocated > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Utilized Budget Exceeded
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                Utilized budget (₱{formatNumberForDisplay(totalBudgetUtilized)}) cannot exceed allocated amount (₱{formatNumberForDisplay(totalBudgetAllocated)})
              </p>
            </div>
          </div>
        )}

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