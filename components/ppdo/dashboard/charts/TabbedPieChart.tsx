"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";
import { DashboardPieChartData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface TabbedPieChartProps {
    data: DashboardPieChartData;
    isLoading?: boolean;
}

// Helper to format values based on tab type
function formatValue(value: number, tabType: string): string {
    if (tabType === 'finance' || tabType === 'budget') {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    }
    return value.toLocaleString();
}

export function TabbedPieChart({ data, isLoading }: TabbedPieChartProps) {
    const [activeTab, setActiveTab] = useState<keyof DashboardPieChartData>("budget");

    const tabs: { key: keyof DashboardPieChartData; label: string }[] = [
        { key: "budget", label: "Budget" },
        { key: "sector", label: "Sector" },
        { key: "finance", label: "Finance" },
        { key: "status", label: "Status" },
        { key: "department", label: "Department" },
    ];

    if (isLoading) {
        return (
            <DashboardChartCard title="Distribution Overview" height={340}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const activeData = data?.[activeTab] || [];
    const hasData = activeData.length > 0 && activeData.some(d => d.value > 0);

    // Calculate total for subtitle
    const totalValue = activeData.reduce((sum, item) => sum + item.value, 0);
    const getSubtitle = () => {
        if (!hasData) return "Breakdown by category";
        if (activeTab === 'sector') return `${totalValue} total projects`;
        if (activeTab === 'finance') return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            notation: "compact"
        }).format(totalValue) + " total budget";
        if (activeTab === 'status') return `${totalValue} total projects`;
        if (activeTab === 'department') return `Top ${activeData.length} departments`;
        if (activeTab === 'budget') return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            notation: "compact"
        }).format(totalValue) + " total allocated";
        return "Breakdown by category";
    };

    return (
        <DashboardChartCard
            title="Distribution Overview"
            subtitle={getSubtitle()}
            height={340}
        >
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 w-fit mx-auto sm:mx-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-all",
                                activeTab === tab.key
                                    ? "bg-white dark:bg-zinc-700 text-green-700 dark:text-green-400 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-0">
                    {!hasData ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 px-4">
                            <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm font-medium mb-1">No {activeTab} data yet</span>
                            <span className="text-xs text-center max-w-xs">
                                {activeTab === 'sector' && 'Projects will appear here once they are assigned to categories'}
                                {activeTab === 'finance' && 'Budget data will be displayed when budget items are added'}
                                {activeTab === 'status' && 'Project status distribution will show once projects are created'}
                                {activeTab === 'department' && 'Department distribution will appear when projects are assigned to offices'}
                                {activeTab === 'budget' && 'Budget allocation breakdown will appear when budget data is available'}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center h-full gap-4">
                            {/* Pie Chart */}
                            <div className="flex-shrink-0" style={{ width: 180, height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                        <Pie
                                            data={activeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {activeData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color || "#15803D"}
                                                    strokeWidth={0}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#FFF",
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                fontSize: "13px",
                                            }}
                                            itemStyle={{ color: "#374151" }}
                                            formatter={(value: number | undefined) => {
                                                if (value === undefined) return ["0", ""];
                                                if (activeTab === 'finance' || activeTab === 'budget') {
                                                    return [new Intl.NumberFormat("en-PH", {
                                                        style: "currency",
                                                        currency: "PHP",
                                                        notation: "compact",
                                                    }).format(value), "Amount"];
                                                }
                                                return [value.toString(), ""];
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Custom Legend with Values */}
                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                                {activeData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2 min-w-0">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate flex-1">
                                            {entry.name}
                                        </span>
                                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                                            {formatValue(entry.value, activeTab)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardChartCard>
    );
}

