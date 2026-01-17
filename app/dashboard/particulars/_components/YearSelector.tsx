// app/dashboard/particulars/_components/YearSelector.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, Calendar } from "lucide-react";

interface YearSelectorProps {
  selectedYear: string;
  availableYears: number[];
  onYearChange: (year: string) => void;
}

export function YearSelector({ selectedYear, availableYears, onYearChange }: YearSelectorProps) {
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const years = [{ id: "all", label: "All Years" }, ...availableYears.map(year => ({ id: year.toString(), label: year.toString() }))];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowRightArrow(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [availableYears]);

  const handleYearClick = (yearId: string) => {
    onYearChange(yearId);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleScrollChange = () => {
    checkScroll();
  };

  return (
    <div className="relative w-full bg-background border-b">
      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScrollChange}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3"
      >
        {years.map((year) => (
          <button
            key={year.id}
            onClick={() => handleYearClick(year.id)}
            className={`cursor-pointer group relative whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-amber-400 ${
              selectedYear === year.id
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{year.label}</span>
            </div>
            {selectedYear === year.id && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-300/40 to-amber-500/40 opacity-100 transition-opacity" />
            )}
          </button>
        ))}
      </div>

      {/* Right arrow button */}
      {showRightArrow && (
        <button
          onClick={handleScroll}
          className="absolute right-0 top-0 flex h-full w-12 items-center justify-center bg-gradient-to-l from-background via-background to-transparent transition-all duration-200 hover:from-muted dark:from-background dark:via-background dark:to-transparent"
          aria-label="Scroll years right"
        >
          <ChevronRight className="h-5 w-5 text-foreground dark:text-primary-foreground" />
        </button>
      )}

      {/* Hide scrollbar with CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}