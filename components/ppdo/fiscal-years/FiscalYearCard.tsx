"use client";

import { Folder, Calendar, ChevronDown, MoreVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface FiscalYearStats {
    _id: Id<"fiscalYears">;
    year: number;
    description?: string;
    isCurrent?: boolean;
}

interface FiscalYearCardProps {
    fiscalYear: FiscalYearStats;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onOpen: () => void;
    onDelete: (e: React.MouseEvent) => void;
    accentColor?: string;
    statsContent: React.ReactNode;
    expandedContent: React.ReactNode;
    openButtonLabel?: string;
    index?: number;
}

export function FiscalYearCard({
    fiscalYear,
    isExpanded,
    onToggleExpand,
    onOpen,
    onDelete,
    accentColor = "#15803D",
    statsContent,
    expandedContent,
    openButtonLabel = "Open Budget",
    index = 0
}: FiscalYearCardProps) {
    return (
        <div
            className="relative"
            style={{
                animation: `fadeInSlide 300ms ease-out ${index * 50}ms both`,
            }}
        >
            <Card
                className="group relative transition-all hover:shadow-md overflow-hidden bg-white dark:bg-zinc-950 cursor-pointer"
                onClick={onOpen}
            >
                {/* Main Card Header Content */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">

                    {/* Left: Icon and Basic Info */}
                    <div className="flex items-start gap-3 w-full sm:w-auto sm:flex-1 min-w-0 relative">
                        <div className="flex flex-1 items-start gap-3 min-w-0">
                            <div
                                className="p-3 rounded-lg shrink-0"
                                style={{
                                    backgroundColor: fiscalYear.isCurrent
                                        ? `${accentColor}30`
                                        : "#fef3c7",
                                    color: fiscalYear.isCurrent ? accentColor : "#b45309",
                                }}
                            >
                                <Folder className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    {fiscalYear.isCurrent && (
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded"
                                            style={{
                                                backgroundColor: `${accentColor}20`,
                                                color: accentColor,
                                            }}
                                        >
                                            Current
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {fiscalYear.year}
                                    </div>
                                </div>
                                {fiscalYear.description && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
                                        {fiscalYear.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Mobile: Menu Button on the top right via absolute positioning to save space */}
                        <div className="sm:hidden absolute top-0 right-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-zinc-500"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={onDelete}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Right Group: Stats & Actions */}
                    <div className="flex flex-col gap-3 w-full sm:w-auto items-start sm:items-end">

                        {/* Stats Row */}
                        <div className="flex w-full sm:w-auto justify-around sm:justify-end gap-2 sm:gap-4 px-2 sm:px-0">
                            {statsContent}
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                            <div className="flex gap-2 w-full">
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpen();
                                    }}
                                    className="text-white flex-1 whitespace-nowrap min-w-[100px]"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {openButtonLabel}
                                </Button>

                                {/* Desktop: Menu Button */}
                                <div className="hidden sm:block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="px-2"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={onDelete}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleExpand();
                                }}
                                className={cn(
                                    "cursor-grab w-full flex items-center justify-between py-1.5 px-3 text-xs border rounded-md transition-colors",
                                    "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                                    "text-zinc-700 dark:text-zinc-300"
                                )}
                            >
                                <span>DETAILS</span>
                                <ChevronDown
                                    className={cn(
                                        "w-4 h-4 transition-transform duration-200",
                                        isExpanded && "rotate-180"
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Stats Wrapper - Removed, merged into middle section above for better layout */}

                {/* Expandable Content */}
                {isExpanded && (
                    <div className="px-5 pb-5 pt-0 space-y-4">
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                        {expandedContent}
                    </div>
                )}

                {/* Decorative bottom border on hover */}
                <div
                    className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background: `linear-gradient(to right, ${accentColor}40, ${accentColor}80)`,
                    }}
                />
            </Card>
            {/* Include the keyframe style at usage site or globally, but here we can rely on it being present or duplicate it in a safe way if needed. 
          Actually, we should probably assume the global style is handled or include it in the component if scoped styles were supported easily. 
          For now, I'll assume the pages will still have the animation style or I'll add it to the header/layout if I cleaner way exists.
          The original code had <style jsx global> for the animation. I'll probably want to keep that in the pages or move it to a global css.
       */}
        </div>
    );
}
