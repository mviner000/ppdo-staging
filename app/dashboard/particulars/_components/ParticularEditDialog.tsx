// app/dashboard/particulars/_components/ParticularEditDialog.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ParticularEditDialogProps {
  type: "budget" | "project";
  particular: {
    _id: Id<"budgetParticulars"> | Id<"projectParticulars">;
    code: string;
    fullName: string;
    description?: string;
    displayOrder?: number;
    category?: string;
    colorCode?: string;
    notes?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ParticularEditDialog({
  type,
  particular,
  open,
  onOpenChange,
  onSuccess,
}: ParticularEditDialogProps) {
  const [fullName, setFullName] = useState(particular.fullName);
  const [description, setDescription] = useState(particular.description || "");
  const [displayOrder, setDisplayOrder] = useState(
    particular.displayOrder?.toString() || ""
  );
  const [category, setCategory] = useState(particular.category || "");
  const [notes, setNotes] = useState(particular.notes || "");

  const updateBudgetParticular = useMutation(api.budgetParticulars.update);
  const updateProjectParticular = useMutation(api.projectParticulars.update);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        id: particular._id as any,
        fullName: fullName.trim(),
        description: description.trim() || undefined,
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (type === "budget") {
        await updateBudgetParticular(updateData);
        toast.success("Budget particular updated successfully");
      } else {
        await updateProjectParticular(updateData);
        toast.success("Project particular updated successfully");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to update particular:", error);
      toast.error(error.message || "Failed to update particular");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Particular</DialogTitle>
            <DialogDescription>
              Update the details for <strong>{particular.code}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Code (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={particular.code}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500">
                Code cannot be changed after creation
              </p>
            </div>

            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Gender and Development"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            {/* Display Order */}
            <div className="grid gap-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="e.g., 1, 2, 3..."
                min="0"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Social Development"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}