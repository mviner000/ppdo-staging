// app/dashboard/particulars/_components/ParticularDeleteDialog.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParticularDeleteDialogProps {
  type: "budget" | "project";
  particular: {
    _id: Id<"budgetParticulars"> | Id<"projectParticulars">;
    code: string;
    fullName: string;
    usageCount?: number;
    projectUsageCount?: number;
    isSystemDefault?: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ParticularDeleteDialog({
  type,
  particular,
  open,
  onOpenChange,
  onSuccess,
}: ParticularDeleteDialogProps) {
  const deleteBudgetParticular = useMutation(api.budgetParticulars.remove);
  const deleteProjectParticular = useMutation(api.projectParticulars.remove);

  const [isDeleting, setIsDeleting] = useState(false);

  const totalUsage =
    (particular.usageCount || 0) + (particular.projectUsageCount || 0);
  const canDelete = !particular.isSystemDefault && totalUsage === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);

    try {
      if (type === "budget") {
        await deleteBudgetParticular({
          id: particular._id as Id<"budgetParticulars">,
        });
        toast.success(`Budget particular "${particular.code}" deleted successfully`);
      } else {
        await deleteProjectParticular({
          id: particular._id as Id<"projectParticulars">,
        });
        toast.success(`Project particular "${particular.code}" deleted successfully`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to delete particular:", error);
      toast.error(error.message || "Failed to delete particular");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Particular
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{particular.code}</strong> -{" "}
            {particular.fullName}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          {/* System Default Warning */}
          {particular.isSystemDefault && (
            <Alert variant="destructive">
              <AlertDescription>
                This is a <strong>system default</strong> particular and cannot be
                deleted. You can deactivate it instead.
              </AlertDescription>
            </Alert>
          )}

          {/* Usage Count Warning */}
          {!particular.isSystemDefault && totalUsage > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                This particular is currently in use by:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {type === "budget" && particular.usageCount! > 0 && (
                    <li>
                      <strong>{particular.usageCount}</strong> Budget Item(s)
                    </li>
                  )}
                  {particular.projectUsageCount! > 0 && (
                    <li>
                      <strong>{particular.projectUsageCount}</strong> Project(s)
                    </li>
                  )}
                </ul>
                <p className="mt-2">
                  Remove all references before deleting this particular.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Safe to delete */}
          {canDelete && (
            <Alert>
              <AlertDescription>
                This particular is not in use and can be safely deleted. This action
                cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}