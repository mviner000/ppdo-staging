"use client";

import { useState } from "react";
import { DashboardChartCard } from "./DashboardChartCard";
import { TimelineData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface ProjectActivityTimelineProps {
    data: TimelineData;
    isLoading?: boolean;
}

export function ProjectActivityTimeline({ data, isLoading }: ProjectActivityTimelineProps) {
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    // Get all available years and sort them
    const years = Object.keys(data || {}).sort((a, b) => parseInt(a) - parseInt(b));

    // Default to latest year if none selected
    const currentYear = selectedYear || (years.length > 0 ? years[years.length - 1] : new Date().getFullYear().toString());

    if (isLoading) {
        return (
            <DashboardChartCard title="Project Activity Trends" height={340}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearData = data?.[currentYear] || Array(12).fill(0);
    const maxVal = Math.max(...yearData, 5); // Minimum scale of 5 for visual balance

    return (
        <DashboardChartCard
            title="Project Activity Trends"
            subtitle="Monthly project activity density"
            height={340}
        >
            <div className="flex flex-col h-full pl-2">
                {/* Years Selector (Top Bar) */}
                <div className="flex items-center gap-1 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {years.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded transition-colors",
                                currentYear === year
                                    ? "bg-green-700 text-white"
                                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            )}
                        >
                            {year}
                        </button>
                    ))}
                </div>

                {/* Timeline Visualization */}
                <div className="flex-1 flex flex-col justify-end pb-2">
                    <div className="flex items-end justify-between h-48 gap-px">
                        {yearData.map((val, idx) => {
                            const heightPercent = (val / maxVal) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                    <div
                                        className="w-full bg-green-700/80 hover:bg-green-700 transition-all rounded-t-sm relative"
                                        style={{ height: `${Math.max(heightPercent, 2)}%` }} // Minimum height to show bar exists
                                    >
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10 transition-opacity">
                                            {val} Projects
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-medium rotate-0">
                                        {months[idx]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardChartCard>
    );
}
