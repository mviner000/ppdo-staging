// app/(extra)/canvas/_components/editor/ruler/VerticalRuler.tsx

'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { RulerState, RulerUnit, MarginSettings } from '../types';
import { RULER_WIDTH, POINTS_PER_INCH, CM_PER_INCH, HEADER_HEIGHT, FOOTER_HEIGHT } from '../constants';

interface VerticalRulerProps {
  height: number;
  rulerState: RulerState;
  onMarginChange: (side: keyof MarginSettings, value: number) => void;
  scrollTop?: number;
  topOffset?: number;
  showHeaderFooter?: boolean;
}

// Convert pixels to display units
const pixelsToUnit = (pixels: number, unit: RulerUnit, zoom: number): number => {
  const actualPixels = pixels / zoom;
  switch (unit) {
    case 'inches':
      return actualPixels / POINTS_PER_INCH;
    case 'cm':
      return (actualPixels / POINTS_PER_INCH) * CM_PER_INCH;
    case 'pixels':
      return actualPixels;
  }
};

// Get tick interval based on unit and zoom
const getTickInterval = (unit: RulerUnit, zoom: number): { major: number; minor: number; label: number } => {
  switch (unit) {
    case 'inches':
      if (zoom >= 2) {
        return { major: POINTS_PER_INCH / 4, minor: POINTS_PER_INCH / 16, label: POINTS_PER_INCH / 4 };
      } else if (zoom >= 1) {
        return { major: POINTS_PER_INCH / 2, minor: POINTS_PER_INCH / 8, label: POINTS_PER_INCH / 2 };
      } else {
        return { major: POINTS_PER_INCH, minor: POINTS_PER_INCH / 4, label: POINTS_PER_INCH };
      }
    case 'cm':
      const cmToPixels = POINTS_PER_INCH / CM_PER_INCH;
      if (zoom >= 2) {
        return { major: cmToPixels / 2, minor: cmToPixels / 10, label: cmToPixels / 2 };
      } else if (zoom >= 1) {
        return { major: cmToPixels, minor: cmToPixels / 5, label: cmToPixels };
      } else {
        return { major: cmToPixels * 2, minor: cmToPixels / 2, label: cmToPixels * 2 };
      }
    case 'pixels':
      if (zoom >= 2) {
        return { major: 50, minor: 10, label: 50 };
      } else if (zoom >= 1) {
        return { major: 100, minor: 25, label: 100 };
      } else {
        return { major: 200, minor: 50, label: 200 };
      }
  }
};

