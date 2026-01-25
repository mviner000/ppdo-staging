// app/dashboard/project/[year]/components/form/ParticularField.tsx

"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { BudgetParticularCombobox } from "@/app/dashboard/project/[year]/components/BudgetParticularCombobox";
import { BudgetItemFormValues } from "./utils/formValidation";

interface ParticularFieldProps {
  form: UseFormReturn<BudgetItemFormValues>;
  isEditMode: boolean;
}

export function ParticularField({ form, isEditMode }: ParticularFieldProps) {
  const allParticulars = useQuery(api.budgetParticulars.list, {
    includeInactive: false,
  });
  const createParticular = useMutation(api.budgetParticulars.create);

  const [isEditingParticular, setIsEditingParticular] = useState(false);
  const [editedParticular, setEditedParticular] = useState("");
  const [isHoveringParticular, setIsHoveringParticular] = useState(false);
  const [isSavingParticular, setIsSavingParticular] = useState(false);

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
    
    if (trimmed.length === 0 || !/^[\p{L}0-9_%\s,.\-@]+$/u.test(trimmed)) {
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

  return (
    <FormField
      name="particular"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-zinc-700 dark:text-zinc-300">
            Particular
          </FormLabel>
          <FormControl>
            {!isEditMode ? (
              <BudgetParticularCombobox
                value={field.value}
                onChange={field.onChange}
                disabled={isEditMode}
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
          {isEditMode && !isEditingParticular && (
            <FormDescription className="text-zinc-500 dark:text-zinc-400">
              Hover and click the pencil icon to edit. If the particular doesn't exist, you'll be prompted to create it.
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}