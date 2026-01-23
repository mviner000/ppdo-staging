// app/dashboard/canvas/_components/editor/header-footer-section.tsx

'use client';

import React, { useRef, useState } from 'react';
import { HeaderFooter, CanvasElement, ImageElement } from './types';
import { getPageDimensions, HEADER_HEIGHT, FOOTER_HEIGHT } from './constants';
import TextElementComponent from './text-element';
import ImageElementComponent from './image-element';

interface HeaderFooterSectionProps {
  type: 'header' | 'footer';
  section: HeaderFooter;
  pageSize: 'A4' | 'Short' | 'Long';
  orientation: 'portrait' | 'landscape';
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  isEditingElementId?: string | null;
  onEditingChange?: (id: string | null) => void;
  pageNumber?: number;
  totalPages?: number;
  isActive: boolean;
  onActivate: () => void;
}

export default function HeaderFooterSection({
  type,
  section,
  pageSize,
  orientation,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  isEditingElementId = null,
  onEditingChange,
  pageNumber = 1,
  totalPages = 1,
  isActive,
  onActivate,
}: HeaderFooterSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<{
    id: string;
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
    aspectRatio: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  const size = getPageDimensions(pageSize, orientation);
  const sectionHeight = type === 'header' ? HEADER_HEIGHT : FOOTER_HEIGHT;

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = section.elements.find((el) => el.id === elementId);
    
    if (element?.locked || element?.visible === false) {
      return;
    }

    if (isEditingElementId === elementId) {
      return;
    }

    onSelectElement(elementId);
    if (element && sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
      setDraggedElementId(elementId);
    }
  };

  const handleImageResize = (elementId: string, handle: string, startX: number, startY: number) => {
    const element = section.elements.find((el) => el.id === elementId);
    if (element && element.type === 'image' && !element.locked) {
      setResizing({
        id: elementId,
        handle,
        startX,
        startY,
        startWidth: element.width,
        startHeight: element.height,
        startElementX: element.x,
        startElementY: element.y,
        aspectRatio: element.height / element.width,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedElementId && sectionRef.current && isEditingElementId !== draggedElementId) {
      const element = section.elements.find((el) => el.id === draggedElementId);
      if (element?.locked) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      if (element) {
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, size.width - element.width));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, sectionHeight - element.height));
        onUpdateElement(draggedElementId, { x: newX, y: newY });
      }
    }

    if (resizing) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const element = section.elements.find((el) => el.id === resizing.id);
      if (!element || element.type !== 'image' || element.locked) return;

      let updates: Partial<ImageElement> = {};
      switch (resizing.handle) {
        case 'nw': {
          const newWidth = Math.max(40, resizing.startWidth - deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            x: resizing.startElementX + (resizing.startWidth - newWidth),
            y: resizing.startElementY + (resizing.startHeight - newHeight),
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'ne': {
          const newWidth = Math.max(40, resizing.startWidth + deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            y: resizing.startElementY + (resizing.startHeight - newHeight),
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'sw': {
          const newWidth = Math.max(40, resizing.startWidth - deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            x: resizing.startElementX + (resizing.startWidth - newWidth),
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'se': {
          const newWidth = Math.max(40, resizing.startWidth + deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'n':
          updates = {
            y: Math.max(0, resizing.startElementY + deltaY),
            height: Math.max(40, resizing.startHeight - deltaY),
          };
          break;
        case 's':
          updates = {
            height: Math.max(40, resizing.startHeight + deltaY),
          };
          break;
        case 'w':
          updates = {
            x: Math.max(0, resizing.startElementX + deltaX),
            width: Math.max(40, resizing.startWidth - deltaX),
          };
          break;
        case 'e':
          updates = {
            width: Math.max(40, resizing.startWidth + deltaX),
          };
          break;
      }

      if (updates.x !== undefined && updates.width !== undefined) {
        if (updates.x + updates.width > size.width) {
          updates.x = size.width - updates.width;
        }
      }
      if (updates.y !== undefined && updates.height !== undefined) {
        if (updates.y + updates.height > sectionHeight) {
          updates.y = sectionHeight - updates.height;
        }
      }

      onUpdateElement(resizing.id, updates);
    }
  };

  const handleMouseUp = () => {
    setDraggedElementId(null);
    setResizing(null);
  };

  const handleSectionClick = (e: React.MouseEvent) => {
    if (e.target === sectionRef.current) {
      onSelectElement(null);
      setContextMenu(null);
    }
  };

  const handleSectionDoubleClick = (e: React.MouseEvent) => {
    if (e.target === sectionRef.current) {
      onActivate();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = section.elements.find((el) => el.id === elementId);
    if (element?.type === 'image' && !element.locked) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId,
      });
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const processDynamicText = (text: string): string => {
    return text
      .replace(/{{pageNumber}}/g, pageNumber.toString())
      .replace(/{{totalPages}}/g, totalPages.toString());
  };

  return (
    <div
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleSectionClick}
      onDoubleClick={handleSectionDoubleClick}
      className={`relative border-b border-gray-200 transition-all cursor-pointer ${
        isActive ? 'ring-2 ring-blue-400 ring-inset' : 'hover:bg-gray-100'
      }`}
      style={{
        width: `${size.width}px`,
        height: `${sectionHeight}px`,
        backgroundColor: section.backgroundColor || '#ffffff',
      }}
      title={`Double-click to edit ${type}`}
    >
      {section.elements.map((element) => {
        if (element.visible === false) {
          return null;
        }
        if (element.type === 'text') {
          const displayText = type === 'footer' ? processDynamicText(element.text) : element.text;
          const modifiedElement = { ...element, text: displayText };
          
          return (
            <TextElementComponent
              key={element.id}
              element={modifiedElement}
              isSelected={element.id === selectedElementId}
              isEditing={element.id === isEditingElementId}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onDelete={() => onDeleteElement(element.id)}
              onUpdateText={(text) => onUpdateElement(element.id, { text })}
              onEditingChange={(isEditing) => {
                if (onEditingChange) {
                  onEditingChange(isEditing ? element.id : null);
                }
              }}
            />
          );
        } else if (element.type === 'image') {
          return (
            <ImageElementComponent
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onDelete={() => onDeleteElement(element.id)}
              onResize={(handle, startX, startY) => handleImageResize(element.id, handle, startX, startY)}
              onContextMenu={(e) => handleContextMenu(e, element.id)}
              isCropping={false}
            />
          );
        }
        return null;
      })}

      {/* Visual hint when section is empty */}
      {section.elements.length === 0 && !isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-400">
            Double-click to add {type} content
          </span>
        </div>
      )}
    </div>
  );
}