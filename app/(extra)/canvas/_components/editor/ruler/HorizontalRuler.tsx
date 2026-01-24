// app/(extra)/canvas/_components/editor/ruler/HorizontalRuler.tsx

'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { RulerState, RulerUnit, MarginSettings, IndentSettings, TabStop, TabStopType } from '../types';
import { RULER_HEIGHT, POINTS_PER_INCH, CM_PER_INCH } from '../constants';

interface HorizontalRulerProps {
  width: number;
  rulerState: RulerState;
  onMarginChange: (side: keyof MarginSettings, value: number) => void;
  onIndentChange: (type: keyof IndentSettings, value: number) => void;
  onTabStopAdd: (position: number, type?: TabStopType) => string;
  onTabStopUpdate: (id: string, updates: Partial<Omit<TabStop, 'id'>>) => void;
  onTabStopRemove: (id: string) => void;
  scrollLeft?: number;
  leftOffset?: number;
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

// Convert display units to pixels
const unitToPixels = (value: number, unit: RulerUnit, zoom: number): number => {
  let pixels: number;
  switch (unit) {
    case 'inches':
      pixels = value * POINTS_PER_INCH;
      break;
    case 'cm':
      pixels = (value / CM_PER_INCH) * POINTS_PER_INCH;
      break;
    case 'pixels':
      pixels = value;
      break;
  }
  return pixels * zoom;
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

export default function HorizontalRuler({
  width,
  rulerState,
  onMarginChange,
  onIndentChange,
  onTabStopAdd,
  onTabStopUpdate,
  onTabStopRemove,
  scrollLeft = 0,
  leftOffset = 0,
}: HorizontalRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    type: 'leftMargin' | 'rightMargin' | 'firstLineIndent' | 'hangingIndent' | 'leftIndent' | 'rightIndent' | 'tabStop';
    id?: string;
    startX: number;
    startValue: number;
  } | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  const { unit, zoom, margins, indents, tabStops } = rulerState;
  const scaledWidth = width * zoom;
  const tickInterval = getTickInterval(unit, zoom);

  // Generate tick marks
  const ticks = useMemo(() => {
    const result: { position: number; type: 'major' | 'minor'; label?: string }[] = [];
    const majorInterval = tickInterval.major * zoom;
    const minorInterval = tickInterval.minor * zoom;
    const labelInterval = tickInterval.label * zoom;

    for (let pos = 0; pos <= scaledWidth; pos += minorInterval) {
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
        position: pos,
        type: isMajor ? 'major' : 'minor',
        label,
      });
    }
    return result;
  }, [scaledWidth, tickInterval, unit, zoom]);

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    type: 'leftMargin' | 'rightMargin' | 'firstLineIndent' | 'hangingIndent' | 'leftIndent' | 'rightIndent' | 'tabStop',
    startValue: number,
    id?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ type, id, startX: e.clientX, startValue });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !rulerRef.current) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const newValue = Math.max(0, Math.min(x, scaledWidth));

    switch (dragging.type) {
      case 'leftMargin':
        onMarginChange('left', newValue / zoom);
        break;
      case 'rightMargin':
        onMarginChange('right', (scaledWidth - newValue) / zoom);
        break;
      case 'firstLineIndent':
        onIndentChange('firstLine', Math.max(0, newValue / zoom - margins.left));
        break;
      case 'hangingIndent':
        onIndentChange('hanging', Math.max(0, newValue / zoom - margins.left));
        break;
      case 'leftIndent':
        onIndentChange('left', Math.max(0, newValue / zoom - margins.left));
        break;
      case 'rightIndent':
        onIndentChange('right', Math.max(0, (scaledWidth - newValue) / zoom - margins.right));
        break;
      case 'tabStop':
        if (dragging.id) {
          onTabStopUpdate(dragging.id, { position: newValue / zoom });
        }
        break;
    }
  }, [dragging, scrollLeft, scaledWidth, zoom, margins, onMarginChange, onIndentChange, onTabStopUpdate]);

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

  // Handle double-click to add tab stop
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const position = x / zoom;

    // Only add tab stops within the content area (between margins)
    if (position > margins.left && position < width - margins.right) {
      onTabStopAdd(position, 'left');
    }
  }, [scrollLeft, zoom, margins, width, onTabStopAdd]);

  // Handle right-click on tab stop to remove
  const handleTabStopContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onTabStopRemove(id);
  }, [onTabStopRemove]);

  const leftMarginPos = margins.left * zoom;
  const rightMarginPos = scaledWidth - margins.right * zoom;
  const firstLineIndentPos = leftMarginPos + indents.firstLine * zoom;
  const hangingIndentPos = leftMarginPos + indents.hanging * zoom;
  const leftIndentPos = leftMarginPos + indents.left * zoom;
  const rightIndentPos = rightMarginPos - indents.right * zoom;

  return (
    <div
      ref={rulerRef}
      className="relative bg-stone-100 border-b border-stone-300 select-none overflow-hidden"
      style={{
        height: RULER_HEIGHT,
        width: scaledWidth,
        marginLeft: leftOffset,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Ruler background with content area highlight */}
      <div
        className="absolute top-0 bottom-0 bg-white"
        style={{
          left: leftMarginPos,
          right: scaledWidth - rightMarginPos,
        }}
      />

      {/* Tick marks */}
      <svg className="absolute inset-0" style={{ width: scaledWidth, height: RULER_HEIGHT }}>
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.position}
              y1={tick.type === 'major' ? 8 : 14}
              x2={tick.position}
              y2={RULER_HEIGHT}
              stroke="#78716c"
              strokeWidth={tick.type === 'major' ? 1 : 0.5}
            />
            {tick.label && (
              <text
                x={tick.position}
                y={7}
                textAnchor="middle"
                fontSize="9"
                fill="#57534e"
                fontFamily="system-ui, sans-serif"
              >
                {tick.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Left margin marker */}
      <div
        className={`absolute top-0 cursor-ew-resize group ${dragging?.type === 'leftMargin' ? 'z-20' : 'z-10'}`}
        style={{ left: leftMarginPos - 4 }}
        onMouseDown={(e) => handleMouseDown(e, 'leftMargin', margins.left)}
        onMouseEnter={() => setHoveredMarker('leftMargin')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <div className={`w-2 h-full transition-colors ${
          hoveredMarker === 'leftMargin' || dragging?.type === 'leftMargin'
            ? 'bg-blue-500'
            : 'bg-blue-400'
        }`} style={{ height: RULER_HEIGHT }} />
        {(hoveredMarker === 'leftMargin' || dragging?.type === 'leftMargin') && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            Left Margin
          </div>
        )}
      </div>

      {/* Right margin marker */}
      <div
        className={`absolute top-0 cursor-ew-resize group ${dragging?.type === 'rightMargin' ? 'z-20' : 'z-10'}`}
        style={{ left: rightMarginPos - 4 }}
        onMouseDown={(e) => handleMouseDown(e, 'rightMargin', margins.right)}
        onMouseEnter={() => setHoveredMarker('rightMargin')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <div className={`w-2 h-full transition-colors ${
          hoveredMarker === 'rightMargin' || dragging?.type === 'rightMargin'
            ? 'bg-blue-500'
            : 'bg-blue-400'
        }`} style={{ height: RULER_HEIGHT }} />
        {(hoveredMarker === 'rightMargin' || dragging?.type === 'rightMargin') && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            Right Margin
          </div>
        )}
      </div>

      {/* First line indent marker (triangle pointing down) */}
      <div
        className={`absolute cursor-ew-resize ${dragging?.type === 'firstLineIndent' ? 'z-20' : 'z-10'}`}
        style={{ left: firstLineIndentPos - 5, top: 2 }}
        onMouseDown={(e) => handleMouseDown(e, 'firstLineIndent', indents.firstLine)}
        onMouseEnter={() => setHoveredMarker('firstLineIndent')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <svg width="10" height="8" viewBox="0 0 10 8">
          <polygon
            points="5,8 0,0 10,0"
            fill={hoveredMarker === 'firstLineIndent' || dragging?.type === 'firstLineIndent' ? '#22c55e' : '#4ade80'}
          />
        </svg>
        {(hoveredMarker === 'firstLineIndent' || dragging?.type === 'firstLineIndent') && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            First Line Indent
          </div>
        )}
      </div>

      {/* Left indent / Hanging indent marker (triangle pointing up + rectangle) */}
      <div
        className={`absolute cursor-ew-resize ${dragging?.type === 'leftIndent' ? 'z-20' : 'z-10'}`}
        style={{ left: leftIndentPos - 5, bottom: 2 }}
        onMouseDown={(e) => handleMouseDown(e, 'leftIndent', indents.left)}
        onMouseEnter={() => setHoveredMarker('leftIndent')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <polygon
            points="5,0 0,8 10,8"
            fill={hoveredMarker === 'leftIndent' || dragging?.type === 'leftIndent' ? '#f97316' : '#fb923c'}
          />
          <rect
            x="1"
            y="8"
            width="8"
            height="2"
            fill={hoveredMarker === 'leftIndent' || dragging?.type === 'leftIndent' ? '#f97316' : '#fb923c'}
          />
        </svg>
        {(hoveredMarker === 'leftIndent' || dragging?.type === 'leftIndent') && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            Left Indent
          </div>
        )}
      </div>

      {/* Right indent marker */}
      <div
        className={`absolute cursor-ew-resize ${dragging?.type === 'rightIndent' ? 'z-20' : 'z-10'}`}
        style={{ left: rightIndentPos - 5, bottom: 2 }}
        onMouseDown={(e) => handleMouseDown(e, 'rightIndent', indents.right)}
        onMouseEnter={() => setHoveredMarker('rightIndent')}
        onMouseLeave={() => setHoveredMarker(null)}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <polygon
            points="5,0 0,8 10,8"
            fill={hoveredMarker === 'rightIndent' || dragging?.type === 'rightIndent' ? '#f97316' : '#fb923c'}
          />
        </svg>
        {(hoveredMarker === 'rightIndent' || dragging?.type === 'rightIndent') && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
            Right Indent
          </div>
        )}
      </div>

      {/* Tab stops */}
      {tabStops.map((tab) => {
        const tabPos = tab.position * zoom;
        return (
          <div
            key={tab.id}
            className={`absolute cursor-ew-resize ${dragging?.id === tab.id ? 'z-20' : 'z-10'}`}
            style={{ left: tabPos - 4, bottom: 2 }}
            onMouseDown={(e) => handleMouseDown(e, 'tabStop', tab.position, tab.id)}
            onContextMenu={(e) => handleTabStopContextMenu(e, tab.id)}
            onMouseEnter={() => setHoveredMarker(`tab-${tab.id}`)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <TabStopIcon
              type={tab.type}
              isActive={hoveredMarker === `tab-${tab.id}` || dragging?.id === tab.id}
            />
            {(hoveredMarker === `tab-${tab.id}` || dragging?.id === tab.id) && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30">
                {tab.type.charAt(0).toUpperCase() + tab.type.slice(1)} Tab
              </div>
            )}
          </div>
        );
      })}

      {/* Dragging line indicator */}
      {dragging && (
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none z-30"
          style={{
            left: (() => {
              switch (dragging.type) {
                case 'leftMargin': return margins.left * zoom;
                case 'rightMargin': return scaledWidth - margins.right * zoom;
                case 'firstLineIndent': return leftMarginPos + indents.firstLine * zoom;
                case 'leftIndent': return leftMarginPos + indents.left * zoom;
                case 'rightIndent': return rightMarginPos - indents.right * zoom;
                case 'tabStop': {
                  const tab = tabStops.find(t => t.id === dragging.id);
                  return tab ? tab.position * zoom : 0;
                }
                default: return 0;
              }
            })(),
          }}
        />
      )}
    </div>
  );
}

// Tab stop icon component
function TabStopIcon({ type, isActive }: { type: TabStopType; isActive: boolean }) {
  const color = isActive ? '#7c3aed' : '#a78bfa';

  switch (type) {
    case 'left':
      return (
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M0,0 L0,8 L8,8" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      );
    case 'center':
      return (
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M4,0 L4,8 M0,8 L8,8" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      );
    case 'right':
      return (
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M8,0 L8,8 L0,8" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      );
    case 'decimal':
      return (
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M4,0 L4,8 M0,8 L8,8" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="6" cy="4" r="1" fill={color} />
        </svg>
      );
  }
}
