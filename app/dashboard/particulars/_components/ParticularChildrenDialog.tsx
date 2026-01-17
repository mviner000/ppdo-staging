// app/dashboard/particulars/_components/ParticularChildrenDialog.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, FolderKanban, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParticularChildrenDialogProps {
  type: "budget" | "project";
  particularCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParticularChildrenDialog({
  type,
  particularCode,
  open,
  onOpenChange,
}: ParticularChildrenDialogProps) {
  // Fetch budget items or projects based on type
  const budgetItems = useQuery(
    api.budgetItems.list,
    type === "budget" ? {} : "skip"
  );
  
  const projects = useQuery(
    api.projects.list,
    type === "project" ? {} : "skip"
  );

  // Filter items by particular code
  const childrenItems =
    type === "budget"
      ? budgetItems?.filter((item) => item.particulars === particularCode)
      : projects?.filter((project) => project.particulars === particularCode);

  const isLoading = type === "budget" ? budgetItems === undefined : projects === undefined;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "budget" ? (
              <FileText className="h-5 w-5" />
            ) : (
              <FolderKanban className="h-5 w-5" />
            )}
            {type === "budget" ? "Budget Items" : "Projects"} using{" "}
            <Badge variant="outline">{particularCode}</Badge>
          </DialogTitle>
          <DialogDescription>
            List of all {type === "budget" ? "budget items" : "projects"} that
            reference this particular
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : childrenItems && childrenItems.length > 0 ? (
            <div className="space-y-3">
              {childrenItems.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {type === "budget" ? item.particulars : item.particulars}
                      </h4>
                      {type === "project" && "implementingOffice" in item && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.implementingOffice}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {formatCurrency(item.totalBudgetAllocated)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.utilizationRate.toFixed(1)}% utilized
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {item.status && (
                    <div className="mt-2">
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "delayed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No {type === "budget" ? "budget items" : "projects"} are currently
                using this particular.
              </AlertDescription>
            </Alert>
          )}
        </ScrollArea>

        {childrenItems && childrenItems.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Total: <strong>{childrenItems.length}</strong>{" "}
              {type === "budget" ? "budget item(s)" : "project(s)"}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}