// app/dashboard/project/[year]/components/BudgetBulkToggleDialog.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Info } from "lucide-react";
import { useAccentColor } from "@/contexts/AccentColorContext";

interface BudgetBulkToggleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (autoCalculate: boolean, reason?: string) => void;
  selectedCount: number;
  isLoading?: boolean;
}

export function BudgetBulkToggleDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false,
}: BudgetBulkToggleDialogProps) {
  const { accentColorValue } = useAccentColor();
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(autoCalculate, reason.trim() || undefined);
    setReason("");
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Toggle Auto-Calculate Mode
          </DialogTitle>
          <DialogDescription>
            Update auto-calculation settings for {selectedCount} selected budget item{selectedCount !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mode Selection */}
          <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <div className="space-y-1">
              <Label htmlFor="auto-calculate-switch" className="text-sm font-medium">
                Auto-Calculate Budget Utilized
              </Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {autoCalculate 
                  ? "Budget utilized will be calculated from projects" 
                  : "You can enter budget utilized manually"}
              </p>
            </div>
            <Switch
              id="auto-calculate-switch"
              checked={autoCalculate}
              onCheckedChange={setAutoCalculate}
              disabled={isLoading}
            />
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium">What this does:</p>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                {autoCalculate ? (
                  <>
                    <li>Budget utilized will be automatically calculated from child projects</li>
                    <li>Manual input will be disabled</li>
                    <li>Status counts and obligated budget remain automatic</li>
                  </>
                ) : (
                  <>
                    <li>Budget utilized can be manually entered</li>
                    <li>Automatic calculation from projects will be disabled</li>
                    <li>Status counts and obligated budget remain automatic</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Optional Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for change <span className="text-xs text-zinc-500">(Optional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Historical data entry for 2024..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ backgroundColor: accentColorValue }}
            className="text-white"
          >
            {isLoading ? "Updating..." : `Update ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}