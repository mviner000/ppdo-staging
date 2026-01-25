// components/ppdo/table/print-preview/PrintPreviewToolbar.tsx

"use client";

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Save, Palette, Ruler } from 'lucide-react';
import { DocumentTitleEditor } from './DocumentTitleEditor';

interface PrintPreviewToolbarProps {
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedTime: string;
  onBack: () => void;
  onClose: () => void;
  onSaveDraft?: () => void;
  onApplyTemplate?: () => void;
  isEditorMode: boolean;
  onEditorModeChange: (enabled: boolean) => void;
  rulerVisible?: boolean;
  onToggleRuler?: () => void;
  pageOrientation?: 'portrait' | 'landscape';
  pageSize?: string;
}

export function PrintPreviewToolbar({
  documentTitle,
  onTitleChange,
  isDirty,
  isSaving,
  lastSavedTime,
  onBack,
  onClose,
  onSaveDraft,
  onApplyTemplate,
  isEditorMode,
  onEditorModeChange,
  rulerVisible = false,
  onToggleRuler,
  pageOrientation = 'portrait',
  pageSize = 'A4',
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
          <DocumentTitleEditor
            title={documentTitle}
            onTitleChange={onTitleChange}
            isEditorMode={isEditorMode}
            isDirty={isDirty}
          />
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
        {/* Editor Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <Label htmlFor="editor-mode" className="text-xs font-medium cursor-pointer">
            Editor Mode
          </Label>
          <Switch
            id="editor-mode"
            checked={isEditorMode}
            onCheckedChange={onEditorModeChange}
          />
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Ruler Toggle Button */}
        {onToggleRuler && (
          <Button
            onClick={onToggleRuler}
            variant="outline"
            size="sm"
            className={`gap-2 ${rulerVisible ? 'bg-stone-200' : ''}`}
            title="Toggle Ruler (Ctrl+Shift+R)"
          >
            <Ruler className="w-4 h-4" />
            Ruler
          </Button>
        )}

        {/* Apply Template Button - Only in editor mode */}
        {isEditorMode && onApplyTemplate && (
          <Button
            onClick={onApplyTemplate}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Palette className="w-4 h-4" />
            Apply Template
          </Button>
        )}

        {/* Save Draft Button - Only in editor mode */}
        {isEditorMode && onSaveDraft && (
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