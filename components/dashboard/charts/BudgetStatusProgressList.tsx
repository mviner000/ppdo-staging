"use client";

import { DashboardChartCard } from "./DashboardChartCard";
import { useAccentColor } from "../../../contexts/AccentColorContext";

interface DistributionItem {
    label: string;
    value: number;
    subValue: string;
    percentage: number;
}

interface BudgetStatusProgressListProps {
    title: string;
    subtitle?: string;
    data: DistributionItem[];
    isLoading?: boolean;
}

export function BudgetStatusProgressList({
    title,
    subtitle,
    data,
    isLoading,
}: BudgetStatusProgressListProps) {
    const { accentColorValue } = useAccentColor();

    if (isLoading) {
        return (
            <DashboardChartCard title={title} height={300}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-300"></div>
                </div>
            </DashboardChartCard>
        );
    }

    return (
        <DashboardChartCard title={title} subtitle={subtitle} height={300}>
            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {data.map((item) => (
                    <div key={item.label} className="space-y-2 group">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                                {item.label}
                            </span>
                            <div className="flex gap-3 items-baseline">
                                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    {item.subValue}
                                </span>
                                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 w-10 text-right">
                                    {item.percentage.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                                style={{ width: `${item.percentage}%`, backgroundColor: accentColorValue }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </DashboardChartCard>
    );
}
