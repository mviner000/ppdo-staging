// app/dashboard/project/[year]/components/table-resize/TableResizeHandle.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  RESIZE_HANDLE_WIDTH,
  RESIZE_HANDLE_VISUAL_WIDTH,
  RESIZE_HANDLE_ACTIVE_WIDTH,
  RESIZE_HANDLE_COLOR,
  RESIZE_HANDLE_HOVER_OPACITY,
  RESIZE_HANDLE_ACTIVE_OPACITY,
  TRANSITION_DURATION,
  HANDLE_HIT_AREA_EXTENSION,
  HOVER_SCALE,
  FOCUS_RING_WIDTH,
  FOCUS_RING_COLOR,
  TOUCH_TARGET_SIZE,
  DESKTOP_HANDLE_WIDTH,
} from './constants';
import { TableResizeHandleProps } from './types';

/**
 * TableResizeHandle Component
 *
 * Renders an individual resize handle for columns or rows
 * Features:
 * - Touch-friendly hit area (44px on mobile, 8px on desktop)
 * - Extended hit area (+4px on each side)
 * - Subtle visual indicator on hover with scale effect
 * - Bold indicator when active (dragging)
 * - Smooth transitions
 * - Proper cursor feedback with delay
 * - High-contrast focus ring for accessibility
 * - Screen reader support
 */
export function TableResizeHandle({
  type,
  position,
  length,
  isHovered,
  isActive,
  onMouseDown,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}: TableResizeHandleProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect touch device and reduced motion preference
  useEffect(() => {
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchDevice);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate styles based on type
  const isColumn = type === 'column';
  const cursorClass = isColumn ? 'cursor-col-resize' : 'cursor-row-resize';

  // Determine handle width based on device
  const handleWidth = isTouchDevice ? TOUCH_TARGET_SIZE : DESKTOP_HANDLE_WIDTH;
  const extendedWidth = handleWidth + HANDLE_HIT_AREA_EXTENSION * 2;

  // Position styles with extended hit area
  const positionStyle: React.CSSProperties = isColumn
    ? {
        left: position.x ? `${position.x}px` : 0,
        top: position.y || 0,
        width: `${extendedWidth}px`,
        height: `${length}px`,
        transform: `translateX(-${extendedWidth / 2}px)`,
      }
    : {
        left: position.x || 0,
        top: position.y ? `${position.y}px` : 0,
        width: `${length}px`,
        height: `${extendedWidth}px`,
        transform: `translateY(-${extendedWidth / 2}px)`,
      };

  // Visual indicator styles with hover scale
  const scale = prefersReducedMotion ? 1 : (isHovered && !isActive ? HOVER_SCALE : 1);
  const visualWidth = isActive ? RESIZE_HANDLE_ACTIVE_WIDTH : RESIZE_HANDLE_VISUAL_WIDTH;

  const indicatorStyle: React.CSSProperties = isColumn
    ? {
        width: `${visualWidth}px`,
        height: '100%',
        left: '50%',
        transform: `translateX(-50%) scaleX(${scale})`,
      }
    : {
        height: `${visualWidth}px`,
        width: '100%',
        top: '50%',
        transform: `translateY(-50%) scaleY(${scale})`,
      };

  // Opacity based on state
  const opacity = isActive
    ? RESIZE_HANDLE_ACTIVE_OPACITY
    : isHovered
    ? RESIZE_HANDLE_HOVER_OPACITY
    : 0;

  // Focus ring styles
  const focusRingStyle: React.CSSProperties = isFocused
    ? {
        outline: `${FOCUS_RING_WIDTH}px solid ${FOCUS_RING_COLOR}`,
        outlineOffset: '2px',
      }
    : {};

  return (
    <div
      className={`absolute pointer-events-auto z-50 ${cursorClass} transition-all`}
      style={{
        ...positionStyle,
        ...focusRingStyle,
        transitionDuration: prefersReducedMotion ? '0ms' : `${TRANSITION_DURATION}ms`,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="separator"
      aria-label={`Resize ${type === 'column' ? 'column' : 'row'}. Use arrow keys to adjust size.`}
      aria-orientation={isColumn ? 'vertical' : 'horizontal'}
      aria-valuetext={`${type === 'column' ? 'Column width' : 'Row height'}`}
      tabIndex={0}
    >
      {/* Visual indicator - visible on hover, focus, or active */}
      <div
        className="absolute transition-all ease-in-out"
        style={{
          ...indicatorStyle,
          backgroundColor: RESIZE_HANDLE_COLOR,
          opacity: isFocused ? RESIZE_HANDLE_HOVER_OPACITY : opacity,
          transitionDuration: prefersReducedMotion ? '0ms' : `${TRANSITION_DURATION}ms`,
          boxShadow: isActive ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none',
        }}
      />

      {/* Screen reader announcement for first time hover */}
      {isHovered && (
        <span className="sr-only" role="tooltip">
          Drag to resize {type}, or double-click to auto-fit
        </span>
      )}
    </div>
  );
}
