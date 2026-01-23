// app/dashboard/canvas/_components/editor/image-element.tsx

'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ImageElement } from '../editor';

interface ImageElementComponentProps {
  element: ImageElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onResize: (handle: string, startX: number, startY: number) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isCropping: boolean;
  onCrop?: (croppedSrc: string, newWidth: number, newHeight: number) => void;
  onCancelCrop?: () => void;
}

export default function ImageElementComponent({
  element,
  isSelected,
  onMouseDown,
  onDelete,
  onResize,
  onContextMenu,
  isCropping,
  onCrop,
  onCancelCrop,
}: ImageElementComponentProps) {
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: element.width,
    height: element.height,
  });
  const [cropDragging, setCropDragging] = useState<{
    handle: string;
    startX: number;
    startY: number;
    startCropRect: typeof cropRect;
  } | null>(null);

  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setCropDragging({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCropRect: { ...cropRect },
    });
  };

  const handleCropMouseMove = (e: MouseEvent) => {
    if (!cropDragging) return;

    const deltaX = e.clientX - cropDragging.startX;
    const deltaY = e.clientY - cropDragging.startY;
    const { startCropRect } = cropDragging;
    let newRect = { ...startCropRect };

    switch (cropDragging.handle) {
      case 'nw':
        newRect.x = Math.max(0, Math.min(startCropRect.x + deltaX, startCropRect.x + startCropRect.width - 20));
        newRect.y = Math.max(0, Math.min(startCropRect.y + deltaY, startCropRect.y + startCropRect.height - 20));
        newRect.width = startCropRect.width - (newRect.x - startCropRect.x);
        newRect.height = startCropRect.height - (newRect.y - startCropRect.y);
        break;
      case 'ne':
        newRect.y = Math.max(0, Math.min(startCropRect.y + deltaY, startCropRect.y + startCropRect.height - 20));
        newRect.width = Math.max(20, Math.min(startCropRect.width + deltaX, element.width - startCropRect.x));
        newRect.height = startCropRect.height - (newRect.y - startCropRect.y);
        break;
      case 'sw':
        newRect.x = Math.max(0, Math.min(startCropRect.x + deltaX, startCropRect.x + startCropRect.width - 20));
        newRect.width = startCropRect.width - (newRect.x - startCropRect.x);
        newRect.height = Math.max(20, Math.min(startCropRect.height + deltaY, element.height - startCropRect.y));
        break;
      case 'se':
        newRect.width = Math.max(20, Math.min(startCropRect.width + deltaX, element.width - startCropRect.x));
        newRect.height = Math.max(20, Math.min(startCropRect.height + deltaY, element.height - startCropRect.y));
        break;
      case 'n':
        newRect.y = Math.max(0, Math.min(startCropRect.y + deltaY, startCropRect.y + startCropRect.height - 20));
        newRect.height = startCropRect.height - (newRect.y - startCropRect.y);
        break;
      case 's':
        newRect.height = Math.max(20, Math.min(startCropRect.height + deltaY, element.height - startCropRect.y));
        break;
      case 'w':
        newRect.x = Math.max(0, Math.min(startCropRect.x + deltaX, startCropRect.x + startCropRect.width - 20));
        newRect.width = startCropRect.width - (newRect.x - startCropRect.x);
        break;
      case 'e':
        newRect.width = Math.max(20, Math.min(startCropRect.width + deltaX, element.width - startCropRect.x));
        break;
    }

    setCropRect(newRect);
  };

  const handleCropMouseUp = () => {
    setCropDragging(null);
  };

  React.useEffect(() => {
    if (cropDragging) {
      window.addEventListener('mousemove', handleCropMouseMove);
      window.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [cropDragging]);

  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scaleX = img.naturalWidth / element.width;
      const scaleY = img.naturalHeight / element.height;

      canvas.width = cropRect.width * scaleX;
      canvas.height = cropRect.height * scaleY;

      ctx.drawImage(
        img,
        cropRect.x * scaleX,
        cropRect.y * scaleY,
        cropRect.width * scaleX,
        cropRect.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const croppedSrc = canvas.toDataURL('image/png');
      onCrop?.(croppedSrc, cropRect.width, cropRect.height);
    };
    img.src = element.src;
  };

  if (isCropping) {
    return (
      <div
        className="absolute"
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
        }}
      >
        <img
          src={element.src || "/placeholder.svg"}
          alt="Crop"
          draggable={false}
          className="w-full h-full object-contain"
          style={{ pointerEvents: 'none' }}
        />

        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />

        <div
          className="absolute border-2 border-blue-500 bg-transparent"
          style={{
            left: `${cropRect.x}px`,
            top: `${cropRect.y}px`,
            width: `${cropRect.width}px`,
            height: `${cropRect.height}px`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={element.src || "/placeholder.svg"}
              alt="Crop preview"
              draggable={false}
              className="absolute object-contain"
              style={{
                left: `-${cropRect.x}px`,
                top: `-${cropRect.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                pointerEvents: 'none',
              }}
            />
          </div>

          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nwse-resize" onMouseDown={(e) => handleCropMouseDown(e, 'nw')} />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-ns-resize" onMouseDown={(e) => handleCropMouseDown(e, 'n')} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-nesw-resize" onMouseDown={(e) => handleCropMouseDown(e, 'ne')} />
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 cursor-ew-resize" onMouseDown={(e) => handleCropMouseDown(e, 'w')} />
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 cursor-ew-resize" onMouseDown={(e) => handleCropMouseDown(e, 'e')} />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-nesw-resize" onMouseDown={(e) => handleCropMouseDown(e, 'sw')} />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-ns-resize" onMouseDown={(e) => handleCropMouseDown(e, 's')} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-nwse-resize" onMouseDown={(e) => handleCropMouseDown(e, 'se')} />
        </div>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={applyCrop}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Apply
          </button>
          <button
            onClick={onCancelCrop}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      className={`absolute ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${element.locked ? 'cursor-not-allowed opacity-70' : ''} transition-all cursor-move`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
    >
      <img
        src={element.src || "/placeholder.svg"}
        alt="Canvas element"
        draggable={false}
        className={`w-full h-full object-contain ${
          isSelected ? 'opacity-90' : ''
        }`}
        style={{ pointerEvents: 'none' }}
      />

      {isSelected && !element.locked && (
        <>
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nwse-resize rounded-sm"
            data-handle="nw"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('nw', e.clientX, e.clientY);
            }}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-nesw-resize rounded-sm"
            data-handle="ne"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('ne', e.clientX, e.clientY);
            }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-nesw-resize rounded-sm"
            data-handle="sw"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('sw', e.clientX, e.clientY);
            }}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-nwse-resize rounded-sm"
            data-handle="se"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('se', e.clientX, e.clientY);
            }}
          />

          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-ns-resize rounded-sm"
            data-handle="n"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('n', e.clientX, e.clientY);
            }}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-ns-resize rounded-sm"
            data-handle="s"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('s', e.clientX, e.clientY);
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 cursor-ew-resize rounded-sm"
            data-handle="w"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('w', e.clientX, e.clientY);
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 cursor-ew-resize rounded-sm"
            data-handle="e"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResize('e', e.clientX, e.clientY);
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
