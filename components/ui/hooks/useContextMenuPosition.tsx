"use client";

import { useRef, useLayoutEffect, useState } from "react";

type Style = { top: number; left: number } | {};

/**
 * Hook to position a fixed context menu so it stays in viewport.
 * Returns a `ref` to attach to the menu element and a `style` object
 * with computed `top` and `left` coordinates (in px).
 */
export function useContextMenuPosition(x: number, y: number, margin = 8) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<Style>({});

  useLayoutEffect(() => {
    if (x == null || y == null) return;

    const el = ref.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // If the element hasn't been measured yet, use a default guess and
    // schedule a second measurement after it's rendered.
    const measure = () => {
      const rect = el?.getBoundingClientRect();
      const menuW = rect?.width ?? 220;
      const menuH = rect?.height ?? 160;

      let left = x;
      if (left + menuW > vw - margin) {
        left = Math.max(margin, vw - menuW - margin);
      }
      if (left < margin) left = margin;

      // Prefer showing below the click point; if no room, show above.
      const fitsBelow = y + menuH <= vh - margin;
      const fitsAbove = y - menuH >= margin;
      let top = y;
      if (!fitsBelow && fitsAbove) {
        top = Math.max(margin, y - menuH);
      } else if (!fitsBelow && !fitsAbove) {
        // Clamp to viewport when menu is taller than available space
        top = Math.max(margin, Math.min(y, vh - menuH - margin));
      }

      setStyle({ top, left });
    };

    // measure in next animation frame to ensure element is in DOM
    requestAnimationFrame(measure);
  }, [x, y, margin]);

  return { ref, style } as { ref: typeof ref; style: Style };
}
