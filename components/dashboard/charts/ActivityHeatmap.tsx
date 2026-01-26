"use client";

import { DashboardChartCard } from "./DashboardChartCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { useAccentColor } from "../../../contexts/AccentColorContext";

interface HeatmapData {
    label: string;
    values: number[]; // 12 values for 12 months
}

interface ActivityHeatmapProps {
    data: HeatmapData[];
    isLoading?: boolean;
}

export function ActivityHeatmap({ data, isLoading }: ActivityHeatmapProps) {
    const { accentColorValue } = useAccentColor();
    const months = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm"]; // Aligning with reference labels
    const displayMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (isLoading) {
        return (
            <DashboardChartCard title="Project Activity" height={340}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-300"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const getOpacity = (val: number) => {
        if (val === 0) return 0.05;
        if (val < 2) return 0.2;
        if (val < 4) return 0.4;
        if (val < 6) return 0.7;
        return 1;
    };

    return (
        <DashboardChartCard
            title="Project Activity Trends"
            subtitle="Monthly project activity density by department"
            height={340}
        >
            <div className="flex flex-col h-full">
                {/* Month Labels */}
                <div className="grid grid-cols-12 ml-28 mb-4">
                    {displayMonths.map((m) => (
                        <div key={m} className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center font-semibold">
                            {m}
                        </div>
                    ))}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                    {data.map((row) => (
                        <div key={row.label} className="flex items-center group">
                            {/* Row Label */}
                            <div className="w-28 text-[11px] text-zinc-600 dark:text-zinc-400 truncate pr-4 font-semibold transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-50">
                                {row.label}
                            </div>

                            {/* Heatmap Cells */}
                            <div className="flex-1 grid grid-cols-12 gap-1.5 h-7">
                                <TooltipProvider delayDuration={0}>
                                    {row.values.map((val, idx) => (
                                        <Tooltip key={`${row.label}-${idx}`}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="rounded transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-zinc-400 dark:hover:ring-zinc-500 hover:scale-110"
                                                    style={{
                                                        backgroundColor: accentColorValue,
                                                        opacity: getOpacity(val)
                                                    }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px] bg-zinc-900 dark:bg-zinc-800 text-white border-none px-2 py-1">
                                                <p className="font-bold">{row.label}</p>
                                                <p>{displayMonths[idx]}: {val} activity</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-5 flex items-center justify-end gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">Less</span>
                    <div className="flex gap-1.5">
                        <div className="w-3.5 h-3 rounded" style={{ backgroundColor: accentColorValue, opacity: 0.05 }} />
                        <div className="w-3.5 h-3 rounded" style={{ backgroundColor: accentColorValue, opacity: 0.2 }} />
                        <div className="w-3.5 h-3 rounded" style={{ backgroundColor: accentColorValue, opacity: 0.4 }} />
                        <div className="w-3.5 h-3 rounded" style={{ backgroundColor: accentColorValue, opacity: 0.7 }} />
                        <div className="w-3.5 h-3 rounded" style={{ backgroundColor: accentColorValue, opacity: 1 }} />
                    </div>
                    <span className="font-semibold">More</span>
                </div>
            </div>
        </DashboardChartCard>
    );
}
