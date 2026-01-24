/**
 * Table Style Panel Component
 * Draggable panel that displays table style options and applies them to selected table groups
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Palette } from 'lucide-react';
import { TABLE_STYLES } from './constants/table-styles';
import TableStylePreview from './table-style-preview';

interface TableStylePanelProps {
  isOpen: boolean;
  selectedGroupId: string | null;
  appliedStyleId?: string;
  onApplyStyle: (styleId: string) => void;
  onClose: () => void;
}

export default function TableStylePanel({
  isOpen,
  selectedGroupId,
  appliedStyleId,
  onApplyStyle,
  onClose,
}: TableStylePanelProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Position the panel on initial open
  useEffect(() => {
    if (isOpen && !isPositioned && typeof window !== 'undefined') {
      // Position to the left of where LayerPanel would be
      setPosition({
        x: Math.max(20, window.innerWidth - 300 - 280 - 20), // Left of LayerPanel
        y: 100,
      });
      setIsPositioned(true);
    }
  }, [isOpen, isPositioned]);

  // Handle panel dragging
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on a button
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 280));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen || !selectedGroupId) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white border border-stone-300 rounded-lg shadow-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        maxHeight: '500px',
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-stone-100 border-b border-stone-300 rounded-t-lg cursor-move select-none"
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-stone-600" />
          <span className="text-sm font-semibold text-stone-900">Table Styles</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-stone-200 rounded transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4 text-stone-600" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: '420px' }}>
        {/* Info text */}
        <div className="text-xs text-stone-600 mb-3 px-1">
          Select a style to apply to the table
        </div>

        {/* Style Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {TABLE_STYLES.map((style) => (
            <TableStylePreview
              key={style.id}
              style={style}
              isSelected={appliedStyleId === style.id}
              onSelect={onApplyStyle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
