// components/ppdo/dashboard/landing/FiscalYearLandingCard.tsx
"use client";

import { ChevronDown, MoreVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FiscalYearStats } from "@/types/dashboard";

interface FiscalYearLandingCardProps {
  fiscalYear: {
    _id: string;
    year: number;
    label?: string;
    stats: FiscalYearStats;
  };
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
  accentColor?: string;
  index?: number;
}

export function FiscalYearLandingCard({
  fiscalYear,
  onOpen,
  onDelete,
  accentColor = "#15803D", // Default to green
  index = 0,
}: FiscalYearLandingCardProps) {
  const yellowColor = "#EAB308"; // Folders are always yellow

  return (
    <div
      className="relative h-[180px] w-full group cursor-pointer"
      style={{
        animation: `fadeInSlide 0.3s ease-out ${index * 0.05}s both`,
      }}
      onClick={onOpen}
    >
      {/* BASE FOLDER VIEW */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-300",
          "group-hover:opacity-0 group-hover:scale-90"
        )}
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          <svg
            className="w-full h-full drop-shadow-md"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <path
              d="M12 48C10.3431 48 9 46.6569 9 45V16C9 14.3431 10.3431 13 12 13H26L28 17H52C53.6569 17 55 18.3431 55 20V45C55 46.6569 53.6569 48 52 48H12Z"
              className="fill-black/10 translate-x-0.5 translate-y-0.5"
            />
            {/* Folder body - main yellow */}
            <path
              d="M8 44C8 45.6569 9.34315 47 11 47H50C51.6569 47 53 45.6569 53 44V19C53 17.3431 51.6569 16 50 16H26L24 12H11C9.34315 12 8 13.3431 8 15V44Z"
              className="fill-yellow-400 dark:fill-yellow-500 group-hover:fill-yellow-500 dark:group-hover:fill-yellow-400 transition-colors"
            />
            {/* Folder tab - lighter yellow */}
            <path
              d="M8 15C8 13.3431 9.34315 12 11 12H26L28 16H50C51.6569 16 53 17.3431 53 19V21H8V15Z"
              className="fill-yellow-300 dark:fill-yellow-600 group-hover:fill-yellow-400 dark:group-hover:fill-yellow-500 transition-colors"
            />
            {/* Highlights */}
            <path
              d="M11 12H26L28 16H50C51.6569 16 53 17.3431 53 19V20H8V15C8 13.3431 9.34315 12 11 12Z"
              className="fill-white/30"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {fiscalYear.year}
          </p>
        </div>
      </div>

      {/* EXPANDED CARD HOVER VIEW */}
      <Card
        className={cn(
          "absolute inset-0 p-3 flex flex-col opacity-0 scale-95 pointer-events-none transition-all duration-300",
          "group-hover:opacity-100 group-hover:scale-110 group-hover:pointer-events-auto",
          "border-l-4 overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl z-20",
          "border-zinc-200 dark:border-zinc-800"
        )}
        style={{
          borderLeftColor: accentColor,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
              {fiscalYear.year}
            </h3>
            {fiscalYear.label && (
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate max-w-[100px] -mt-0.5">
                {fiscalYear.label}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-700 text-xs">
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          <div className="space-y-0">
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tight">Projects</p>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 -mt-0.5">
              {fiscalYear.stats.projectCount}
            </p>
          </div>
          <div className="text-right space-y-0">
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tight">Utilized</p>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 -mt-0.5">
              ₱{(fiscalYear.stats.totalBudgetUtilized / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1 mt-auto">
          <div className="flex justify-between items-center text-[8px] font-bold uppercase text-zinc-500">
            <span>Utilization</span>
            <span style={{ color: accentColor }}>
              {fiscalYear.stats.utilizationRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, fiscalYear.stats.utilizationRate)}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>

        {/* Footer Link Hint */}
        <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[8px] font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
            OPEN DASHBOARD
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-400 -rotate-90" />
        </div>
      </Card>
    </div>
  );
}
