// app/dashboard/project/[year]/[particularId]/components/ProjectsTable/ProjectCategoryFilter.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface ProjectCategory {
  _id: string;
  fullName: string;
  count?: number;
}

interface ProjectCategoryFilterProps {
  categories: ProjectCategory[] | undefined; // expects first item to be 'all' optionally
  selectedCategoryIds: string[];
  onSelectionChange: (categoryIds: string[]) => void;
  accentColor: string;
}

/**
 * YouTube-style category filter pills
 * Horizontal scrollable, sticky on scroll, updates URL
 */
export function ProjectCategoryFilter({
  categories,
  selectedCategoryIds,
  onSelectionChange,
  accentColor,
}: ProjectCategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const animationConfig = useReducedMotion();

  // Check scroll position to show/hide scroll indicators
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleToggleCategory = (categoryId: string) => {
    const newSelection = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (!categories || categories.length === 0) return null;

  const allCategories = categories || [];

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="relative flex items-center">
        {/* Left Scroll Indicator */}
          {showLeftScroll && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent cursor-pointer"
            aria-label="Scroll left"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        )}

        {/* Scrollable Categories */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Clear All Button (only show when filters active) */}
          <AnimatePresence mode="wait">
            {selectedCategoryIds.length > 0 && (
              <motion.button
                key="clear-btn"
                onClick={handleClearAll}
                initial={animationConfig.shouldAnimate ? { opacity: 0, scale: 0.95, width: 0 } : { opacity: 1, scale: 1 }}
                animate={animationConfig.shouldAnimate ? { opacity: 1, scale: 1, width: "auto" } : { opacity: 1, scale: 1 }}
                exit={animationConfig.shouldAnimate ? { opacity: 0, scale: 0.95, width: 0 } : { opacity: 1, scale: 1 }}
                transition={{
                  duration: animationConfig.duration,
                  ease: animationConfig.ease,
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </motion.button>
            )}
          </AnimatePresence>

          {/* Category Pills */}
          {allCategories.map((category) => {
            const isAll = category._id === "all";
            const isSelected = isAll
              ? selectedCategoryIds.length === 0
              : selectedCategoryIds.includes(category._id);

            const baseClass = `flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all cursor-pointer`;
            const selectedStyle: React.CSSProperties | undefined = isSelected
              ? { borderColor: accentColor, color: accentColor, backgroundColor: "transparent", boxShadow: `inset 0 0 0 1px ${accentColor}` }
              : undefined;

            const pillClass = isSelected
              ? baseClass
              : baseClass + " bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800";

            const count = category.count ?? 0;

            return (
              <motion.button
                key={category._id}
                onClick={() => {
                  if (isAll) {
                    handleClearAll();
                  } else {
                    handleToggleCategory(category._id);
                  }
                }}
                initial={false}
                animate={{ scale: isSelected ? 1 : 0.98, opacity: 1 }}
                whileHover={animationConfig.shouldAnimate ? { scale: isSelected ? 1.05 : 1.02 } : {}}
                transition={{ duration: animationConfig.duration, ease: animationConfig.ease }}
                className={pillClass}
                style={selectedStyle}
                aria-pressed={isSelected}
                aria-label={`${category.fullName}, ${count} items`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{category.fullName}</span>
                <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full ${isSelected ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700'}`}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Right Scroll Indicator */}
        {showRightScroll && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent cursor-pointer"
            aria-label="Scroll right"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}