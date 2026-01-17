// app/dashboard/particulars/_components/ParticularDetailModal.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2 } from "lucide-react";
import { ParticularDetailView } from "./ParticularDetailView";

type NodeType = "budget" | "project" | "breakdown";

interface ParticularDetailModalProps {
  type: NodeType;
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (type: NodeType, item: any) => void;
  onDelete?: (type: NodeType, item: any) => void;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "delayed":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "ongoing":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

export function ParticularDetailModal({
  type,
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ParticularDetailModalProps) {
  const getTitle = () => {
    if (type === "budget") return item.fullName || "Budget Particular";
    if (type === "project") return item.particulars || "Project";
    return item.projectName || "Project Breakdown";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="capitalize">
                  {type}
                </Badge>
                {item.status && (
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                )}
                {type === "budget" && item.code && (
                  <Badge variant="outline" className="font-mono">
                    {item.code}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl break-words">{getTitle()}</DialogTitle>
              <DialogDescription className="mt-1">
                View complete details and manage this {type}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(type, item);
                    onOpenChange(false);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (type === "budget" || type === "project") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDelete(type, item);
                    onOpenChange(false);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6">
            <ParticularDetailView type={type} item={item} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}