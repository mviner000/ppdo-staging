// app/(extra)/canvas/_components/editor/text-element.tsx (UPDATED - Data attributes)

'use client';

import React from "react"
import { useState } from 'react';
import { X } from 'lucide-react';
import { TextElement } from "../editor";

interface TextElementComponentProps {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onEditingChange: (isEditing: boolean) => void;
}

export default function TextElementComponent({
  element,
  isSelected,
  isEditing,
  onMouseDown,
  onDelete,
  onUpdateText,
  onEditingChange,
}: TextElementComponentProps) {
  const [editText, setEditText] = useState(element.text);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isEditingLocal, setIsEditingLocal] = useState(isEditing);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
    setEditText(element.text);
    setIsEditingLocal(isEditing);
  }, [isEditing, element.text]);

  const handleDoubleClick = () => {
    if (element.locked) return;
    setIsEditingLocal(true);
    onEditingChange(true);
  };

  const handleBlur = () => {
    onUpdateText(editText || 'Edit text');
    setIsEditingLocal(false);
    onEditingChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditingLocal(false);
      onEditingChange(false);
    }
  };

  const getTextStyles = () => {
    const styles: React.CSSProperties = {
      fontSize: `${element.fontSize}px`,
      fontWeight: element.bold ? 700 : 400,
      fontStyle: element.italic ? 'italic' : 'normal',
      textDecoration: element.underline ? 'underline' : 'none',
      color: element.color,
      backgroundColor: element.backgroundColor,
      textShadow: element.shadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
      WebkitTextStroke: element.outline ? '0.5px rgba(0,0,0,0.5)' : 'none',
    };

    const googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
    if (googleFonts.includes(element.fontFamily)) {
      styles.fontFamily = `'${element.fontFamily}', sans-serif`;
    } else if (element.fontFamily === 'font-serif') {
      styles.fontFamily = 'Georgia, serif';
    } else if (element.fontFamily === 'font-mono') {
      styles.fontFamily = 'monospace';
    } else if (element.fontFamily.includes('light')) {
      styles.fontWeight = 300;
      styles.fontFamily = 'sans-serif';
    } else if (element.fontFamily.includes('bold')) {
      styles.fontWeight = 700;
      styles.fontFamily = 'sans-serif';
    } else {
      styles.fontFamily = 'sans-serif';
    }

    return styles;
  };

  return (
    <div
      data-element-type="text"
      data-element-id={element.id}
      onMouseDown={onMouseDown}
      className={`absolute ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${element.locked ? 'cursor-not-allowed opacity-70' : ''} transition-all cursor-move`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        minHeight: `${element.height}px`,
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full p-1 border border-blue-500 rounded resize-none focus:outline-none"
          style={getTextStyles()}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          onClick={(e) => e.stopPropagation()}
          className={`w-full h-full p-1 break-words whitespace-pre-wrap ${
            isSelected ? 'bg-blue-50' : ''
          }`}
          style={getTextStyles()}
        >
          {element.text}
        </div>
      )}

      {isSelected && !element.locked && (
        <>
          <div
            className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-nwse-resize rounded-sm"
            onMouseDown={(e) => {
              e.stopPropagation();
              onMouseDown(e);
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-6 -right-6 bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
            title="Delete element"
          >
            <X className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
}