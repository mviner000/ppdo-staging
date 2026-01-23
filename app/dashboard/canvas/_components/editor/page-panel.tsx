// app/dashboard/canvas/_components/editor/page-panel.tsx

'use client';

import React from "react"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Page } from "../editor";
import { getPageDimensions } from './constants';

interface PagePanelProps {
  pages: Page[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

export default function PagePanel({
  pages,
  currentPageIndex,
  onPageSelect,
  onAddPage,
  onReorderPages,
}: PagePanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorderPages(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="fixed right-0 top-44 bottom-20 w-48 bg-stone-50 border-l border-stone-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {pages.map((page, index) => {
            const size = getPageDimensions(page.size, page.orientation);
            const aspectRatio = size.height / size.width;
            const thumbnailWidth = 160;
            const thumbnailHeight = thumbnailWidth * aspectRatio;
            const scale = thumbnailWidth / size.width;

            const isActive = index === currentPageIndex;
            const isDragging = index === draggedIndex;
            const isDropTarget = index === dragOverIndex;

            return (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => onPageSelect(index)}
                className={`
                  relative overflow-hidden rounded cursor-pointer transition-all
                  ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
                  ${isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:bg-stone-100'}
                  ${isDropTarget ? 'ring-2 ring-blue-300' : ''}
                `}
                style={{
                  width: `${thumbnailWidth}px`,
                  height: `${thumbnailHeight}px`,
                }}
              >
                {isDropTarget && draggedIndex !== null && draggedIndex < index && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
                )}
                {isDropTarget && draggedIndex !== null && draggedIndex > index && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
                )}

                <div
                  className="absolute top-0 left-0 bg-white border border-stone-200"
                  style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {page.elements.map((element) => {
                    // Skip hidden elements in thumbnail
                    if (element.visible === false) return null;
                    
                    if (element.type === 'text') {
                      return (
                        <div
                          key={element.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            fontSize: `${element.fontSize}px`,
                            fontFamily: element.fontFamily,
                            fontWeight: element.bold ? 'bold' : 'normal',
                            fontStyle: element.italic ? 'italic' : 'normal',
                            textDecoration: element.underline ? 'underline' : 'none',
                            color: element.color,
                            textShadow: element.shadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                            WebkitTextStroke: element.outline ? '1px black' : 'none',
                            overflow: 'hidden',
                            wordWrap: 'break-word',
                          }}
                        >
                          {element.text}
                        </div>
                      );
                    } else if (element.type === 'image') {
                      return (
                        <img
                          key={element.id}
                          src={element.src || "/placeholder.svg"}
                          alt=""
                          className="absolute pointer-events-none object-contain"
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                </div>

                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-white/90 rounded text-xs font-medium text-stone-600 border border-stone-200">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-stone-200 p-3">
        <Button
          onClick={onAddPage}
          size="sm"
          className="w-full gap-2 bg-transparent"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </Button>
      </div>
    </div>
  );
}