import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiscalYearHeaderProps {
    title: string;
    subtitle?: string;
    onAddYear: () => void;
    onOpenLatest?: () => void;
    hasYears: boolean;
    accentColor?: string;
    className?: string;
}

export function FiscalYearHeader({
    title,
    subtitle,
    onAddYear,
    onOpenLatest,
    hasYears,
    accentColor = "#15803D", // Default green for Project
    className
}: FiscalYearHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3", className)}>
            <div>
                <h1
                    className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {hasYears && onOpenLatest && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenLatest}
                        className="flex-1 sm:flex-none"
                    >
                        Open Latest
                    </Button>
                )}
                <Button
                    size="sm"
                    onClick={onAddYear}
                    className="text-white flex-1 sm:flex-none"
                    style={{ backgroundColor: accentColor }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Year
                </Button>
            </div>
        </div>
    );
}
