// app/dashboard/canvas/_components/editor/canvas.tsx

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Page, CanvasElement, ImageElement, HeaderFooter } from './types';
import { getPageDimensions, HEADER_HEIGHT, FOOTER_HEIGHT } from './constants';
import TextElementComponent from './text-element';
import ImageElementComponent from './image-element';
import HeaderFooterSection from './header-footer-section';

type ActiveSection = 'header' | 'page' | 'footer';

interface CanvasProps {
  page: Page;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  isEditingElementId?: string | null;
  onEditingChange?: (id: string | null) => void;
  header: HeaderFooter;
  footer: HeaderFooter;
  pageNumber: number;
  totalPages: number;
  activeSection: ActiveSection;
  onActiveSectionChange: (section: ActiveSection) => void;
}

export default function Canvas({
  page,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  isEditingElementId: externalIsEditingElementId = null,
  onEditingChange,
  header,
  footer,
  pageNumber,
  totalPages,
  activeSection,
  onActiveSectionChange,
}: CanvasProps) {
  console.group('📋 STEP 7: Canvas Component - Rendering');
  console.log('📄 Page data:', page);
  console.log('📄 Page elements count:', page?.elements?.length || 0);
  console.log('📄 Page size:', page?.size);
  console.log('📄 Page orientation:', page?.orientation);
  console.log('📄 Page background:', page?.backgroundColor);
  console.log('📄 Header elements:', header?.elements?.length || 0);
  console.log('📄 Footer elements:', footer?.elements?.length || 0);
  console.log('📄 Page number:', pageNumber);
  console.log('📄 Total pages:', totalPages);
  
  if (!page) {
    console.error('❌ CRITICAL: Page prop is undefined!');
  }
  if (!page?.elements || page.elements.length === 0) {
    console.warn('⚠️ WARNING: Page has no elements to render!');
  } else {
    console.log('✅ Page has', page.elements.length, 'elements to render');
    console.log('📄 First 3 elements:', page.elements.slice(0, 3));
  }
  
  console.groupEnd();
  const canvasRef = useRef<HTMLDivElement>(null);
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
  const [localIsEditingElementId, setLocalIsEditingElementId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
  const [croppingElementId, setCroppingElementId] = useState<string | null>(null);

  const isEditingElementId = externalIsEditingElementId ?? localIsEditingElementId;
  const size = getPageDimensions(page.size, page.orientation);

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();

    const element = page.elements.find((el) => el.id === elementId);
    
    if (element?.locked || element?.visible === false) {
      return;
    }

    if (isEditingElementId === elementId) {
      return;
    }

    onSelectElement(elementId);
    if (element && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
      setDraggedElementId(elementId);
    }
  };

  const handleImageResize = (elementId: string, handle: string, startX: number, startY: number) => {
    const element = page.elements.find((el) => el.id === elementId);
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
    if (draggedElementId && canvasRef.current && isEditingElementId !== draggedElementId && !croppingElementId) {
      const element = page.elements.find((el) => el.id === draggedElementId);
      if (element?.locked) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      if (element) {
        const bodyHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT;
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, size.width - element.width));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, bodyHeight - element.height));
        onUpdateElement(draggedElementId, { x: newX, y: newY });
      }
    }

    if (resizing) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const element = page.elements.find((el) => el.id === resizing.id);

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

      const bodyHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT;
      if (updates.x !== undefined && updates.width !== undefined) {
        if (updates.x + updates.width > size.width) {
          updates.x = size.width - updates.width;
        }
      }
      if (updates.y !== undefined && updates.height !== undefined) {
        if (updates.y + updates.height > bodyHeight) {
          updates.y = bodyHeight - updates.height;
        }
      }

      onUpdateElement(resizing.id, updates);
    }
  };

  const handleMouseUp = () => {
    setDraggedElementId(null);
    setResizing(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setContextMenu(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onActiveSectionChange('page');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = page.elements.find((el) => el.id === elementId);
    if (element?.type === 'image' && !element.locked) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId,
      });
    }
  };

  const startCrop = () => {
    if (contextMenu) {
      setCroppingElementId(contextMenu.elementId);
      setContextMenu(null);
    }
  };

  const handleCrop = (elementId: string, croppedSrc: string, newWidth: number, newHeight: number) => {
    onUpdateElement(elementId, {
      src: croppedSrc,
      width: newWidth,
      height: newHeight,
    });
    setCroppingElementId(null);
  };

  const cancelCrop = () => {
    setCroppingElementId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setCroppingElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const bodyHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT;

  return (
    <div className="-mb-(320px) relative bg-white shadow-lg transition-all duration-300">
      <HeaderFooterSection
        type="header"
        section={header}
        pageSize={page.size}
        orientation={page.orientation}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
        onUpdateElement={onUpdateElement}
        onDeleteElement={onDeleteElement}
        isEditingElementId={isEditingElementId}
        onEditingChange={onEditingChange}
        pageNumber={pageNumber}
        totalPages={totalPages}
        isActive={activeSection === 'header'}
        onActivate={() => onActiveSectionChange('header')}
      />

      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        className={`relative overflow-hidden transition-all ${
          activeSection === 'page' ? 'ring-2 ring-blue-400 ring-inset' : ''
        }`}
        style={{
          width: `${size.width}px`,
          height: `${bodyHeight}px`,
          backgroundColor: page.backgroundColor || '#ffffff',
        }}
      >
        {page.elements.map((element) => {
          if (element.visible === false) {
            return null;
          }
          
          if (element.type === 'text') {
            return (
              <TextElementComponent
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                isEditing={element.id === isEditingElementId}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDelete={() => onDeleteElement(element.id)}
                onUpdateText={(text) => onUpdateElement(element.id, { text })}
                onEditingChange={(isEditing) => {
                  if (onEditingChange) {
                    onEditingChange(isEditing ? element.id : null);
                  } else {
                    setLocalIsEditingElementId(isEditing ? element.id : null);
                  }
                }}
              />
            );
          } else if (element.type === 'image') {
            return (
              <ImageElementComponent
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId && !croppingElementId}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDelete={() => onDeleteElement(element.id)}
                onResize={(handle, startX, startY) => handleImageResize(element.id, handle, startX, startY)}
                onContextMenu={(e) => handleContextMenu(e, element.id)}
                isCropping={croppingElementId === element.id}
                onCrop={(croppedSrc, newWidth, newHeight) => handleCrop(element.id, croppedSrc, newWidth, newHeight)}
                onCancelCrop={cancelCrop}
              />
            );
          }
          return null;
        })}
      </div>

      <HeaderFooterSection
        type="footer"
        section={footer}
        pageSize={page.size}
        orientation={page.orientation}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
        onUpdateElement={onUpdateElement}
        onDeleteElement={onDeleteElement}
        isEditingElementId={isEditingElementId}
        onEditingChange={onEditingChange}
        pageNumber={pageNumber}
        totalPages={totalPages}
        isActive={activeSection === 'footer'}
        onActivate={() => onActiveSectionChange('footer')}
      />

      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={startCrop}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
          >
            Crop
          </button>
        </div>
      )}
    </div>
  );
}