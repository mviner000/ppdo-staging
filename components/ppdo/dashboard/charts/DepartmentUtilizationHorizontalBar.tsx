"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";
import { useAccentColor } from "@/contexts/AccentColorContext";


interface UtilizationData {
    department: string;
    rate: number;
}

interface DepartmentUtilizationHorizontalBarProps {
    data: UtilizationData[];
    isLoading?: boolean;
}

// Helper function to truncate text with ellipsis
function truncateText(text: string, maxLength: number = 12): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

export function DepartmentUtilizationHorizontalBar({
    data,
    isLoading,
}: DepartmentUtilizationHorizontalBarProps) {
    const { accentColorValue } = useAccentColor();

    if (isLoading) {
        return (
            <DashboardChartCard title="Department Utilization" height={300}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: accentColorValue }}></div>
                </div>
            </DashboardChartCard>
        );
    }

    return (
        <DashboardChartCard
            title="Department Budget Utilization"
            subtitle="Utilization rate (%) by implementing office"
            height={300}
        >
            <div className="flex flex-col h-full">
                {/* Scale Header Row */}
                <div className="flex items-center mb-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <div style={{ width: 100 }}></div>
                    <div className="flex-1 flex justify-between px-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                hide
                            />
                            <YAxis
                                dataKey="department"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#52525b", fontSize: 11, fontWeight: 500 }}
                                className="dark:fill-zinc-300"
                                width={100}
                                tickFormatter={(value) => truncateText(value, 12)}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                formatter={(value: number | undefined) => [
                                    value !== undefined ? `${value.toFixed(1)}%` : "0.0%",
                                    "Utilization",
                                ]}
                                labelFormatter={(label) => label}
                                contentStyle={{
                                    backgroundColor: "#FFF",
                                    borderRadius: "10px",
                                    border: "none",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    fontSize: "13px",
                                }}
                                wrapperClassName="dark:[&>div]:!bg-zinc-800 dark:[&>div]:!text-zinc-50"
                            />
                            {/* Reference lines for visual scale */}
                            <ReferenceLine x={50} stroke="#e4e4e7" strokeDasharray="3 3" />
                            <Bar dataKey="rate" fill={accentColorValue} radius={[0, 4, 4, 0]} barSize={24}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={accentColorValue} fillOpacity={1 - (index * 0.05)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardChartCard>
    );
}

