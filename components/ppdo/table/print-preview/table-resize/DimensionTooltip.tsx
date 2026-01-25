// app/dashboard/project/[year]/components/table-resize/DimensionTooltip.tsx

'use client';

import React from 'react';
import {
  TOOLTIP_BG_COLOR,
  TOOLTIP_TEXT_COLOR,
  TOOLTIP_OFFSET,
  TRANSITION_DURATION,
} from './constants';

interface DimensionTooltipProps {
  x: number;
  y: number;
  dimension: number;
  type: 'width' | 'height';
  visible: boolean;
}

/**
 * DimensionTooltip Component
 *
 * Displays dimension feedback during resize operations
 * Shows current width or height in pixels
 */
export function DimensionTooltip({
  x,
  y,
  dimension,
  type,
  visible,
}: DimensionTooltipProps) {
  if (!visible) return null;

  const label = type === 'width' ? 'Width' : 'Height';
  const positionStyle: React.CSSProperties = {
    left: `${x + TOOLTIP_OFFSET}px`,
    top: `${y - TOOLTIP_OFFSET}px`,
    transform: 'translate(0, -100%)',
  };

  return (
    <div
      className="fixed z-[100] pointer-events-none select-none"
      style={positionStyle}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="px-2 py-1 rounded shadow-lg text-xs font-mono whitespace-nowrap transition-opacity"
        style={{
          backgroundColor: TOOLTIP_BG_COLOR,
          color: TOOLTIP_TEXT_COLOR,
          transitionDuration: `${TRANSITION_DURATION}ms`,
        }}
      >
        {Math.round(dimension)}px
      </div>
      {/* Arrow pointing down */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `4px solid ${TOOLTIP_BG_COLOR}`,
        }}
      />
    </div>
  );
}