export default function VerticalRuler({
  height,
  rulerState,
  onMarginChange,
  scrollTop = 0,
  topOffset = 0,
  showHeaderFooter = true,
}: VerticalRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    type: 'topMargin' | 'bottomMargin';
    startY: number;
    startValue: number;
  } | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  const { unit, zoom, margins } = rulerState;

  // Calculate total height including header and footer
  const headerHeight = showHeaderFooter ? HEADER_HEIGHT * zoom : 0;
  const footerHeight = showHeaderFooter ? FOOTER_HEIGHT * zoom : 0;
  const bodyHeight = height * zoom;
  const totalHeight = headerHeight + bodyHeight + footerHeight;

  const tickInterval = getTickInterval(unit, zoom);

  // Generate tick marks for the body area only (starting from 0 at the top of body content)
  const ticks = useMemo(() => {
    const result: { position: number; type: 'major' | 'minor'; label?: string }[] = [];
    const majorInterval = tickInterval.major * zoom;
    const minorInterval = tickInterval.minor * zoom;
    const labelInterval = tickInterval.label * zoom;

    for (let pos = 0; pos <= bodyHeight; pos += minorInterval) {
      const isMajor = Math.abs(pos % majorInterval) < 0.1 || Math.abs((pos % majorInterval) - majorInterval) < 0.1;
      const isLabel = Math.abs(pos % labelInterval) < 0.1 || Math.abs((pos % labelInterval) - labelInterval) < 0.1;

      let label: string | undefined;
      if (isLabel && pos > 0) {
        const value = pixelsToUnit(pos, unit, zoom);
        if (unit === 'pixels') {
          label = Math.round(value).toString();
        } else {
          label = value.toFixed(unit === 'inches' ? 1 : 0);
        }
      }

      result.push({
        position: headerHeight + pos,
        type: isMajor ? 'major' : 'minor',
        label,
      });
    }
    return result;
  }, [bodyHeight, headerHeight, tickInterval, unit, zoom]);

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    type: 'topMargin' | 'bottomMargin',
    startValue: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ type, startY: e.clientY, startValue });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !rulerRef.current) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top + scrollTop - headerHeight;
    const newValue = Math.max(0, Math.min(y, bodyHeight));

    switch (dragging.type) {
      case 'topMargin':
        onMarginChange('top', newValue / zoom);
        break;
      case 'bottomMargin':
        onMarginChange('bottom', (bodyHeight - newValue) / zoom);
        break;
    }
  }, [dragging, scrollTop, headerHeight, bodyHeight, zoom, onMarginChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const topMarginPos = headerHeight + margins.top * zoom;
  const bottomMarginPos = headerHeight + bodyHeight - margins.bottom * zoom;

  return (
    <div
      ref={rulerRef}
      className="relative bg-stone-100 border-r border-stone-300 select-none overflow-hidden"
      style={{
        width: RULER_WIDTH,
        height: totalHeight,
        marginTop: topOffset,
      }}
    >
      {/* Header section background */}
      {showHeaderFooter && (
        <div
          className="absolute left-0 right-0 bg-stone-200/50"
          style={{ top: 0, height: headerHeight }}
        />
      )}

      {/* Content area highlight (between margins) */}
      <div
        className="absolute left-0 right-0 bg-white"
        style={{
          top: topMarginPos,
          bottom: totalHeight - bottomMarginPos,
        }}
      />

      {/* Footer section background */}
      {showHeaderFooter && (
        <div
          className="absolute left-0 right-0 bg-stone-200/50"
          style={{ top: headerHeight + bodyHeight, height: footerHeight }}
        />
      )}

      {/* Tick marks */}
      <svg className="absolute inset-0" style={{ width: RULER_WIDTH, height: totalHeight }}>
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.type === 'major' ? 8 : 14}
              y1={tick.position}
              x2={RULER_WIDTH}
              y2={tick.position}
              stroke="#78716c"
              strokeWidth={tick.type === 'major' ? 1 : 0.5}
            />
            {tick.label && (
              <text
                x={6}
                y={tick.position}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="#57534e"
                fontFamily="system-ui, sans-serif"
                transform={`rotate(-90, 6, ${tick.position})`}
              >
                {tick.label}
              </text>
            )}
          </g>
        ))}

        {/* Header/Footer separators */}
        {showHeaderFooter && (
          <>
            <line
              x1={0}
              y1={headerHeight}
              x2={RULER_WIDTH}
              y2={headerHeight}
              stroke="#a8a29e"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <line
              x1={0}
              y1={headerHeight + bodyHeight}
              x2={RULER_WIDTH}
              y2={headerHeight + bodyHeight}
              stroke="#a8a29e"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
          </>
        )}
      </svg>

      {/* Top margin marker */}
      <div
        className={`absolute left-0 right-0 cursor-ns-resize ${dragging?.type === 'topMargin' ? 'z-20' : 'z-10'}`}
        style={{ top: topMarginPos - 4 }}
        onMouseDown={(e) => handleMouseDown(e, 'topMargin', margins.top)}
        onMouseEnter={() => setHoveredMarker('topMargin')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <div className={`h-2 transition-colors ${
          hoveredMarker === 'topMargin' || dragging?.type === 'topMargin'
            ? 'bg-blue-500'
            : 'bg-blue-400'
        }`} />
        {(hoveredMarker === 'topMargin' || dragging?.type === 'topMargin') && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            Top Margin
          </div>
        )}
      </div>

      {/* Bottom margin marker */}
      <div
        className={`absolute left-0 right-0 cursor-ns-resize ${dragging?.type === 'bottomMargin' ? 'z-20' : 'z-10'}`}
        style={{ top: bottomMarginPos - 4 }}
        onMouseDown={(e) => handleMouseDown(e, 'bottomMargin', margins.bottom)}
        onMouseEnter={() => setHoveredMarker('bottomMargin')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <div className={`h-2 transition-colors ${
          hoveredMarker === 'bottomMargin' || dragging?.type === 'bottomMargin'
            ? 'bg-blue-500'
            : 'bg-blue-400'
        }`} />
        {(hoveredMarker === 'bottomMargin' || dragging?.type === 'bottomMargin') && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            Bottom Margin
          </div>
        )}
      </div>

      {/* Dragging line indicator */}
      {dragging && (
        <div
          className="absolute left-0 right-0 h-px bg-blue-500 pointer-events-none z-30"
          style={{
            top: dragging.type === 'topMargin'
              ? topMarginPos
              : bottomMarginPos,
          }}
        />
      )}
    </div>
  );
}
