/**
 * Hook to detect and respect user's prefers-reduced-motion preference
 * Returns animation config that respects accessibility settings
 */
import { useEffect, useState } from "react";
import { EasingFunction } from "framer-motion";

export interface AnimationConfig {
  duration: number;
  ease: EasingFunction;
  shouldAnimate: boolean;
}

/**
 * Custom cubic-bezier ease-out: cubic-bezier(0.2, 0, 0, 1)
 */
const customEase: EasingFunction = (t: number) => {
  return 1 - Math.pow(1 - t, 3); // Simple ease-out cubic
};

/**
 * Returns animation configuration based on user's motion preference
 * If user prefers reduced motion, returns disabled animations
 */
export function useReducedMotion(): AnimationConfig {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Check media query on mount
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setShouldAnimate(!prefersReduced);

    // Listen for changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return {
    duration: shouldAnimate ? 0.22 : 0,
    ease: customEase,
    shouldAnimate,
  };
}
