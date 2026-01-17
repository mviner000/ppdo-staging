// app/dashboard/particulars/_components/InlineEdit.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

export function InlineEdit({ value, onSave, onCancel }: InlineEditProps) {
  const [editValue, setEditValue] = useState(value);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    setHasChanges(editValue.trim() !== value.trim());
  }, [editValue, value]);

  const handleSave = () => {
    if (!hasChanges) {
      onCancel();
      return;
    }
    if (editValue.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onSave(editValue.trim());
    setShowConfirm(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 flex-1 py-0.5">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter name..."
          className="h-6 text-sm px-2 py-1 border-blue-500 focus-visible:ring-blue-500"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
          onClick={handleSave}
          disabled={!hasChanges || !editValue.trim()}
        >
          <Check className="h-3.5 w-3.5 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
          onClick={handleCancel}
        >
          <X className="h-3.5 w-3.5 text-red-600" />
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {hasChanges ? "Confirm Changes" : "Discard Changes"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasChanges
                ? "Are you sure you want to save these changes? This will update the record immediately."
                : "You have unsaved changes. Are you sure you want to discard them?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={hasChanges ? confirmSave : onCancel}>
              {hasChanges ? "Save Changes" : "Discard"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}