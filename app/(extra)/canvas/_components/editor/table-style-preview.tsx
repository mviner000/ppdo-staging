/**
 * Table Style Preview Card Component
 * Displays a preview of a table style with click-to-apply functionality
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TableStyle } from './types/table-style';
import { Check } from 'lucide-react';

interface TableStylePreviewProps {
  style: TableStyle;
  isSelected: boolean;
  onSelect: (styleId: string) => void;
}

export default function TableStylePreview({
  style,
  isSelected,
  onSelect,
}: TableStylePreviewProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg'
          : 'hover:ring-1 hover:ring-stone-300'
      }`}
      onClick={() => onSelect(style.id)}
    >
      <div className="p-2">
        {/* Preview Image */}
        <div className="relative w-full h-20 mb-2 rounded overflow-hidden bg-stone-50 flex items-center justify-center">
          <img
            src={style.preview}
            alt={style.name}
            className="w-full h-full object-contain"
          />

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Style Name */}
        <div className="text-xs font-medium text-stone-900 text-center truncate">
          {style.name}
        </div>

        {/* Style Description (optional, shown on hover) */}
        <div className="text-[10px] text-stone-500 text-center line-clamp-2 mt-0.5">
          {style.description}
        </div>
      </div>
    </Card>
  );
}
