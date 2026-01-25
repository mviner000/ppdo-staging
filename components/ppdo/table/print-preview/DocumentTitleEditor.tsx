// components/ppdo/table/print-preview/DocumentTitleEditor.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DocumentTitleEditorProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  isEditorMode: boolean;
  isDirty?: boolean;
  className?: string;
}

export function DocumentTitleEditor({
  title,
  onTitleChange,
  isEditorMode,
  isDirty,
  className,
}: DocumentTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edit value when title prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(title);
    }
  }, [title, isEditing]);

  // Auto-focus and select when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();

    if (trimmedValue === "") {
      // Don't allow empty titles, revert to original
      setEditValue(title);
      setIsEditing(false);
      return;
    }

    if (trimmedValue !== title) {
      onTitleChange(trimmedValue);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
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

  const handleBlur = () => {
    // Save on blur
    handleSave();
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        maxLength={100}
        className={cn(
          "h-7 text-base font-semibold px-2 py-1 border-blue-500 focus-visible:ring-blue-500",
          className
        )}
        placeholder="Document title..."
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 group",
        className
      )}
    >
      <button
        onClick={() => isEditorMode && setIsEditing(true)}
        disabled={!isEditorMode}
        className={cn(
          "text-base font-semibold text-left px-2 py-1 rounded transition-colors",
          isEditorMode && "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-text",
          !isEditorMode && "cursor-default"
        )}
        title={isEditorMode ? "Click to edit title" : ""}
      >
        {title || "Untitled Document"}
      </button>
      {isEditorMode && (
        <span className="text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to edit
        </span>
      )}
    </div>
  );
}
