// app/dashboard/project/[year]/components/PrintPreviewToolbar.tsx

"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, X, Save } from 'lucide-react';

interface PrintPreviewToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedTime: string;
  onBack: () => void;
  onClose: () => void;
  onSaveDraft?: () => void;
}

export function PrintPreviewToolbar({
  isDirty,
  isSaving,
  lastSavedTime,
  onBack,
  onClose,
  onSaveDraft,
}: PrintPreviewToolbarProps) {

  return (
    <div className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
      {/* Left: Back/Close */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div className="flex flex-col">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Print Preview Editor
          </span>
          {lastSavedTime && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isDirty ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              ) : (
                `Saved ${lastSavedTime}`
              )}
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Save Draft Button */}
        {onSaveDraft && (
          <Button
            onClick={onSaveDraft}
            variant="outline"
            size="sm"
            disabled={!isDirty || isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
        )}

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Close */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="w-8 h-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}