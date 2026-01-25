// components/ppdo/table/implementing-office/components/CreateOfficeDialog.tsx

"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateOfficeDialogProps {
  open: boolean;
  type: "agency" | "department" | null;
  code: string;
  fullName: string;
  isCreating: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeChange: (code: string) => void;
  onFullNameChange: (fullName: string) => void;
  onCreate: () => void;
}

export function CreateOfficeDialog({
  open,
  type,
  code,
  fullName,
  isCreating,
  onOpenChange,
  onCodeChange,
  onFullNameChange,
  onCreate,
}: CreateOfficeDialogProps) {
  const isDepartment = type === "department";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Create New {isDepartment ? "Department" : "Implementing Agency"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new {isDepartment ? "department" : "implementing agency"}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">
              Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
              placeholder={isDepartment ? "e.g., HR_DEPT" : "e.g., TPH"}
              className="bg-white dark:bg-zinc-900"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isDepartment
                ? "Uppercase letters, numbers, and underscores only (no spaces)"
                : "Uppercase letters, numbers, spaces, and underscores"}
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder={
                isDepartment
                  ? "e.g., Human Resources Department"
                  : "e.g., Tarlac Provincial Hospital"
              }
              className="bg-white dark:bg-zinc-900"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onCreate}
            disabled={isCreating || !code || !fullName}
            className="bg-[#15803D] hover:bg-[#15803D]/90 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}