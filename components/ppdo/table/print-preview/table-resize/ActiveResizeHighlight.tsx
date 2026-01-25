// app/dashboard/project/[year]/components/table-resize/ActiveResizeHighlight.tsx

'use client';

import React from 'react';
import {
  ACTIVE_HIGHLIGHT_COLOR,
  ACTIVE_BORDER_COLOR,
  ACTIVE_BORDER_WIDTH,
  TRANSITION_DURATION,
  RESIZE_EASING,
} from './constants';

interface ActiveResizeHighlightProps {
  type: 'column' | 'row';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
  prefersReducedMotion?: boolean;
}

/**
 * ActiveResizeHighlight Component
 *
 * Displays a visual highlight on the column or row being actively resized
 * Features:
 * - Subtle background tint
 * - 2px border in active color
 * - Smooth transitions (unless reduced motion is preferred)
 */
export function ActiveResizeHighlight({
  type,
  bounds,
  visible,
  prefersReducedMotion = false,
}: ActiveResizeHighlightProps) {
  if (!visible) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${bounds.x}px`,
    top: `${bounds.y}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    backgroundColor: ACTIVE_HIGHLIGHT_COLOR,
    border: `${ACTIVE_BORDER_WIDTH}px solid ${ACTIVE_BORDER_COLOR}`,
    borderRadius: '2px',
    pointerEvents: 'none',
    zIndex: 35, // Below resize handles (z-50) but above content
    transition: prefersReducedMotion
      ? 'none'
      : `all ${TRANSITION_DURATION}ms ${RESIZE_EASING}`,
    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1)',
  };

  return (
    <div
      style={style}
      role="presentation"
      aria-label={`Resizing ${type}`}
    />
  );
}
