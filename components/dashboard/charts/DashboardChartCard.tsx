"use client";

import { ReactNode } from "react";

interface DashboardChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    height?: number;
}

export function DashboardChartCard({
    title,
    subtitle,
    children,
    className = "",
    height = 300,
}: DashboardChartCardProps) {
    return (
        <div
            className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 p-5 sm:p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
        >
            <div className="mb-5 sm:mb-6 flex flex-col space-y-1">
                <h3
                    className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
                >
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
                )}
            </div>

            <div className="flex-1 w-full" style={{ height: `${height}px` }}>
                {children}
            </div>
        </div>
    );
}
