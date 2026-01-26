"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AccentColorContextType {
  accentColorValue: string;
  setAccentColor: (color: string) => void;
  gradientStart: string;
  gradientEnd: string;
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(
  undefined
);

// Legacy color name mapping for backward compatibility
const legacyColorMap: Record<string, string> = {
  green: "#15803d",
  blue: "#3b82f6",
  purple: "#9333ea",
  orange: "#f59e0b",
  red: "#ef4444",
  teal: "#14b8a6",
};

// Default color
const DEFAULT_COLOR = "#15803D";

// Helper to lighten a hex color
const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    (num >> 16) + Math.round((255 - (num >> 16)) * percent)
  );
  const g = Math.min(
    255,
    ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * percent)
  );
  const b = Math.min(
    255,
    (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * percent)
  );
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// Helper to darken a hex color
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.round(((num >> 8) & 0x00ff) * (1 - percent)));
  const b = Math.max(0, Math.round((num & 0x0000ff) * (1 - percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accentColorValue, setAccentColorValueState] =
    useState<string>(DEFAULT_COLOR);

  useEffect(() => {
    const savedColor = localStorage.getItem("accentColor");
    if (savedColor) {
      // Check if it's a legacy color name or a hex color
      if (savedColor.startsWith("#")) {
        // It's already a hex color
        setAccentColorValueState(savedColor);
      } else if (legacyColorMap[savedColor]) {
        // It's a legacy color name, convert it
        const hexColor = legacyColorMap[savedColor];
        setAccentColorValueState(hexColor);
        localStorage.setItem("accentColor", hexColor); // Update to hex
      }
    }
  }, []);

  useEffect(() => {
    // Update CSS variables when accent color changes
    document.documentElement.style.setProperty("--accent-color", accentColorValue);

    // We can also update the translucent version if needed
    const r = parseInt(accentColorValue.slice(1, 3), 16);
    const g = parseInt(accentColorValue.slice(3, 5), 16);
    const b = parseInt(accentColorValue.slice(5, 7), 16);
    document.documentElement.style.setProperty("--accent-color-rgb", `${r}, ${g}, ${b}`);
  }, [accentColorValue]);

  const setAccentColor = (color: string) => {
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      setAccentColorValueState(color);
      localStorage.setItem("accentColor", color);
    }
  };

  // Generate gradients from base color
  const gradientStart = lightenColor(accentColorValue, 0.4);
  const gradientEnd = darkenColor(accentColorValue, 0.2);

  return (
    <AccentColorContext.Provider
      value={{
        accentColorValue,
        setAccentColor,
        gradientStart,
        gradientEnd,
      }}
    >
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error(
      "useAccentColor must be used within an AccentColorProvider"
    );
  }
  return context;
}
