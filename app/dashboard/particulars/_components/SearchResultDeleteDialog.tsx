// app/dashboard/particulars/_components/SearchResultDeleteDialog.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type NodeType = "budget" | "project" | "breakdown";

interface SearchResultDeleteDialogProps {
  type: NodeType;
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SearchResultDeleteDialog({
  type,
  item,
  open,
  onOpenChange,
  onSuccess,
}: SearchResultDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Queries to get affected counts
  const projects = useQuery(
    api.projects.list,
    type === "budget" ? {} : "skip"
  );
  
  const breakdowns = useQuery(
    api.govtProjects.getProjectBreakdowns,
    type === "project" ? {} : "skip"
  );

  // Mutations
  const deleteBudgetParticular = useMutation(api.budgetParticulars.remove);
  const deleteProjectParticular = useMutation(api.projectParticulars.remove);

  // Calculate affected items
  const affectedCounts = (() => {
    if (type === "budget") {
      const relatedProjects = projects?.filter(
        (p) => p.particulars === item.code && !p.isDeleted
      ) || [];
      
      const relatedBreakdowns = relatedProjects.reduce((count, project) => {
        const projectBreakdowns = breakdowns?.filter(
          (b) => b.projectId === project._id && !b.isDeleted
        ) || [];
        return count + projectBreakdowns.length;
      }, 0);

      return {
        projects: relatedProjects.length,
        breakdowns: relatedBreakdowns,
      };
    }

    if (type === "project") {
      const relatedBreakdowns = breakdowns?.filter(
        (b) => b.projectId === item._id && !b.isDeleted
      ) || [];

      return {
        projects: 0,
        breakdowns: relatedBreakdowns.length,
      };
    }

    return { projects: 0, breakdowns: 0 };
  })();

  const totalAffected = affectedCounts.projects + affectedCounts.breakdowns;
  const canDelete = type === "breakdown" || totalAffected === 0;

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("Cannot delete - remove all related items first");
      return;
    }

    setIsDeleting(true);

    try {
      if (type === "budget") {
        await deleteBudgetParticular({
          id: item._id as Id<"budgetParticulars">,
        });
        toast.success(`Budget particular "${item.code}" deleted successfully`);
      } else if (type === "project") {
        await deleteProjectParticular({
          id: item._id as Id<"projectParticulars">,
        });
        toast.success(`Project particular deleted successfully`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const getItemName = () => {
    if (type === "budget") return item.fullName || item.code;
    if (type === "project") return item.particulars;
    return item.projectName;
  };

  const isLoading = 
    (type === "budget" && projects === undefined) ||
    (type === "project" && breakdowns === undefined);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete {type === "budget" ? "Budget Particular" : type === "project" ? "Project Particular" : "Breakdown"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {type}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {type}
                  </Badge>
                  {type === "budget" && item.code && (
                    <Badge variant="outline" className="font-mono">
                      {item.code}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-lg">{getItemName()}</p>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* System Default Warning */}
              {item.isSystemDefault && (
                <Alert variant="destructive">
                  <AlertDescription>
                    This is a <strong>system default</strong> {type} and cannot be deleted.
                    You can deactivate it instead.
                  </AlertDescription>
                </Alert>
              )}

              {/* Affected Items Warning */}
              {!item.isSystemDefault && totalAffected > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-semibold">
                        This {type} is currently in use and cannot be deleted.
                      </p>
                      
                      <Separator />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Affected items that will be deleted:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {affectedCounts.projects > 0 && (
                            <li>
                              <strong>{affectedCounts.projects}</strong> Project{affectedCounts.projects !== 1 ? 's' : ''}
                            </li>
                          )}
                          {affectedCounts.breakdowns > 0 && (
                            <li>
                              <strong>{affectedCounts.breakdowns}</strong> Project Breakdown{affectedCounts.breakdowns !== 1 ? 's' : ''}
                            </li>
                          )}
                        </ul>
                        <p className="text-sm font-medium mt-3 text-red-600">
                          Total: <strong>{totalAffected}</strong> item{totalAffected !== 1 ? 's' : ''} will be permanently deleted
                        </p>
                      </div>

                      <Separator />

                      <p className="text-sm">
                        Please remove all references before deleting this {type}.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Safe to Delete */}
              {!item.isSystemDefault && canDelete && type !== "breakdown" && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This {type} is not in use and can be safely deleted. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              )}

              {/* Breakdown Delete */}
              {type === "breakdown" && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This breakdown will be permanently deleted. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              )}

              {/* Cascade Delete Warning */}
              {totalAffected > 0 && (
                <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-900 dark:text-orange-100">
                    <p className="font-semibold mb-2">⚠️ Cascade Delete Warning</p>
                    <p className="text-sm">
                      Deleting this {type} will also permanently delete all {totalAffected} related item{totalAffected !== 1 ? 's' : ''}.
                      This includes all child projects and breakdowns.
                    </p>
                    <p className="text-sm font-semibold mt-2">
                      This action CANNOT be undone!
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </>
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
            disabled={!canDelete || isDeleting || isLoading || item.isSystemDefault}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {totalAffected > 0 ? `Delete (${totalAffected} items)` : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}