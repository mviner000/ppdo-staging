"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";

interface StatusData {
    status: "ongoing" | "completed" | "delayed" | "not_started";
    count: number;
}

interface StatusPieProps {
    data: StatusData[];
    isLoading?: boolean;
}

export function StatusDistributionPie({ data, isLoading }: StatusPieProps) {
    if (isLoading) {
        return (
            <DashboardChartCard title="Project Distribution" height={340}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-300"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const COLORS: Record<string, string> = {
        ongoing: "#3b82f6",   // Blue-500
        completed: "#10b981", // Emerald-500
        delayed: "#ef4444",   // Red-500
        not_started: "#9ca3af" // Gray-400
    };

    const chartData = data
        .filter(item => item.count > 0)
        .map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace("_", " "),
            value: item.count,
            color: COLORS[item.status] || "#9ca3af"
        }));

    const totalProjects = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <DashboardChartCard
            title="Project Distribution"
            subtitle={`${totalProjects} Total Projects`}
            height={340}
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FFF",
                                    borderRadius: "10px",
                                    border: "none",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    fontSize: "12px",
                                }}
                                wrapperClassName="dark:[&>div]:!bg-zinc-800 dark:[&>div]:!text-zinc-50"
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                formatter={(value, entry: any) => (
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">{value} ({entry.payload.value})</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardChartCard>
    );
}
